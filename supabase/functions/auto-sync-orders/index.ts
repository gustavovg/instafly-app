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

    const { force_sync = false, max_orders = 100 } = await req.json().catch(() => ({}))

    console.log('Starting auto-sync-orders process...')

    // Get orders that need status checking
    // Orders that are pending, processing, or in_progress and haven't been updated recently
    const cutoffTime = new Date(Date.now() - (force_sync ? 0 : 5 * 60 * 1000)) // 5 minutes ago
    
    const { data: orders, error: ordersError } = await supabaseClient
      .from('orders')
      .select(`
        id,
        status,
        provider_order_id,
        instagram_username,
        quantity,
        updated_at,
        created_at,
        services (name, category)
      `)
      .in('status', ['pending', 'processing', 'in_progress'])
      .lt('updated_at', cutoffTime.toISOString())
      .limit(max_orders)
      .order('created_at', { ascending: true })

    if (ordersError) {
      throw ordersError
    }

    if (!orders || orders.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No orders need syncing',
          synced_count: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${orders.length} orders to sync`)

    let syncedCount = 0
    let errorCount = 0
    const syncResults = []

    // Process each order
    for (const order of orders) {
      try {
        console.log(`Syncing order ${order.id}...`)

        // Simulate checking with external provider
        const providerStatus = await checkOrderWithProvider(order)
        
        if (providerStatus && providerStatus.status !== order.status) {
          // Status changed, update the order
          const { error: updateError } = await supabaseClient
            .from('orders')
            .update({
              status: providerStatus.status,
              updated_at: new Date().toISOString(),
              ...(providerStatus.provider_order_id && { 
                provider_order_id: providerStatus.provider_order_id 
              })
            })
            .eq('id', order.id)

          if (updateError) {
            throw updateError
          }

          // Call sync-order-status function to handle notifications
          try {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/sync-order-status`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                order_id: order.id,
                new_status: providerStatus.status,
                provider_order_id: providerStatus.provider_order_id
              })
            })
          } catch (syncError) {
            console.error('Error calling sync-order-status:', syncError)
          }

          syncResults.push({
            order_id: order.id,
            old_status: order.status,
            new_status: providerStatus.status,
            success: true
          })

          syncedCount++
        } else {
          // No status change, just update the updated_at timestamp
          await supabaseClient
            .from('orders')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', order.id)

          syncResults.push({
            order_id: order.id,
            status: order.status,
            message: 'No status change',
            success: true
          })
        }

        // Add small delay to avoid overwhelming external APIs
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (error) {
        console.error(`Error syncing order ${order.id}:`, error)
        errorCount++
        
        syncResults.push({
          order_id: order.id,
          error: error.message,
          success: false
        })
      }
    }

    // Log the sync operation
    await supabaseClient
      .from('api_logs')
      .insert({
        endpoint: 'auto-sync-orders',
        method: 'POST',
        request_data: { force_sync, max_orders },
        response_data: {
          total_orders: orders.length,
          synced_count: syncedCount,
          error_count: errorCount,
          results: syncResults
        },
        status_code: 200,
        user_id: 'system'
      })

    console.log(`Auto-sync completed: ${syncedCount} synced, ${errorCount} errors`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Auto-sync completed successfully',
        total_orders: orders.length,
        synced_count: syncedCount,
        error_count: errorCount,
        results: syncResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in auto-sync-orders:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Mock function to check order status with external provider
async function checkOrderWithProvider(order: any) {
  // In a real implementation, this would call the actual provider API
  // For now, we'll simulate the process
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock status progression based on order age
    const orderAge = Date.now() - new Date(order.created_at).getTime()
    const ageInMinutes = orderAge / (1000 * 60)
    
    let newStatus = order.status
    
    // Simulate status progression
    if (order.status === 'pending' && ageInMinutes > 2) {
      newStatus = 'processing'
    } else if (order.status === 'processing' && ageInMinutes > 5) {
      newStatus = 'in_progress'
    } else if (order.status === 'in_progress' && ageInMinutes > 15) {
      // 80% chance of completion, 20% chance of staying in progress
      newStatus = Math.random() > 0.2 ? 'completed' : 'in_progress'
    }
    
    // Simulate provider order ID assignment
    const providerOrderId = order.provider_order_id || `PROV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      status: newStatus,
      provider_order_id: providerOrderId,
      last_checked: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('Error checking with provider:', error)
    return null
  }
}