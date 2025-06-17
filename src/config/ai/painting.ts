/**
 * AI美育工具配置
 * 
 * 🔧 如何配置新的Dify应用：
 * 1. 在Dify平台创建应用，获取API密钥
 * 2. 在环境变量中添加对应的API密钥（如：VITE_DIFY_API_KEY_TEXT_TO_IMAGE）
 * 3. 在下面的配置中添加新的工具配置
 * 4. 根据应用类型选择 'workflow' 或 'chat'
 */

export interface PaintingToolConfig {
  // 基础信息（必填）
  id: string;                    // 工具唯一标识
  name: string;                  // 工具显示名称
  description: string;           // 工具描述
  icon: string;                  // 图标名称（使用heroicons）
  iconBgColor: string;          // 图标背景色
  
  // Dify应用配置（必填）
  type: 'workflow' | 'chat';    // Dify应用类型
  apikey: string;               // 环境变量名称（不是实际密钥）
  
  // 分类信息（必填）
  category: 'image' | 'music' | 'video' | 'design';  // 工具分类
  tags: string[];               // 标签列表
  
  // 功能特性（必填）
  features: {
    supportTextInput: boolean;   // 是否支持文本输入
    supportImageInput: boolean;  // 是否支持图片上传
    supportAudioInput: boolean;  // 是否支持音频上传
    outputType: 'image' | 'audio' | 'video' | 'text';  // 输出类型
    adaptiveInput: boolean;      // 是否支持自适应输入
  };
  
  // 可选配置
  previewImage?: string;        // 工具预览图
  examples?: Array<{           // 示例列表
    title: string;
    description: string;
    inputExample: string;
    outputPreview?: string;
  }>;
}

/**
 * 🎨 AI美育工具配置列表
 * 
 * 💡 添加新工具的步骤：
 * 1. 复制下面任意一个配置作为模板
 * 2. 修改id、name、description等基础信息
 * 3. 设置正确的apikey环境变量名
 * 4. 根据工具功能配置features
 * 5. 添加示例（可选）
 */
export const paintingToolsConfig: Record<string, PaintingToolConfig> = {
  
  // 📝 示例1：文本生成图像工具
  'text-to-image': {
    id: 'text-to-image',
    name: 'AI绘画大师',
    description: '通过文字描述生成精美的艺术作品，支持多种艺术风格',
    icon: 'heroicons-outline:camera',           // 使用camera图标
    iconBgColor: '#fef3c7',                     // 黄色背景
    
    // Dify配置
    type: 'workflow',                           // 工作流类型
    apikey: 'VITE_DIFY_API_KEY_TEXT_TO_IMAGE', // 环境变量名
    
    // 分类
    category: 'image',
    tags: ['绘画', '艺术', '创作'],
    
    // 功能特性
    features: {
      supportTextInput: true,    // ✅ 支持文本输入
      supportImageInput: false,  // ❌ 不支持图片上传
      supportAudioInput: false,  // ❌ 不支持音频上传
      outputType: 'image',       // 输出图片
      adaptiveInput: true        // 支持自适应输入
    }
  },
  'image-creative': {
    id: 'image-creative',
    name: '创意图像大师',
    description: '通过文字描述生成精美的艺术作品，支持多种艺术风格',
    icon: 'heroicons-outline:user-circle',           // 使用camera图标
    iconBgColor: '#fef3c7',                     // 黄色背景
    
    // Dify配置
    type: 'workflow',                           // 工作流类型
    apikey: 'VITE_DIFY_API_KEY_IMAGE_CREATIVE', // 环境变量名
    
    // 分类
    category: 'image',
    tags: ['绘画', '艺术', '创作'],
    
    // 功能特性
    features: {
      supportTextInput: true,    // ✅ 支持文本输入
      supportImageInput: false,  // ❌ 不支持图片上传
      supportAudioInput: false,  // ❌ 不支持音频上传
      outputType: 'image',       // 输出图片
      adaptiveInput: true        // 支持自适应输入
    }
  },
  // 💡 添加更多工具配置...
  // 只需要复制上面的模板，修改相应的配置即可
};

/**
 * 🔧 工具函数 - 无需修改
 */

/**
 * 获取指定类别的工具
 */
export function getToolsByCategory(category: PaintingToolConfig['category']): PaintingToolConfig[] {
  return Object.values(paintingToolsConfig).filter(tool => tool.category === category);
}

/**
 * 获取支持自适应输入的工具
 */
export function getAdaptiveInputTools(): PaintingToolConfig[] {
  return Object.values(paintingToolsConfig).filter(tool => tool.features.adaptiveInput);
}

/**
 * 根据输出类型获取工具
 */
export function getToolsByOutputType(outputType: PaintingToolConfig['features']['outputType']): PaintingToolConfig[] {
  return Object.values(paintingToolsConfig).filter(tool => tool.features.outputType === outputType);
}

/**
 * 获取工具配置
 */
export function getToolConfig(toolId: string): PaintingToolConfig | undefined {
  return paintingToolsConfig[toolId];
}

/**
 * 获取所有工具配置
 */
export function getAllTools(): PaintingToolConfig[] {
  return Object.values(paintingToolsConfig);
}

export default paintingToolsConfig; 