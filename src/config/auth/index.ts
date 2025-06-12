// 认证配置
export const authConfig = {
  // OAuth提供商配置
  providers: {
    github: {
      enabled: true,
      redirectTo: `${window.location.origin}/auth/callback`,
    },
    google: {
      enabled: true,
      redirectTo: `${window.location.origin}/auth/callback`,
    },
    twitter: {
      enabled: true,
      redirectTo: `${window.location.origin}/auth/callback`,
    },
    facebook: {
      enabled: true,
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  },
  
  // 路由配置
  routes: {
    login: '/auth/signin',
    register: '/auth/signup',
    forgotPassword: '/auth/forgotpassword',
    resetPassword: '/auth/resetpassword',
    callback: '/auth/callback',
    dashboard: '/dashboard',
    home: '/',
  },
  
  // 会话配置
  session: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  
  // 密码策略
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  
  // 验证配置
  validation: {
    emailConfirmation: true,
    phoneConfirmation: false,
  },
};

// 认证状态枚举
export enum AuthState {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ERROR = 'error',
}

// 认证事件类型
export enum AuthEvent {
  SIGNED_IN = 'SIGNED_IN',
  SIGNED_OUT = 'SIGNED_OUT',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  USER_UPDATED = 'USER_UPDATED',
  PASSWORD_RECOVERY = 'PASSWORD_RECOVERY',
}

// OAuth提供商类型
export type OAuthProvider = 'github' | 'google' | 'twitter' | 'facebook';

// 用户角色枚举
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export default authConfig; 