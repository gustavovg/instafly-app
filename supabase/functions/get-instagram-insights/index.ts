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
      user_id, 
      instagram_username, 
      access_token, 
      metrics = ['followers', 'engagement', 'reach'], 
      period = '7d' 
    } = await req.json()

    // Validate required fields
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Instagram API credentials
    const instagramAppId = Deno.env.get('INSTAGRAM_APP_ID')
    const instagramAppSecret = Deno.env.get('INSTAGRAM_APP_SECRET')
    
    if (!instagramAppId || !instagramAppSecret) {
      console.warn('Instagram API credentials not configured, using mock data')
      return await generateMockInsights(supabaseClient, user_id, instagram_username, metrics, period)
    }

    // Get user's Instagram connection from database
    const { data: userConnection, error: connectionError } = await supabaseClient
      .from('user_social_accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('platform', 'instagram')
      .eq('is_active', true)
      .single()

    if (connectionError || !userConnection) {
      return new Response(
        JSON.stringify({ error: 'Instagram account not connected' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userAccessToken = access_token || userConnection.access_token
    const username = instagram_username || userConnection.username

    if (!userAccessToken) {
      return new Response(
        JSON.stringify({ error: 'Instagram access token not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate access token
    const tokenValidation = await validateInstagramToken(userAccessToken)
    if (!tokenValidation.valid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired Instagram access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Instagram Business Account ID
    const businessAccountId = await getBusinessAccountId(userAccessToken)
    if (!businessAccountId) {
      return new Response(
        JSON.stringify({ error: 'Instagram Business Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch insights based on requested metrics
    const insights = await fetchInstagramInsights(businessAccountId, userAccessToken, metrics, period)
    
    // Get account basic info
    const accountInfo = await getAccountInfo(businessAccountId, userAccessToken)
    
    // Get recent media performance
    const mediaInsights = await getMediaInsights(businessAccountId, userAccessToken, period)
    
    // Calculate additional metrics
    const calculatedMetrics = calculateAdditionalMetrics(insights, accountInfo, mediaInsights)
    
    // Store insights in database
    await supabaseClient
      .from('instagram_insights')
      .insert({
        user_id: user_id,
        instagram_account_id: businessAccountId,
        username: username,
        period: period,
        metrics_data: {
          basic_insights: insights,
          account_info: accountInfo,
          media_insights: mediaInsights,
          calculated_metrics: calculatedMetrics
        },
        collected_at: new Date().toISOString()
      })

    // Log the API call
    await supabaseClient
      .from('api_logs')
      .insert({
        endpoint: 'get-instagram-insights',
        method: 'POST',
        request_data: { user_id, metrics, period },
        response_data: {
          account_id: businessAccountId,
          metrics_count: Object.keys(insights).length,
          media_count: mediaInsights.length
        },
        status_code: 200,
        user_id: user_id
      })

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          account_info: accountInfo,
          insights: insights,
          media_insights: mediaInsights,
          calculated_metrics: calculatedMetrics,
          period: period,
          collected_at: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-instagram-insights:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Validate Instagram access token
async function validateInstagramToken(accessToken: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`)
    const data = await response.json()
    
    return {
      valid: response.ok && !data.error,
      data: data
    }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

// Get Instagram Business Account ID
async function getBusinessAccountId(accessToken: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me/accounts?fields=instagram_business_account&access_token=${accessToken}`
    )
    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      const page = data.data.find(p => p.instagram_business_account)
      return page?.instagram_business_account?.id
    }
    
    return null
  } catch (error) {
    console.error('Error getting business account ID:', error)
    return null
  }
}

// Fetch Instagram insights
async function fetchInstagramInsights(accountId: string, accessToken: string, metrics: string[], period: string) {
  const insights = {}
  
  // Map period to Instagram API format
  const periodMap = {
    '1d': 'day',
    '7d': 'week',
    '30d': 'days_28'
  }
  
  const instagramPeriod = periodMap[period] || 'week'
  
  // Account-level metrics
  const accountMetrics = [
    'follower_count',
    'following_count',
    'media_count',
    'profile_views',
    'reach',
    'impressions',
    'website_clicks'
  ]
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/${accountId}/insights?metric=${accountMetrics.join(',')}&period=${instagramPeriod}&access_token=${accessToken}`
    )
    const data = await response.json()
    
    if (data.data) {
      data.data.forEach(metric => {
        insights[metric.name] = {
          value: metric.values[0]?.value || 0,
          period: metric.period,
          title: metric.title,
          description: metric.description
        }
      })
    }
  } catch (error) {
    console.error('Error fetching account insights:', error)
  }
  
  return insights
}

// Get account basic information
async function getAccountInfo(accountId: string, accessToken: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${accountId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography&access_token=${accessToken}`
    )
    const data = await response.json()
    
    return {
      id: data.id,
      username: data.username,
      name: data.name,
      profile_picture_url: data.profile_picture_url,
      followers_count: data.followers_count,
      follows_count: data.follows_count,
      media_count: data.media_count,
      biography: data.biography
    }
  } catch (error) {
    console.error('Error fetching account info:', error)
    return {}
  }
}

// Get media insights
async function getMediaInsights(accountId: string, accessToken: string, period: string) {
  try {
    // Get recent media
    const mediaResponse = await fetch(
      `https://graph.facebook.com/${accountId}/media?fields=id,media_type,media_url,permalink,timestamp,caption&limit=10&access_token=${accessToken}`
    )
    const mediaData = await mediaResponse.json()
    
    if (!mediaData.data) return []
    
    // Get insights for each media
    const mediaInsights = []
    
    for (const media of mediaData.data) {
      try {
        const insightsResponse = await fetch(
          `https://graph.facebook.com/${media.id}/insights?metric=engagement,impressions,reach,saved&access_token=${accessToken}`
        )
        const insightsData = await insightsResponse.json()
        
        const mediaInsight = {
          media_id: media.id,
          media_type: media.media_type,
          media_url: media.media_url,
          permalink: media.permalink,
          timestamp: media.timestamp,
          caption: media.caption?.substring(0, 100) + (media.caption?.length > 100 ? '...' : ''),
          insights: {}
        }
        
        if (insightsData.data) {
          insightsData.data.forEach(insight => {
            mediaInsight.insights[insight.name] = insight.values[0]?.value || 0
          })
        }
        
        mediaInsights.push(mediaInsight)
      } catch (error) {
        console.error(`Error fetching insights for media ${media.id}:`, error)
      }
    }
    
    return mediaInsights
  } catch (error) {
    console.error('Error fetching media insights:', error)
    return []
  }
}

// Calculate additional metrics
function calculateAdditionalMetrics(insights: any, accountInfo: any, mediaInsights: any[]) {
  const calculated = {}
  
  // Engagement rate
  if (insights.reach?.value && mediaInsights.length > 0) {
    const totalEngagement = mediaInsights.reduce((sum, media) => {
      return sum + (media.insights.engagement || 0)
    }, 0)
    
    calculated.engagement_rate = totalEngagement / insights.reach.value * 100
  }
  
  // Average likes per post
  if (mediaInsights.length > 0) {
    const totalLikes = mediaInsights.reduce((sum, media) => {
      return sum + (media.insights.likes || 0)
    }, 0)
    
    calculated.avg_likes_per_post = totalLikes / mediaInsights.length
  }
  
  // Follower growth rate (mock calculation)
  if (accountInfo.followers_count) {
    calculated.follower_growth_rate = Math.random() * 5 // Mock 0-5% growth
  }
  
  // Best performing post
  if (mediaInsights.length > 0) {
    const bestPost = mediaInsights.reduce((best, current) => {
      const currentEngagement = current.insights.engagement || 0
      const bestEngagement = best.insights.engagement || 0
      return currentEngagement > bestEngagement ? current : best
    })
    
    calculated.best_performing_post = {
      media_id: bestPost.media_id,
      engagement: bestPost.insights.engagement,
      permalink: bestPost.permalink
    }
  }
  
  return calculated
}

// Generate mock insights when API is not available
async function generateMockInsights(supabaseClient: any, userId: string, username?: string, metrics: string[] = [], period: string = '7d') {
  const mockData = {
    account_info: {
      id: 'mock_account_id',
      username: username || 'mock_user',
      name: 'Mock Account',
      followers_count: Math.floor(Math.random() * 10000) + 1000,
      follows_count: Math.floor(Math.random() * 1000) + 100,
      media_count: Math.floor(Math.random() * 500) + 50
    },
    insights: {
      follower_count: { value: Math.floor(Math.random() * 10000) + 1000, period: period },
      profile_views: { value: Math.floor(Math.random() * 1000) + 100, period: period },
      reach: { value: Math.floor(Math.random() * 5000) + 500, period: period },
      impressions: { value: Math.floor(Math.random() * 8000) + 800, period: period },
      website_clicks: { value: Math.floor(Math.random() * 100) + 10, period: period }
    },
    media_insights: Array.from({ length: 5 }, (_, i) => ({
      media_id: `mock_media_${i}`,
      media_type: 'IMAGE',
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      insights: {
        engagement: Math.floor(Math.random() * 200) + 20,
        impressions: Math.floor(Math.random() * 1000) + 100,
        reach: Math.floor(Math.random() * 800) + 80,
        saved: Math.floor(Math.random() * 50) + 5
      }
    })),
    calculated_metrics: {
      engagement_rate: (Math.random() * 5 + 1).toFixed(2),
      avg_likes_per_post: Math.floor(Math.random() * 100) + 20,
      follower_growth_rate: (Math.random() * 3).toFixed(2)
    }
  }
  
  // Log the mock response
  await supabaseClient
    .from('api_logs')
    .insert({
      endpoint: 'get-instagram-insights',
      method: 'POST',
      request_data: { user_id: userId, metrics, period, mock: true },
      response_data: {
        mock: true,
        reason: 'Instagram API credentials not configured'
      },
      status_code: 200,
      user_id: userId
    })
  
  return new Response(
    JSON.stringify({ 
      success: true,
      data: {
        ...mockData,
        period: period,
        collected_at: new Date().toISOString(),
        mock: true
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}