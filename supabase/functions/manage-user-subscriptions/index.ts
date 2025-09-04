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

    const { 
      action, 
      user_id, 
      subscription_data, 
      push_subscription 
    } = await req.json()

    // Validate required fields
    if (!action || !user_id) {
      return new Response(
        JSON.stringify({ error: 'action and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result

    switch (action) {
      case 'subscribe_push':
        result = await subscribePushNotifications(supabaseClient, user_id, push_subscription)
        break
        
      case 'unsubscribe_push':
        result = await unsubscribePushNotifications(supabaseClient, user_id, push_subscription)
        break
        
      case 'get_subscriptions':
        result = await getUserSubscriptions(supabaseClient, user_id)
        break
        
      case 'update_preferences':
        result = await updateNotificationPreferences(supabaseClient, user_id, subscription_data)
        break
        
      case 'cleanup_expired':
        result = await cleanupExpiredSubscriptions(supabaseClient, user_id)
        break
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Log the API call
    await supabaseClient
      .from('api_logs')
      .insert({
        endpoint: 'manage-user-subscriptions',
        method: 'POST',
        request_data: { action, user_id },
        response_data: { success: result.success },
        status_code: result.success ? 200 : 400,
        user_id: user_id
      })

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in manage-user-subscriptions:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Subscribe to push notifications
async function subscribePushNotifications(supabaseClient: any, userId: string, pushSubscription: any) {
  try {
    if (!pushSubscription || !pushSubscription.endpoint) {
      return { success: false, error: 'Invalid push subscription data' }
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('endpoint', pushSubscription.endpoint)
      .single()

    if (existingSubscription) {
      // Update existing subscription
      const { error: updateError } = await supabaseClient
        .from('push_subscriptions')
        .update({
          p256dh_key: pushSubscription.keys?.p256dh,
          auth_key: pushSubscription.keys?.auth,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      return { 
        success: true, 
        message: 'Push subscription updated successfully',
        subscription_id: existingSubscription.id
      }
    }

    // Create new subscription
    const { data: newSubscription, error: insertError } = await supabaseClient
      .from('push_subscriptions')
      .insert({
        user_id: userId,
        endpoint: pushSubscription.endpoint,
        p256dh_key: pushSubscription.keys?.p256dh,
        auth_key: pushSubscription.keys?.auth,
        user_agent: pushSubscription.userAgent || 'Unknown',
        is_active: true
      })
      .select()
      .single()

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    // Update user notification preferences
    await supabaseClient
      .from('users')
      .update({ 
        push_notifications_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    return { 
      success: true, 
      message: 'Push subscription created successfully',
      subscription_id: newSubscription.id
    }

  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    return { success: false, error: error.message }
  }
}

// Unsubscribe from push notifications
async function unsubscribePushNotifications(supabaseClient: any, userId: string, pushSubscription?: any) {
  try {
    let query = supabaseClient
      .from('push_subscriptions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    // If specific subscription provided, unsubscribe only that one
    if (pushSubscription?.endpoint) {
      query = query.eq('endpoint', pushSubscription.endpoint)
    }

    const { error: updateError } = await query

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // If unsubscribing all, update user preferences
    if (!pushSubscription?.endpoint) {
      await supabaseClient
        .from('users')
        .update({ 
          push_notifications_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    }

    return { 
      success: true, 
      message: 'Push subscription(s) deactivated successfully'
    }

  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    return { success: false, error: error.message }
  }
}

// Get user subscriptions
async function getUserSubscriptions(supabaseClient: any, userId: string) {
  try {
    // Get push subscriptions
    const { data: pushSubscriptions, error: pushError } = await supabaseClient
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (pushError) {
      return { success: false, error: pushError.message }
    }

    // Get user notification preferences
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('push_notifications_enabled, email_notifications_enabled, whatsapp_notifications_enabled')
      .eq('id', userId)
      .single()

    if (userError) {
      return { success: false, error: userError.message }
    }

    // Get notification history (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: notifications, error: notificationsError } = await supabaseClient
      .from('notifications')
      .select('id, title, message, type, created_at, read_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(50)

    if (notificationsError) {
      console.warn('Error fetching notifications:', notificationsError)
    }

    return {
      success: true,
      data: {
        push_subscriptions: pushSubscriptions || [],
        preferences: {
          push_notifications_enabled: user?.push_notifications_enabled || false,
          email_notifications_enabled: user?.email_notifications_enabled || false,
          whatsapp_notifications_enabled: user?.whatsapp_notifications_enabled || false
        },
        recent_notifications: notifications || [],
        statistics: {
          active_push_subscriptions: pushSubscriptions?.length || 0,
          total_notifications_30d: notifications?.length || 0,
          unread_notifications: notifications?.filter(n => !n.read_at).length || 0
        }
      }
    }

  } catch (error) {
    console.error('Error getting user subscriptions:', error)
    return { success: false, error: error.message }
  }
}

// Update notification preferences
async function updateNotificationPreferences(supabaseClient: any, userId: string, preferences: any) {
  try {
    if (!preferences || typeof preferences !== 'object') {
      return { success: false, error: 'Invalid preferences data' }
    }

    const allowedFields = [
      'push_notifications_enabled',
      'email_notifications_enabled', 
      'whatsapp_notifications_enabled'
    ]

    // Filter only allowed fields
    const updateData = {}
    for (const field of allowedFields) {
      if (field in preferences) {
        updateData[field] = Boolean(preferences[field])
      }
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No valid preferences provided' }
    }

    updateData['updated_at'] = new Date().toISOString()

    const { error: updateError } = await supabaseClient
      .from('users')
      .update(updateData)
      .eq('id', userId)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // If push notifications are disabled, deactivate all push subscriptions
    if (updateData.push_notifications_enabled === false) {
      await supabaseClient
        .from('push_subscriptions')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
    }

    return {
      success: true,
      message: 'Notification preferences updated successfully',
      updated_preferences: updateData
    }

  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return { success: false, error: error.message }
  }
}

// Cleanup expired subscriptions
async function cleanupExpiredSubscriptions(supabaseClient: any, userId?: string) {
  try {
    // Mark subscriptions as inactive if they haven't been used in 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    
    let query = supabaseClient
      .from('push_subscriptions')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString(),
        deactivation_reason: 'expired_inactive'
      })
      .eq('is_active', true)
      .lt('updated_at', ninetyDaysAgo)

    // If user_id provided, cleanup only for that user
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: deactivatedSubscriptions, error: deactivateError } = await query.select()

    if (deactivateError) {
      return { success: false, error: deactivateError.message }
    }

    // Delete very old notifications (older than 6 months)
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
    
    let notificationQuery = supabaseClient
      .from('notifications')
      .delete()
      .lt('created_at', sixMonthsAgo)

    if (userId) {
      notificationQuery = notificationQuery.eq('user_id', userId)
    }

    const { error: deleteError } = await notificationQuery

    if (deleteError) {
      console.warn('Error deleting old notifications:', deleteError)
    }

    return {
      success: true,
      message: 'Cleanup completed successfully',
      statistics: {
        deactivated_subscriptions: deactivatedSubscriptions?.length || 0,
        cleanup_date: new Date().toISOString()
      }
    }

  } catch (error) {
    console.error('Error cleaning up expired subscriptions:', error)
    return { success: false, error: error.message }
  }
}