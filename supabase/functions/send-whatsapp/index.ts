import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendWhatsAppRequest {
  user_id?: string
  phone?: string
  message: string
  instance?: string
}

interface SendWhatsAppResponse {
  success: boolean
  data?: {
    message_id: string
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
    const { user_id, phone, message, instance }: SendWhatsAppRequest = await req.json()

    // Validate required fields
    if (!message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Message is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    let targetPhone = phone

    // If user_id is provided, get phone from database
    if (user_id && !phone) {
      const { data: user, error: userError } = await supabaseClient
        .from('users')
        .select('phone')
        .eq('id', user_id)
        .single()

      if (userError || !user?.phone) {
        return new Response(
          JSON.stringify({ success: false, error: 'User phone not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      targetPhone = user.phone
    }

    if (!targetPhone) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get Evolution API credentials
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
    const evolutionInstance = instance || Deno.env.get('EVOLUTION_INSTANCE') || 'default'

    if (!evolutionApiUrl || !evolutionApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Evolution API not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Format phone number (remove special characters and ensure country code)
    const cleanPhone = targetPhone.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

    // Prepare message data for Evolution API
    const messageData = {
      number: `${formattedPhone}@s.whatsapp.net`,
      text: message,
    }

    // Send message via Evolution API
    const evolutionResponse = await fetch(
      `${evolutionApiUrl}/message/sendText/${evolutionInstance}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey,
        },
        body: JSON.stringify(messageData),
      }
    )

    if (!evolutionResponse.ok) {
      const errorData = await evolutionResponse.text()
      console.error('Evolution API error:', errorData)
      
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send WhatsApp message' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const evolutionResult = await evolutionResponse.json()
    console.log('WhatsApp message sent:', evolutionResult)

    // Save message log in database
    const { error: logError } = await supabaseClient
      .from('whatsapp_logs')
      .insert({
        user_id: user_id || null,
        phone: formattedPhone,
        message,
        message_id: evolutionResult.key?.id || null,
        status: 'sent',
        instance: evolutionInstance,
        evolution_response: evolutionResult,
        created_at: new Date().toISOString(),
      })

    if (logError) {
      console.error('Error saving WhatsApp log:', logError)
    }

    // Create notification record
    if (user_id) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id,
          type: 'whatsapp',
          title: 'Mensagem WhatsApp',
          message,
          is_read: false,
          created_at: new Date().toISOString(),
        })
    }

    // Log the API call
    await supabaseClient
      .from('api_logs')
      .insert({
        function_name: 'send-whatsapp',
        request_data: { user_id, phone: formattedPhone, message_length: message.length },
        response_data: { message_id: evolutionResult.key?.id, status: 'sent' },
        created_at: new Date().toISOString(),
      })

    const response: SendWhatsAppResponse = {
      success: true,
      data: {
        message_id: evolutionResult.key?.id || 'unknown',
        status: 'sent',
      },
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in send-whatsapp:', error)
    
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