// 支付配置（预留，暂未启用）
export const paymentConfig = {
  // 支付提供商配置
  providers: {
    stripe: {
      enabled: false,
      publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY as string,
      currency: 'usd',
    },
    
    paypal: {
      enabled: false,
      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID as string,
      currency: 'usd',
    },
    
    alipay: {
      enabled: false,
      appId: import.meta.env.VITE_ALIPAY_APP_ID as string,
      currency: 'cny',
    },
  },
  
  // 订阅计划配置
  plans: {
    free: {
      id: 'free',
      name: '免费版',
      price: 0,
      currency: 'usd',
      interval: 'month',
      features: [
        '基础AI工具访问',
        '每月100次API调用',
        '基础客户支持',
      ],
      limits: {
        apiCalls: 100,
        storage: '1GB',
        projects: 3,
      },
    },
    
    pro: {
      id: 'pro',
      name: '专业版',
      price: 19.99,
      currency: 'usd',
      interval: 'month',
      features: [
        '所有AI工具访问',
        '每月1000次API调用',
        '优先客户支持',
        '高级分析功能',
      ],
      limits: {
        apiCalls: 1000,
        storage: '10GB',
        projects: 10,
      },
    },
    
    enterprise: {
      id: 'enterprise',
      name: '企业版',
      price: 99.99,
      currency: 'usd',
      interval: 'month',
      features: [
        '无限AI工具访问',
        '无限API调用',
        '24/7专属客户支持',
        '定制化功能',
        '团队协作功能',
      ],
      limits: {
        apiCalls: -1, // 无限制
        storage: '100GB',
        projects: -1, // 无限制
      },
    },
  },
  
  // 支付设置
  settings: {
    // 试用期设置
    trial: {
      enabled: true,
      duration: 14, // 14天试用
      plan: 'pro', // 试用专业版
    },
    
    // 发票设置
    invoicing: {
      enabled: false,
      autoSend: true,
      template: 'default',
    },
    
    // 退款政策
    refund: {
      enabled: true,
      period: 30, // 30天退款期
      autoApprove: false,
    },
  },
};

// 支付状态枚举
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

// 订阅状态枚举
export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

// 支付方法类型
export type PaymentMethod = 'stripe' | 'paypal' | 'alipay';

export default paymentConfig; 