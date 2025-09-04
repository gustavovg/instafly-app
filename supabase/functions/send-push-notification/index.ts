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

    const { user_id, title, message, data, icon, badge, tag } = await req.json()

    // Validate required fields
    if (!user_id || !title || !message) {
      return new Response(
        JSON.stringify({ error: 'user_id, title, and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true)

    if (subError) {
      throw subError
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No active push subscriptions found for user',
          sent_count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@instafly.com'

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('VAPID keys not configured, using mock notification')
      
      // Create notification record even without sending
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: user_id,
          title: title,
          message: message,
          type: 'push',
          data: data || {},
          is_read: false
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Notification created (VAPID not configured)',
          sent_count: 0,
          mock: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare notification payload
    const notificationPayload = {
      title: title,
      body: message,
      icon: icon || '/icon-192x192.png',
      badge: badge || '/badge-72x72.png',
      tag: tag || 'instafly-notification',
      data: {
        ...data,
        timestamp: new Date().toISOString(),
        url: data?.url || '/'
      },
      actions: [
        {
          action: 'view',
          title: 'Ver',
          icon: '/icon-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dispensar',
          icon: '/icon-dismiss.png'
        }
      ],
      requireInteraction: false,
      silent: false
    }

    let sentCount = 0
    const failedSubscriptions = []

    // Send notification to each subscription
    for (const subscription of subscriptions) {
      try {
        // In a real implementation, you would use a library like web-push
        // For now, we'll simulate the sending process
        
        // Mock web-push sending (replace with actual implementation)
        const mockSendResult = await mockWebPushSend(
          subscription.subscription_data,
          JSON.stringify(notificationPayload),
          {
            vapidDetails: {
              subject: vapidSubject,
              publicKey: vapidPublicKey,
              privateKey: vapidPrivateKey
            }
          }
        )

        if (mockSendResult.success) {
          sentCount++
        } else {
          failedSubscriptions.push(subscription.id)
        }

      } catch (error) {
        console.error(`Failed to send push notification to subscription ${subscription.id}:`, error)
        failedSubscriptions.push(subscription.id)
        
        // Mark failed subscription as inactive if it's a permanent failure
        if (error.statusCode === 410) { // Gone - subscription expired
          await supabaseClient
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', subscription.id)
        }
      }
    }

    // Create notification record in database
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: user_id,
        title: title,
        message: message,
        type: 'push',
        data: data || {},
        is_read: false
      })

    // Log the API call
    await supabaseClient
      .from('api_logs')
      .insert({
        endpoint: 'send-push-notification',
        method: 'POST',
        request_data: { user_id, title, message, data },
        response_data: { 
          success: true, 
          sent_count: sentCount,
          failed_count: failedSubscriptions.length
        },
        status_code: 200,
        user_id: user_id
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Push notification sent successfully',
        sent_count: sentCount,
        failed_count: failedSubscriptions.length,
        total_subscriptions: subscriptions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-push-notification:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Mock web-push send function (replace with actual web-push library)
async function mockWebPushSend(subscription: any, payload: string, options: any) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Simulate success/failure (90% success rate)
  const success = Math.random() > 0.1
  
  if (success) {
    return { success: true, statusCode: 200 }
  } else {
    // Simulate different types of failures
    const failures = [400, 410, 413, 429, 500]
    const statusCode = failures[Math.floor(Math.random() * failures.length)]
    throw { success: false, statusCode, message: `Mock error ${statusCode}` }
  }
}