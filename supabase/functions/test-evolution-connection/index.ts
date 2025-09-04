import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestEvolutionResponse {
  success: boolean
  data?: {
    status: string
    instance: string
    connection_status: string
    qr_code?: string
    phone_number?: string
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

    // Get Evolution API credentials
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
    const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE') || 'default'

    if (!evolutionApiUrl || !evolutionApiKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Evolution API credentials not configured' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Test connection to Evolution API
    try {
      // First, check if instance exists
      const instanceResponse = await fetch(
        `${evolutionApiUrl}/instance/fetchInstances`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey,
          },
        }
      )

      if (!instanceResponse.ok) {
        throw new Error(`Instance check failed: ${instanceResponse.status}`)
      }

      const instances = await instanceResponse.json()
      console.log('Available instances:', instances)

      // Check connection status of our instance
      const connectionResponse = await fetch(
        `${evolutionApiUrl}/instance/connectionState/${evolutionInstance}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey,
          },
        }
      )

      let connectionData = null
      let connectionStatus = 'unknown'

      if (connectionResponse.ok) {
        connectionData = await connectionResponse.json()
        connectionStatus = connectionData.instance?.state || 'disconnected'
      }

      // If disconnected, try to get QR code
      let qrCode = null
      if (connectionStatus === 'close' || connectionStatus === 'disconnected') {
        try {
          const qrResponse = await fetch(
            `${evolutionApiUrl}/instance/connect/${evolutionInstance}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'apikey': evolutionApiKey,
              },
            }
          )

          if (qrResponse.ok) {
            const qrData = await qrResponse.json()
            qrCode = qrData.base64 || qrData.qrcode
          }
        } catch (qrError) {
          console.log('Could not get QR code:', qrError)
        }
      }

      // Get instance info if connected
      let phoneNumber = null
      if (connectionStatus === 'open') {
        try {
          const infoResponse = await fetch(
            `${evolutionApiUrl}/instance/fetchInstances?instanceName=${evolutionInstance}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'apikey': evolutionApiKey,
              },
            }
          )

          if (infoResponse.ok) {
            const infoData = await infoResponse.json()
            phoneNumber = infoData[0]?.instance?.wuid || null
          }
        } catch (infoError) {
          console.log('Could not get instance info:', infoError)
        }
      }

      // Log the test result
      await supabaseClient
        .from('api_logs')
        .insert({
          function_name: 'test-evolution-connection',
          request_data: { instance: evolutionInstance },
          response_data: { 
            connection_status: connectionStatus,
            has_qr_code: !!qrCode,
            phone_number: phoneNumber
          },
          created_at: new Date().toISOString(),
        })

      const response: TestEvolutionResponse = {
        success: true,
        data: {
          status: 'connected',
          instance: evolutionInstance,
          connection_status: connectionStatus,
        },
      }

      if (qrCode) {
        response.data!.qr_code = qrCode
      }

      if (phoneNumber) {
        response.data!.phone_number = phoneNumber
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } catch (apiError) {
      console.error('Evolution API connection error:', apiError)
      
      // Log the failed test
      await supabaseClient
        .from('api_logs')
        .insert({
          function_name: 'test-evolution-connection',
          request_data: { instance: evolutionInstance },
          response_data: { error: apiError.message },
          created_at: new Date().toISOString(),
        })

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Evolution API connection failed: ${apiError.message}` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

  } catch (error) {
    console.error('Error in test-evolution-connection:', error)
    
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