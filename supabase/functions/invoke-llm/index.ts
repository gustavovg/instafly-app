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
      prompt, 
      context, 
      task_type = 'general', 
      max_tokens = 500, 
      temperature = 0.7,
      user_id 
    } = await req.json()

    // Validate required fields
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get LLM configuration from environment
    const llmProvider = Deno.env.get('LLM_PROVIDER') || 'openai'
    const llmApiKey = Deno.env.get('LLM_API_KEY')
    const llmModel = Deno.env.get('LLM_MODEL') || 'gpt-3.5-turbo'

    if (!llmApiKey) {
      console.warn('LLM API key not configured, using mock response')
      return await generateMockResponse(supabaseClient, prompt, task_type, user_id)
    }

    // Prepare system prompt based on task type
    const systemPrompt = getSystemPrompt(task_type)
    
    // Prepare messages for the LLM
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(context ? [{ role: 'user', content: `Contexto: ${context}` }] : []),
      { role: 'user', content: prompt }
    ]

    let llmResponse
    
    try {
      // Call the appropriate LLM provider
      switch (llmProvider.toLowerCase()) {
        case 'openai':
          llmResponse = await callOpenAI(llmApiKey, llmModel, messages, max_tokens, temperature)
          break
        case 'anthropic':
          llmResponse = await callAnthropic(llmApiKey, llmModel, messages, max_tokens, temperature)
          break
        case 'google':
          llmResponse = await callGoogleAI(llmApiKey, llmModel, messages, max_tokens, temperature)
          break
        default:
          throw new Error(`Unsupported LLM provider: ${llmProvider}`)
      }
    } catch (llmError) {
      console.error('LLM API error:', llmError)
      return await generateMockResponse(supabaseClient, prompt, task_type, user_id, llmError.message)
    }

    // Process and enhance the response based on task type
    const processedResponse = await processLLMResponse(llmResponse, task_type, context)

    // Log the LLM usage
    await supabaseClient
      .from('api_logs')
      .insert({
        endpoint: 'invoke-llm',
        method: 'POST',
        request_data: { 
          prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
          task_type,
          max_tokens,
          temperature
        },
        response_data: {
          provider: llmProvider,
          model: llmModel,
          tokens_used: llmResponse.usage?.total_tokens || 0,
          response_length: processedResponse.content?.length || 0
        },
        status_code: 200,
        user_id: user_id || 'anonymous'
      })

    return new Response(
      JSON.stringify({ 
        success: true,
        response: processedResponse,
        metadata: {
          provider: llmProvider,
          model: llmModel,
          task_type: task_type,
          tokens_used: llmResponse.usage?.total_tokens || 0
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in invoke-llm:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Get system prompt based on task type
function getSystemPrompt(taskType: string): string {
  const prompts = {
    'general': 'Você é um assistente útil e amigável. Responda de forma clara e concisa.',
    
    'customer_support': `Você é um assistente de atendimento ao cliente da InstaFly, uma plataforma de crescimento para Instagram. 
Seja sempre educado, prestativo e profissional. 
Ajude com dúvidas sobre pedidos, serviços, pagamentos e problemas técnicos.
Se não souber algo, direcione para o suporte humano.`,
    
    'content_generation': `Você é um especialista em marketing digital e criação de conteúdo para Instagram.
Crie conteúdos envolventes, relevantes e otimizados para engajamento.
Use hashtags apropriadas e linguagem adequada ao público-alvo.`,
    
    'hashtag_suggestion': `Você é um especialista em hashtags do Instagram.
Sugira hashtags relevantes, populares e específicas para o nicho.
Misture hashtags populares com nichos específicos para melhor alcance.`,
    
    'caption_writing': `Você é um copywriter especializado em legendas para Instagram.
Crie legendas envolventes que incentivem interação.
Use call-to-actions apropriados e mantenha o tom da marca.`,
    
    'email_template': `Você é um especialista em email marketing.
Crie emails profissionais, claros e persuasivos.
Adapte o tom conforme o contexto (suporte, marketing, notificação).`
  }
  
  return prompts[taskType] || prompts['general']
}

// Call OpenAI API
async function callOpenAI(apiKey: string, model: string, messages: any[], maxTokens: number, temperature: number) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.choices[0]?.message?.content || '',
    usage: data.usage
  }
}

// Call Anthropic API
async function callAnthropic(apiKey: string, model: string, messages: any[], maxTokens: number, temperature: number) {
  // Convert messages format for Anthropic
  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const userMessages = messages.filter(m => m.role !== 'system')
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      system: systemMessage,
      messages: userMessages,
      max_tokens: maxTokens,
      temperature: temperature
    })
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return {
    content: data.content[0]?.text || '',
    usage: data.usage
  }
}

// Call Google AI API
async function callGoogleAI(apiKey: string, model: string, messages: any[], maxTokens: number, temperature: number) {
  // Implement Google AI API call
  throw new Error('Google AI integration not implemented yet')
}

// Process LLM response based on task type
async function processLLMResponse(llmResponse: any, taskType: string, context?: string) {
  let content = llmResponse.content
  
  // Post-process based on task type
  switch (taskType) {
    case 'hashtag_suggestion':
      // Ensure hashtags are properly formatted
      content = content.replace(/(?<!#)\b(\w+)\b/g, (match, word) => {
        if (word.length > 2 && !content.includes(`#${word}`)) {
          return `#${word}`
        }
        return match
      })
      break
      
    case 'email_template':
      // Add email structure if missing
      if (!content.includes('Assunto:') && !content.includes('Subject:')) {
        content = `Assunto: [Definir assunto]\n\n${content}`
      }
      break
  }
  
  return {
    content: content,
    task_type: taskType,
    processed_at: new Date().toISOString()
  }
}

// Generate mock response when LLM is not available
async function generateMockResponse(supabaseClient: any, prompt: string, taskType: string, userId?: string, error?: string) {
  const mockResponses = {
    'general': 'Esta é uma resposta simulada. Configure sua chave de API do LLM para respostas reais.',
    'customer_support': 'Olá! Obrigado por entrar em contato. Nossa equipe está trabalhando para resolver sua questão. Em breve retornaremos com uma resposta.',
    'content_generation': 'Aqui está uma sugestão de conteúdo para seu Instagram: "Transforme seus sonhos em realidade! 💫 #motivacao #sucesso #instagram"',
    'hashtag_suggestion': '#instagram #instafly #crescimento #engajamento #socialmedia #marketing #digital #sucesso #motivacao #empreendedorismo',
    'caption_writing': 'Sua jornada de crescimento no Instagram começa aqui! 🚀\n\nQual é o seu objetivo? Conte nos comentários! 👇\n\n#instafly #crescimento #instagram',
    'email_template': 'Assunto: Bem-vindo ao InstaFly!\n\nOlá,\n\nObrigado por escolher o InstaFly para impulsionar seu Instagram!\n\nAtenciosamente,\nEquipe InstaFly'
  }
  
  const mockContent = mockResponses[taskType] || mockResponses['general']
  
  // Log the mock response
  await supabaseClient
    .from('api_logs')
    .insert({
      endpoint: 'invoke-llm',
      method: 'POST',
      request_data: { 
        prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
        task_type,
        mock: true
      },
      response_data: {
        mock: true,
        error: error || 'LLM API key not configured',
        response_length: mockContent.length
      },
      status_code: 200,
      user_id: userId || 'anonymous'
    })
  
  return new Response(
    JSON.stringify({ 
      success: true,
      response: {
        content: mockContent,
        task_type: taskType,
        processed_at: new Date().toISOString(),
        mock: true
      },
      metadata: {
        provider: 'mock',
        model: 'mock',
        task_type: taskType,
        tokens_used: 0
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}