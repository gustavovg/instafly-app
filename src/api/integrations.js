import { supabase } from './supabaseClient';

// Integração para invocar LLM via Edge Function
export const InvokeLLM = async (params) => {
  try {
    const { data, error } = await supabase.functions.invoke('invoke-llm', {
      body: {
        prompt: params.prompt,
        model: params.model || 'gpt-3.5-turbo',
        maxTokens: params.maxTokens || 1000,
        temperature: params.temperature || 0.7
      }
    });

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('InvokeLLM error:', error);
    return { error: error.message, success: false };
  }
};

// Integração para envio de email via Edge Function
export const SendEmail = async (params) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        from: params.from
      }
    });

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('SendEmail error:', error);
    return { error: error.message, success: false };
  }
};

// Integração para upload de arquivo via Supabase Storage
export const UploadFile = async (params) => {
  try {
    const { data, error } = await supabase.storage
      .from(params.bucket || 'uploads')
      .upload(params.path, params.file, {
        cacheControl: '3600',
        upsert: params.upsert || false
      });

    if (error) throw error;
    
    // Obter URL pública do arquivo
    const { data: publicUrl } = supabase.storage
      .from(params.bucket || 'uploads')
      .getPublicUrl(data.path);

    return { 
      data: { 
        path: data.path, 
        fullPath: data.fullPath,
        publicUrl: publicUrl.publicUrl 
      }, 
      success: true 
    };
  } catch (error) {
    console.error('UploadFile error:', error);
    return { error: error.message, success: false };
  }
};

// Integração para geração de imagem via Edge Function
export const GenerateImage = async (params) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: {
        prompt: params.prompt,
        size: params.size || '1024x1024',
        quality: params.quality || 'standard',
        style: params.style || 'vivid'
      }
    });

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('GenerateImage error:', error);
    return { error: error.message, success: false };
  }
};

// Integração para extração de dados de arquivo via Edge Function
export const ExtractDataFromUploadedFile = async (params) => {
  try {
    const { data, error } = await supabase.functions.invoke('extract-file-data', {
      body: {
        filePath: params.filePath,
        fileType: params.fileType,
        extractionType: params.extractionType || 'text'
      }
    });

    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('ExtractDataFromUploadedFile error:', error);
    return { error: error.message, success: false };
  }
};

// Objeto Core para compatibilidade
export const Core = {
  InvokeLLM,
  SendEmail,
  UploadFile,
  GenerateImage,
  ExtractDataFromUploadedFile
};






