import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessOrderRequest {
  service_id: string
  quantity: number
  target_url: string
  user_id: string
  coupon_code?: string
}

interface ProcessOrderResponse {
  success: boolean
  data?: {
    order_id: string
    status: string
    total_amount: number
    estimated_completion: string
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
    const { service_id, quantity, target_url, user_id, coupon_code }: ProcessOrderRequest = await req.json()

    // Validate required fields
    if (!service_id || !quantity || !target_url || !user_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get service details
    const { data: service, error: serviceError } = await supabaseClient
      .from('services')
      .select('*')
      .eq('id', service_id)
      .single()

    if (serviceError || !service) {
      return new Response(
        JSON.stringify({ success: false, error: 'Service not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if service is active
    if (!service.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: 'Service is not available' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate quantity limits
    if (quantity < service.min_quantity || quantity > service.max_quantity) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Quantity must be between ${service.min_quantity} and ${service.max_quantity}` 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Calculate total amount
    let totalAmount = service.price_per_unit * quantity
    let discountAmount = 0

    // Apply coupon if provided
    if (coupon_code) {
      const { data: coupon } = await supabaseClient
        .from('coupons')
        .select('*')
        .eq('code', coupon_code)
        .eq('is_active', true)
        .single()

      if (coupon) {
        const now = new Date()
        const validFrom = new Date(coupon.valid_from)
        const validUntil = new Date(coupon.valid_until)

        if (now >= validFrom && now <= validUntil) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = (totalAmount * coupon.discount_value) / 100
          } else {
            discountAmount = coupon.discount_value
          }
          totalAmount -= discountAmount
        }
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id,
        service_id,
        quantity,
        target_url,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        coupon_code,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create order' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Calculate estimated completion time
    const estimatedHours = Math.ceil(quantity / service.delivery_speed_per_hour)
    const estimatedCompletion = new Date(Date.now() + estimatedHours * 60 * 60 * 1000)

    // Update order with estimated completion
    await supabaseClient
      .from('orders')
      .update({ estimated_completion: estimatedCompletion.toISOString() })
      .eq('id', order.id)

    // Send notification to user
    await supabaseClient.functions.invoke('send-push-notification', {
      body: {
        user_id,
        title: 'Pedido Criado',
        body: `Seu pedido #${order.id} foi criado com sucesso!`,
      },
    })

    // Log the order creation
    await supabaseClient
      .from('api_logs')
      .insert({
        function_name: 'process-order',
        request_data: { service_id, quantity, target_url, user_id },
        response_data: { order_id: order.id, status: 'pending' },
        created_at: new Date().toISOString(),
      })

    const response: ProcessOrderResponse = {
      success: true,
      data: {
        order_id: order.id,
        status: order.status,
        total_amount: totalAmount,
        estimated_completion: estimatedCompletion.toISOString(),
      },
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in process-order:', error)
    
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