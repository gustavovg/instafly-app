import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { order_id, new_status, provider_order_id } = await req.json()

    // Validate required fields
    if (!order_id || !new_status) {
      return new Response(
        JSON.stringify({ error: 'order_id and new_status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update order status
    const updateData: any = {
      status: new_status,
      updated_at: new Date().toISOString()
    }

    if (provider_order_id) {
      updateData.provider_order_id = provider_order_id
    }

    const { error: updateError } = await supabaseClient
      .from('orders')
      .update(updateData)
      .eq('id', order_id)

    if (updateError) {
      throw updateError
    }

    // Create notification for status change
    const statusMessages = {
      'processing': 'Seu pedido está sendo processado',
      'in_progress': 'Seu pedido está em andamento',
      'completed': 'Seu pedido foi concluído com sucesso!',
      'cancelled': 'Seu pedido foi cancelado',
      'failed': 'Houve um problema com seu pedido'
    }

    const message = statusMessages[new_status as keyof typeof statusMessages] || `Status do pedido atualizado para: ${new_status}`

    // Insert notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: order.customer_email, // Using email as user identifier
        title: 'Atualização do Pedido',
        message: message,
        type: 'order_update',
        data: {
          order_id: order_id,
          old_status: order.status,
          new_status: new_status
        }
      })

    // Send push notification if user has subscription
    if (['completed', 'failed', 'cancelled'].includes(new_status)) {
      const { data: pushSubs } = await supabaseClient
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', order.customer_email)
        .eq('is_active', true)

      if (pushSubs && pushSubs.length > 0) {
        // Call send-push-notification function
        try {
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: order.customer_email,
              title: 'Atualização do Pedido',
              message: message,
              data: { order_id: order_id }
            })
          })
        } catch (pushError) {
          console.error('Error sending push notification:', pushError)
        }
      }
    }

    // Log the API call
    await supabaseClient
      .from('api_logs')
      .insert({
        endpoint: 'sync-order-status',
        method: 'POST',
        request_data: { order_id, new_status, provider_order_id },
        response_data: { success: true, message: 'Order status updated successfully' },
        status_code: 200,
        user_id: order.customer_email
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order status updated successfully',
        order_id: order_id,
        old_status: order.status,
        new_status: new_status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sync-order-status:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})