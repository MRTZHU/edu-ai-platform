// 产品配置
export const productConfig = {
  // 应用基本信息
  app: {
    name: 'Supabase教育应用',
    version: '1.0.0',
    description: '基于Vue 3 + TypeScript + Vite + Supabase的现代化教育平台',
    author: 'Your Team',
    website: 'https://your-domain.com',
  },
  
  // 功能模块配置
  features: {
    // AI工具箱
    aiToolbox: {
      enabled: true,
      path: '/dashboard/ai-magic-toolbox',
      name: 'AI魔法工具箱',
      description: '探索强大的AI工具，提升您的工作效率',
      icon: 'i-lucide-cpu',
    },
    
    // 用户档案
    profile: {
      enabled: true,
      path: '/dashboard/profile',
      name: '个人档案',
      description: '管理您的个人信息和偏好设置',
      icon: 'i-lucide-user',
    },
    
    // 工具视图
    tools: {
      enabled: true,
      path: '/dashboard/tools',
      name: '工具中心',
      description: '访问各种实用工具',
      icon: 'i-lucide-wrench',
    },
  },
  
  // 主题配置
  theme: {
    // 支持的主题
    themes: ['light', 'dark', 'system'],
    defaultTheme: 'system',
    
    // 品牌颜色
    colors: {
      primary: '#3b82f6', // blue-500
      secondary: '#64748b', // slate-500
      success: '#10b981', // emerald-500
      warning: '#f59e0b', // amber-500
      error: '#ef4444', // red-500
    },
  },
  
  // 布局配置
  layout: {
    // 导航抽屉
    drawer: {
      defaultOpen: true,
      breakpoint: 'lg', // 在大屏幕上默认打开
    },
    
    // 页面容器
    container: {
      maxWidth: '7xl', // max-w-7xl
      padding: 'px-4 sm:px-6 lg:px-8',
    },
  },
  
  // 分析和监控
  analytics: {
    enabled: false, // 暂时禁用
    provider: 'google', // google, mixpanel, etc.
    trackingId: '',
  },
  
  // 错误报告
  errorReporting: {
    enabled: false, // 暂时禁用
    provider: 'sentry', // sentry, bugsnag, etc.
    dsn: '',
  },
};

// 导航菜单配置
export const navigationConfig = {
  // 主导航菜单
  main: [
    {
      name: '仪表板',
      path: '/dashboard',
      icon: 'i-lucide-layout-dashboard',
      requiresAuth: true,
    },
    {
      name: 'AI魔法工具箱',
      path: '/dashboard/ai-magic-toolbox',
      icon: 'i-lucide-cpu',
      requiresAuth: true,
    },
    {
      name: '工具中心',
      path: '/dashboard/tools',
      icon: 'i-lucide-wrench',
      requiresAuth: true,
    },
    {
      name: '个人档案',
      path: '/dashboard/profile',
      icon: 'i-lucide-user',
      requiresAuth: true,
    },
  ],
  
  // 用户菜单
  user: [
    {
      name: '个人设置',
      path: '/dashboard/profile',
      icon: 'i-lucide-settings',
    },
    {
      name: '帮助中心',
      path: '/help',
      icon: 'i-lucide-help-circle',
    },
    {
      name: '退出登录',
      action: 'logout',
      icon: 'i-lucide-log-out',
    },
  ],
};

export default productConfig; 