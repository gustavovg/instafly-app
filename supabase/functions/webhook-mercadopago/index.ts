import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MercadoPagoWebhook {
  id: number
  live_mode: boolean
  type: string
  date_created: string
  application_id: number
  user_id: number
  version: number
  api_version: string
  action: string
  data: {
    id: string
  }
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

    // Get MercadoPago access token
    const mercadoPagoToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!mercadoPagoToken) {
      return new Response('MercadoPago token not configured', { status: 500 })
    }

    // Parse webhook data
    const webhookData: MercadoPagoWebhook = await req.json()
    
    console.log('MercadoPago webhook received:', webhookData)

    // Only process payment notifications
    if (webhookData.type !== 'payment') {
      return new Response('OK', { status: 200 })
    }

    // Get payment details from MercadoPago
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${webhookData.data.id}`,
      {
        headers: {
          'Authorization': `Bearer ${mercadoPagoToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!paymentResponse.ok) {
      console.error('Failed to fetch payment details from MercadoPago')
      return new Response('Failed to fetch payment details', { status: 500 })
    }

    const paymentData = await paymentResponse.json()
    console.log('Payment data from MercadoPago:', paymentData)

    // Extract order information
    const orderId = paymentData.external_reference
    const paymentStatus = paymentData.status
    const paymentId = paymentData.id.toString()

    if (!orderId) {
      console.error('No order ID found in payment data')
      return new Response('No order ID found', { status: 400 })
    }

    // Update payment log
    const { error: updateLogError } = await supabaseClient
      .from('payment_logs')
      .update({
        status: paymentStatus,
        mercadopago_data: paymentData,
        updated_at: new Date().toISOString(),
      })
      .eq('payment_id', paymentId)

    if (updateLogError) {
      console.error('Error updating payment log:', updateLogError)
    }

    // Update order based on payment status
    let orderStatus = 'pending'
    let shouldProcessOrder = false

    switch (paymentStatus) {
      case 'approved':
        orderStatus = 'paid'
        shouldProcessOrder = true
        break
      case 'pending':
        orderStatus = 'pending_payment'
        break
      case 'in_process':
        orderStatus = 'processing_payment'
        break
      case 'rejected':
      case 'cancelled':
        orderStatus = 'payment_failed'
        break
      default:
        orderStatus = 'pending_payment'
    }

    // Update order in database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .update({
        payment_status: paymentStatus,
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('user_id, service_id, quantity, target_url')
      .single()

    if (orderError) {
      console.error('Error updating order:', orderError)
      return new Response('Error updating order', { status: 500 })
    }

    // If payment is approved, start processing the order
    if (shouldProcessOrder && order) {
      try {
        // Here you would integrate with your service providers (Instagram, TikTok, etc.)
        // For now, we'll just update the status to processing
        await supabaseClient
          .from('orders')
          .update({
            status: 'processing',
            started_at: new Date().toISOString(),
          })
          .eq('id', orderId)

        // Send notification to user
        await supabaseClient.functions.invoke('send-push-notification', {
          body: {
            user_id: order.user_id,
            title: 'Pagamento Aprovado!',
            body: `Seu pagamento foi aprovado e o pedido #${orderId} está sendo processado.`,
          },
        })

        // Send WhatsApp notification
        await supabaseClient.functions.invoke('send-whatsapp', {
          body: {
            user_id: order.user_id,
            message: `🎉 Pagamento aprovado! Seu pedido #${orderId} está sendo processado. Você receberá uma notificação quando estiver concluído.`,
          },
        })

      } catch (processingError) {
        console.error('Error processing approved order:', processingError)
        // Don't return error here, payment was successful
      }
    }

    // Send appropriate notification based on payment status
    if (order) {
      let notificationTitle = ''
      let notificationBody = ''

      switch (paymentStatus) {
        case 'approved':
          notificationTitle = 'Pagamento Aprovado!'
          notificationBody = `Seu pagamento foi aprovado e o pedido está sendo processado.`
          break
        case 'pending':
          notificationTitle = 'Pagamento Pendente'
          notificationBody = `Seu pagamento está pendente. Complete o pagamento para processar seu pedido.`
          break
        case 'rejected':
          notificationTitle = 'Pagamento Rejeitado'
          notificationBody = `Seu pagamento foi rejeitado. Tente novamente ou use outro método de pagamento.`
          break
        case 'cancelled':
          notificationTitle = 'Pagamento Cancelado'
          notificationBody = `Seu pagamento foi cancelado.`
          break
      }

      if (notificationTitle) {
        await supabaseClient.functions.invoke('send-push-notification', {
          body: {
            user_id: order.user_id,
            title: notificationTitle,
            body: notificationBody,
          },
        })
      }
    }

    // Log the webhook processing
    await supabaseClient
      .from('api_logs')
      .insert({
        function_name: 'webhook-mercadopago',
        request_data: webhookData,
        response_data: { 
          payment_id: paymentId, 
          order_id: orderId, 
          status: paymentStatus 
        },
        created_at: new Date().toISOString(),
      })

    return new Response('OK', { 
      status: 200,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Error in webhook-mercadopago:', error)
    
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders,
    })
  }
})