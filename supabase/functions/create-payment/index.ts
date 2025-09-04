import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePaymentRequest {
  order_id: string
  amount: number
  description: string
  user_id: string
  payment_method?: string
}

interface CreatePaymentResponse {
  success: boolean
  data?: {
    payment_id: string
    payment_url?: string
    qr_code?: string
    status: string
  }
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Parse request body
    const { order_id, amount, description, user_id, payment_method }: CreatePaymentRequest = await req.json()

    // Validate required fields
    if (!order_id || !amount || !description || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get MercadoPago access token
    const mercadoPagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!mercadoPagoToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'MercadoPago token not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get user information
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('email, name, phone')
      .eq('id', user_id)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Prepare MercadoPago payment data
    const paymentData = {
      transaction_amount: amount,
      description: description,
      payment_method_id: payment_method || 'pix',
      payer: {
        email: user.email,
        first_name: user.name?.split(' ')[0] || 'Cliente',
        last_name: user.name?.split(' ').slice(1).join(' ') || 'InstaFly',
        phone: {
          area_code: '11',
          number: user.phone || '999999999'
        },
        identification: {
          type: 'CPF',
          number: '11111111111' // In production, get real CPF
        }
      },
      external_reference: order_id,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-mercadopago`,
      metadata: {
        order_id: order_id,
        user_id: user_id
      }
    }

    // Create payment in MercadoPago
    const mercadoPagoResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mercadoPagoToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${order_id}-${Date.now()}`
      },
      body: JSON.stringify(paymentData)
    })

    if (!mercadoPagoResponse.ok) {
      const errorData = await mercadoPagoResponse.json()
      console.error('MercadoPago API error:', errorData)
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create payment' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const paymentResult = await mercadoPagoResponse.json()

    // Save payment log in database
    const { error: logError } = await supabaseClient
      .from('payment_logs')
      .insert({
        order_id,
        user_id,
        payment_id: paymentResult.id.toString(),
        amount,
        status: paymentResult.status,
        payment_method: paymentResult.payment_method_id,
        external_reference: order_id,
        mercadopago_data: paymentResult,
        created_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('Error saving payment log:', logError)
    }

    // Update order status
    await supabaseClient
      .from('orders')
      .update({ 
        payment_id: paymentResult.id.toString(),
        payment_status: paymentResult.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)

    // Prepare response
    const response: CreatePaymentResponse = {
      success: true,
      data: {
        payment_id: paymentResult.id.toString(),
        status: paymentResult.status,
      },
    }

    // Add payment URL or QR code based on payment method
    if (paymentResult.point_of_interaction?.transaction_data?.qr_code) {
      response.data!.qr_code = paymentResult.point_of_interaction.transaction_data.qr_code
    }

    if (paymentResult.point_of_interaction?.transaction_data?.ticket_url) {
      response.data!.payment_url = paymentResult.point_of_interaction.transaction_data.ticket_url
    }

    // Send notification to user
    await supabaseClient.functions.invoke('send-push-notification', {
      body: {
        user_id,
        title: 'Pagamento Criado',
        body: `Pagamento de R$ ${amount.toFixed(2)} criado. Complete o pagamento para processar seu pedido.`,
      },
    })

    // Log the API call
    await supabaseClient
      .from('api_logs')
      .insert({
        function_name: 'create-payment',
        request_data: { order_id, amount, user_id },
        response_data: { payment_id: paymentResult.id, status: paymentResult.status },
        created_at: new Date().toISOString(),
      })

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in create-payment:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})