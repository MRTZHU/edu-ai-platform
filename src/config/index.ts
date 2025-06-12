// 统一配置入口文件
export { default as aiConfig, type DifyAppConfig, type AppKey } from './ai';
export { default as apiConfig, endpoints, headers } from './api';
export { default as authConfig, AuthState, AuthEvent, UserRole, type OAuthProvider } from './auth';
export { default as supabase, supabaseConfig, checkDbConnection } from './db';
export { default as paymentConfig, PaymentStatus, SubscriptionStatus, type PaymentMethod } from './payment';
export { default as productConfig, navigationConfig } from './products';

// 应用全局配置
export const appConfig = {
  // 开发环境配置
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // 应用基本信息
  name: 'Supabase教育应用',
  version: '1.0.0',
  
  // 调试配置
  debug: {
    enabled: import.meta.env.DEV,
    level: 'info', // 'error', 'warn', 'info', 'debug'
  },
  
  // 性能配置
  performance: {
    enableMetrics: false,
    enableProfiling: false,
  },
};

// 环境变量验证
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_KEY',
  ];
  
  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.error('缺少必需的环境变量:', missingVars);
    return false;
  }
  
  return true;
};

// 配置初始化
export const initializeConfig = () => {
  // 验证环境变量
  if (!validateEnvironment()) {
    throw new Error('配置初始化失败：缺少必需的环境变量');
  }
  
  // 在开发环境下输出配置信息
  if (appConfig.debug.enabled) {
    console.log('🔧 配置已初始化');
    console.log('📊 应用配置:', appConfig);
  }
  
  return true;
}; 