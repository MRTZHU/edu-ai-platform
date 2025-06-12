// API基础配置
export const apiConfig = {
  // Supabase API配置
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string,
    key: import.meta.env.VITE_SUPABASE_KEY as string,
  },
  
  // Dify API配置
  dify: {
    baseUrl: (import.meta.env.VITE_DIFY_API_BASE_URL as string) || 'https://api.dify.ai/v1',
    defaultApiKey: import.meta.env.VITE_DIFY_API_KEY as string,
  },
  
  // 其他第三方API配置
  external: {
    // 可以在这里添加其他API配置
  },
  
  // 请求超时配置
  timeout: {
    default: 10000, // 10秒
    upload: 30000,  // 30秒
    download: 60000, // 60秒
  },
  
  // 重试配置
  retry: {
    maxAttempts: 3,
    delay: 1000, // 1秒
  },
};

// API端点配置
export const endpoints = {
  // Supabase端点
  supabase: {
    auth: '/auth/v1',
    rest: '/rest/v1',
    realtime: '/realtime/v1',
  },
  
  // Dify端点
  dify: {
    chatMessages: '/chat-messages',
    workflows: '/workflows/run',
    completion: '/completion-messages',
  },
};

// 请求头配置
export const headers = {
  common: {
    'Content-Type': 'application/json',
  },
  
  supabase: {
    'apikey': apiConfig.supabase.key,
    'Authorization': `Bearer ${apiConfig.supabase.key}`,
  },
  
  dify: (apiKey: string) => ({
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }),
};

export default apiConfig; 