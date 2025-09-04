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

    const webhookData = await req.json()
    
    console.log('Received WhatsApp webhook:', JSON.stringify(webhookData, null, 2))

    // Validate webhook data structure
    if (!webhookData.data || !webhookData.event) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook data structure' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { event, data } = webhookData
    let processedData = null

    // Process different types of WhatsApp events
    switch (event) {
      case 'messages.upsert':
        processedData = await processIncomingMessage(supabaseClient, data)
        break
        
      case 'messages.update':
        processedData = await processMessageUpdate(supabaseClient, data)
        break
        
      case 'connection.update':
        processedData = await processConnectionUpdate(supabaseClient, data)
        break
        
      case 'qr':
        processedData = await processQRCode(supabaseClient, data)
        break
        
      default:
        console.log(`Unhandled event type: ${event}`)
        processedData = { message: 'Event received but not processed', event }
    }

    // Log the webhook processing
    await supabaseClient
      .from('api_logs')
      .insert({
        endpoint: 'process-whatsapp-notifications',
        method: 'POST',
        request_data: webhookData,
        response_data: processedData,
        status_code: 200,
        user_id: 'webhook'
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp notification processed successfully',
        event: event,
        processed_data: processedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-whatsapp-notifications:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Process incoming WhatsApp messages
async function processIncomingMessage(supabaseClient: any, data: any) {
  try {
    const messages = data.messages || []
    const processedMessages = []

    for (const message of messages) {
      const { key, message: msgContent, messageTimestamp, pushName } = message
      const fromNumber = key.remoteJid?.replace('@s.whatsapp.net', '')
      
      if (!fromNumber || key.fromMe) {
        continue // Skip messages from bot or invalid numbers
      }

      // Extract message text
      let messageText = ''
      if (msgContent.conversation) {
        messageText = msgContent.conversation
      } else if (msgContent.extendedTextMessage?.text) {
        messageText = msgContent.extendedTextMessage.text
      }

      if (!messageText) {
        continue // Skip non-text messages for now
      }

      // Check if this is a support request or order inquiry
      const isOrderInquiry = /pedido|order|status|rastreamento|tracking/i.test(messageText)
      const isSupport = /ajuda|help|suporte|support|problema|issue/i.test(messageText)

      // Store the message
      const { data: storedMessage, error } = await supabaseClient
        .from('whatsapp_messages')
        .insert({
          message_id: key.id,
          from_number: fromNumber,
          from_name: pushName || 'Unknown',
          message_text: messageText,
          message_type: 'incoming',
          timestamp: new Date(messageTimestamp * 1000).toISOString(),
          is_order_inquiry: isOrderInquiry,
          is_support_request: isSupport,
          raw_data: message
        })
        .select()
        .single()

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error storing WhatsApp message:', error)
        continue
      }

      // Auto-respond based on message content
      let autoResponse = null
      
      if (isOrderInquiry) {
        autoResponse = await handleOrderInquiry(supabaseClient, fromNumber, messageText)
      } else if (isSupport) {
        autoResponse = await handleSupportRequest(supabaseClient, fromNumber, messageText)
      } else {
        // General greeting/info
        autoResponse = {
          message: `Olá! 👋 Sou o assistente do InstaFly.\n\nPara consultar seu pedido, envie: *pedido [seu email]*\nPara suporte, envie: *ajuda*\n\nOu acesse nosso site: ${Deno.env.get('VITE_APP_URL') || 'https://instafly.com'}`,
          type: 'greeting'
        }
      }

      // Send auto-response if generated
      if (autoResponse) {
        try {
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-whatsapp`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              phone_number: fromNumber,
              message: autoResponse.message
            })
          })
        } catch (sendError) {
          console.error('Error sending auto-response:', sendError)
        }
      }

      processedMessages.push({
        message_id: key.id,
        from_number: fromNumber,
        processed: true,
        auto_response: autoResponse?.type || null
      })
    }

    return {
      type: 'incoming_messages',
      processed_count: processedMessages.length,
      messages: processedMessages
    }

  } catch (error) {
    console.error('Error processing incoming messages:', error)
    return { type: 'incoming_messages', error: error.message }
  }
}

// Handle order inquiry messages
async function handleOrderInquiry(supabaseClient: any, fromNumber: string, messageText: string) {
  try {
    // Extract email from message (simple regex)
    const emailMatch = messageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    
    if (!emailMatch) {
      return {
        message: `Para consultar seu pedido, envie:\n*pedido seuemail@exemplo.com*\n\nSubstitua pelo email usado na compra.`,
        type: 'order_inquiry_help'
      }
    }

    const email = emailMatch[0]
    
    // Find recent orders for this email
    const { data: orders, error } = await supabaseClient
      .from('orders')
      .select(`
        id,
        status,
        instagram_username,
        quantity,
        total_amount,
        created_at,
        services (name)
      `)
      .eq('customer_email', email)
      .order('created_at', { ascending: false })
      .limit(3)

    if (error || !orders || orders.length === 0) {
      return {
        message: `Não encontrei pedidos para o email ${email}.\n\nVerifique se o email está correto ou entre em contato conosco.`,
        type: 'order_not_found'
      }
    }

    // Format order status message
    let statusMessage = `📋 *Seus pedidos recentes:*\n\n`
    
    orders.forEach((order, index) => {
      const statusEmoji = {
        'pending': '⏳',
        'processing': '🔄',
        'in_progress': '⚡',
        'completed': '✅',
        'cancelled': '❌',
        'failed': '⚠️'
      }[order.status] || '📋'

      const statusText = {
        'pending': 'Pendente',
        'processing': 'Processando',
        'in_progress': 'Em andamento',
        'completed': 'Concluído',
        'cancelled': 'Cancelado',
        'failed': 'Falhou'
      }[order.status] || order.status

      statusMessage += `${statusEmoji} *Pedido ${index + 1}*\n`
      statusMessage += `Serviço: ${order.services?.name || 'N/A'}\n`
      statusMessage += `Instagram: @${order.instagram_username}\n`
      statusMessage += `Status: ${statusText}\n`
      statusMessage += `Quantidade: ${order.quantity}\n\n`
    })

    statusMessage += `Para mais detalhes, acesse: ${Deno.env.get('VITE_APP_URL') || 'https://instafly.com'}`

    return {
      message: statusMessage,
      type: 'order_status'
    }

  } catch (error) {
    console.error('Error handling order inquiry:', error)
    return {
      message: 'Desculpe, houve um erro ao consultar seus pedidos. Tente novamente em alguns minutos.',
      type: 'order_inquiry_error'
    }
  }
}

// Handle support request messages
async function handleSupportRequest(supabaseClient: any, fromNumber: string, messageText: string) {
  return {
    message: `🆘 *Suporte InstaFly*\n\nRecebemos sua mensagem e nossa equipe entrará em contato em breve.\n\n📞 *Contatos:*\n• WhatsApp: Este número\n• Email: suporte@instafly.com\n• Site: ${Deno.env.get('VITE_APP_URL') || 'https://instafly.com'}\n\n⏰ Horário de atendimento: 9h às 18h`,
    type: 'support_response'
  }
}

// Process message status updates
async function processMessageUpdate(supabaseClient: any, data: any) {
  // Handle message delivery status, read receipts, etc.
  return {
    type: 'message_update',
    message: 'Message update processed'
  }
}

// Process connection status updates
async function processConnectionUpdate(supabaseClient: any, data: any) {
  // Handle WhatsApp connection status changes
  return {
    type: 'connection_update',
    status: data.connection || 'unknown'
  }
}

// Process QR code updates
async function processQRCode(supabaseClient: any, data: any) {
  // Handle QR code for WhatsApp connection
  return {
    type: 'qr_code',
    message: 'QR code received'
  }
}