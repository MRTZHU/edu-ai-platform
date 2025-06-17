/**
 * Dify API 服务
 * 用于调用 Dify 应用 API
 */

import { apiConfig, endpoints } from '@/config/api';
import { paintingToolsConfig } from '@/config/ai/painting';

export interface DifyApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: any; // 添加详细错误信息
}

/**
 * Dify应用参数配置接口
 */
export interface DifyAppParameters {
  opening_statement?: string;
  suggested_questions?: string[];
  suggested_questions_after_answer?: {
    enabled: boolean;
  };
  speech_to_text?: {
    enabled: boolean;
  };
  retriever_resource?: {
    enabled: boolean;
  };
  annotation_reply?: {
    enabled: boolean;
  };
  user_input_form?: DifyUserInputFormItem[];
  file_upload?: DifyFileUploadSetting;
  system_parameters?: {
    file_size_limit?: number;
    image_file_size_limit?: number;
    audio_file_size_limit?: number;
    video_file_size_limit?: number;
  };
}

/**
 * Dify用户输入表单项接口
 */
export interface DifyUserInputFormItem {
  'text-input'?: {
    label: string;
    variable: string;
    required: boolean;
    default?: string;
    max_length?: number;
  };
  'paragraph'?: {
    label: string;
    variable: string;
    required: boolean;
    default?: string;
    max_length?: number;
  };
  'select'?: {
    label: string;
    variable: string;
    required: boolean;
    default?: string;
    options: string[];
  };
}

/**
 * Dify文件上传设置接口
 */
export interface DifyFileUploadSetting {
  image?: {
    enabled: boolean;
    number_limits?: number;
    detail?: string;
    transfer_methods?: ('remote_url' | 'local_file')[];
  };
  audio?: {
    enabled: boolean;
    number_limits?: number;
    detail?: string;
    transfer_methods?: ('remote_url' | 'local_file')[];
  };
  video?: {
    enabled: boolean;
    number_limits?: number;
    detail?: string;
    transfer_methods?: ('remote_url' | 'local_file')[];
  };
  document?: {
    enabled: boolean;
    number_limits?: number;
    detail?: string;
    transfer_methods?: ('remote_url' | 'local_file')[];
  };
}

export interface DifyChatRequest {
  inputs: Record<string, any>;
  query: string;
  response_mode: 'streaming' | 'blocking';
  user: string;
  conversation_id?: string;
  files?: Array<{
    type: string;
    transfer_method: string;
    url?: string;
    upload_file_id?: string;
  }>;
}

export interface DifyWorkflowRequest {
  inputs: Record<string, any>;
  response_mode: 'streaming' | 'blocking';
  user: string;
  files?: Array<{
    type: string;
    transfer_method: string;
    url?: string;
    upload_file_id?: string;
  }>;
}

export interface DifyStreamChunk {
  event: string;
  data: any;
  id?: string;
}

export class DifyApiService {
  private baseUrl: string;
  
  constructor() {
    // 使用配置文件中的baseUrl
    this.baseUrl = apiConfig.dify.baseUrl.replace(/\/$/, '');
  }

  /**
   * 获取指定工具的API Key
   * @param toolId 工具ID，如 'INTERVIEW'
   * @returns API Key
   */
  private getApiKey(toolId: string): string {
    // 首先尝试从工具配置中获取API密钥名称
    const toolConfig = paintingToolsConfig[toolId];
    
    if (toolConfig && toolConfig.apikey) {
      // 使用工具配置中指定的API密钥环境变量名
      const apiKey = (import.meta.env as any)[toolConfig.apikey];
      if (apiKey && typeof apiKey === 'string' && apiKey.trim()) {
        console.log(`🔑 使用工具配置的API密钥: ${toolConfig.apikey}`);
        return apiKey.trim();
      } else {
        console.warn(`⚠️ 工具 ${toolId} 配置的API密钥 ${toolConfig.apikey} 未找到或为空`);
      }
    }
    
    // 备用方案：尝试基于toolId生成的API密钥名称
    const specificKeyName = `VITE_DIFY_API_KEY_${toolId.toUpperCase().replace(/-/g, '_')}`;
    const specificKey = (import.meta.env as any)[specificKeyName];
    if (specificKey && typeof specificKey === 'string' && specificKey.trim()) {
      console.log(`🔑 使用生成的API密钥名称: ${specificKeyName}`);
      return specificKey.trim();
    }
    
    // 如果没有专用Key，使用默认Key
    const defaultKey = apiConfig.dify.defaultApiKey;
    if (!defaultKey || typeof defaultKey !== 'string' || !defaultKey.trim()) {
      throw new Error(`未配置工具 ${toolId} 的API密钥。请检查环境变量 ${toolConfig?.apikey || specificKeyName}`);
    }
    
    console.log(`🔑 使用默认API密钥`);
    return defaultKey.trim();
  }

  /**
   * 获取Dify应用的参数配置
   * 用于自适应输入框，根据应用配置动态生成表单
   * @param toolId 工具ID
   * @returns 应用参数配置
   */
  async getAppParameters(toolId: string): Promise<DifyApiResponse> {
    let requestDetails = null;
    
    try {
      const apiKey = this.getApiKey(toolId);
      const endpoint = `${this.baseUrl}/parameters`;
      
      // 记录请求详情用于调试
      requestDetails = {
        url: endpoint,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey.substring(0, 10)}...`, // 只显示前10位用于调试
        },
        toolId
      };

      console.log('🔍 Dify Parameters API 请求详情:', {
        url: requestDetails.url,
        method: requestDetails.method,
        headers: {
          'Authorization': requestDetails.headers.Authorization,
        },
        toolId
      });

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 Dify Parameters API 响应状态:', response.status, response.statusText);

      // 尝试解析响应体，无论成功还是失败
      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = { raw: responseText };
      }

      console.log('📄 Dify Parameters API 响应数据:', responseData);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            responseData,
            requestDetails: {
              url: requestDetails.url,
              method: requestDetails.method,
              toolId
            }
          }
        };
      }
      
      return {
        success: true,
        data: responseData as DifyAppParameters,
        details: {
          status: response.status,
          requestDetails: {
            url: requestDetails.url,
            method: requestDetails.method,
            toolId
          }
        }
      };
    } catch (error) {
      console.error('❌ Dify Parameters API 调用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        details: {
          originalError: error,
          requestDetails
        }
      };
    }
  }

  /**
   * 调用Dify聊天应用
   * @param toolId 工具ID
   * @param inputs 输入参数
   * @param query 用户查询
   * @param user 用户标识
   * @returns API响应
   */
  async callChatApp(
    toolId: string, 
    inputs: Record<string, any>, 
    query: string,
    user: string = 'user'
  ): Promise<DifyApiResponse> {
    let requestDetails = null;
    
    try {
      const apiKey = this.getApiKey(toolId);
      const endpoint = `${this.baseUrl}${endpoints.dify.chatMessages}`;
      
      const requestBody: DifyChatRequest = {
        inputs,
        query,
        response_mode: 'blocking',
        user,
        files: [] // 可选的文件数组
      };

      // 记录请求详情用于调试
      requestDetails = {
        url: endpoint,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.substring(0, 10)}...`, // 只显示前10位用于调试
          'Content-Type': 'application/json',
        },
        body: requestBody
      };

      console.log('🔍 Dify Chat API 请求详情:', {
        url: requestDetails.url,
        method: requestDetails.method,
        headers: {
          'Authorization': requestDetails.headers.Authorization,
          'Content-Type': requestDetails.headers['Content-Type']
        },
        bodyKeys: Object.keys(requestBody),
        inputsKeys: Object.keys(inputs),
        query
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Dify Chat API 响应状态:', response.status, response.statusText);

      // 尝试解析响应体，无论成功还是失败
      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = { raw: responseText };
      }

      console.log('📄 Dify Chat API 响应数据:', responseData);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            responseData,
            requestDetails: {
              url: requestDetails.url,
              method: requestDetails.method,
              bodyKeys: Object.keys(requestBody)
            }
          }
        };
      }
      
      return {
        success: true,
        data: responseData,
        details: {
          status: response.status,
          requestDetails: {
            url: requestDetails.url,
            method: requestDetails.method
          }
        }
      };
    } catch (error) {
      console.error('❌ Dify Chat API 调用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        details: {
          originalError: error,
          requestDetails
        }
      };
    }
  }

  /**
   * 调用Dify工作流
   * @param toolId 工具ID
   * @param inputs 输入参数
   * @param user 用户标识
   * @returns API响应
   */
  async callWorkflow(
    toolId: string, 
    inputs: Record<string, any>, 
    user: string = 'user'
  ): Promise<DifyApiResponse> {
    let requestDetails = null;
    
    try {
      const apiKey = this.getApiKey(toolId);
      const endpoint = `${this.baseUrl}${endpoints.dify.workflows}`;
      
      const requestBody: DifyWorkflowRequest = {
        inputs,
        response_mode: 'blocking',
        user,
        files: [] // 可选的文件数组
      };

      // 记录请求详情用于调试
      requestDetails = {
        url: endpoint,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.substring(0, 10)}...`, // 只显示前10位用于调试
          'Content-Type': 'application/json',
        },
        body: requestBody
      };

      console.log('🔍 Dify Workflow API 请求详情:', {
        url: requestDetails.url,
        method: requestDetails.method,
        headers: {
          'Authorization': requestDetails.headers.Authorization,
          'Content-Type': requestDetails.headers['Content-Type']
        },
        bodyKeys: Object.keys(requestBody),
        inputsKeys: Object.keys(inputs)
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Dify Workflow API 响应状态:', response.status, response.statusText);

      // 尝试解析响应体，无论成功还是失败
      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = { raw: responseText };
      }

      console.log('📄 Dify Workflow API 响应数据:', responseData);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            responseData,
            requestDetails: {
              url: requestDetails.url,
              method: requestDetails.method,
              bodyKeys: Object.keys(requestBody)
            }
          }
        };
      }
      
      return {
        success: true,
        data: responseData,
        details: {
          status: response.status,
          requestDetails: {
            url: requestDetails.url,
            method: requestDetails.method
          }
        }
      };
    } catch (error) {
      console.error('❌ Dify Workflow API 调用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        details: {
          originalError: error,
          requestDetails
        }
      };
    }
  }

  /**
   * 根据应用类型自动选择API调用方法
   * @param toolId 工具ID
   * @param appType 应用类型 ('chat' | 'workflow')
   * @param inputs 输入参数
   * @param query 查询内容（chat类型必需）
   * @param user 用户标识
   * @returns API响应
   */
  async callApp(
    toolId: string,
    appType: string,
    inputs: Record<string, any>,
    query?: string,
    user: string = 'user'
  ): Promise<DifyApiResponse> {
    if (appType === 'chat') {
      if (!query) {
        return {
          success: false,
          error: 'Chat应用需要提供query参数'
        };
      }
      return this.callChatApp(toolId, inputs, query, user);
    } else if (appType === 'workflow') {
      return this.callWorkflow(toolId, inputs, user);
    } else {
      return {
        success: false,
        error: `不支持的应用类型: ${appType}`
      };
    }
  }

  /**
   * 检查API配置是否完整
   * @param toolId 工具ID
   * @returns 是否配置完整
   */
  checkApiConfig(toolId: string): boolean {
    try {
      this.getApiKey(toolId);
      return !!this.baseUrl;
    } catch {
      return false;
    }
  }

  /**
   * 获取API配置信息（用于调试显示）
   * @param toolId 工具ID
   * @returns 配置信息
   */
  getApiConfigInfo(toolId: string): { hasApiKey: boolean; baseUrl: string; keyPrefix?: string } {
    try {
      const apiKey = this.getApiKey(toolId);
      return {
        hasApiKey: true,
        baseUrl: this.baseUrl,
        keyPrefix: `${apiKey.substring(0, 8)}...`
      };
    } catch {
      return {
        hasApiKey: false,
        baseUrl: this.baseUrl
      };
    }
  }

  async callChatAppStream(
    toolId: string,
    inputs: Record<string, any>,
    query: string,
    user: string = 'user',
    conversationId?: string,
    onChunk?: (chunk: DifyStreamChunk) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> {
    let requestDetails = null;
    
    try {
      const apiKey = this.getApiKey(toolId);
      const endpoint = `${this.baseUrl}${endpoints.dify.chatMessages}`;
      
      const requestBody: DifyChatRequest = {
        inputs,
        query,
        response_mode: 'streaming', // 使用流式模式
        user,
        conversation_id: conversationId,
        files: []
      };

      // 记录请求详情用于调试
      requestDetails = {
        url: endpoint,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.substring(0, 10)}...`,
          'Content-Type': 'application/json',
        },
        body: requestBody
      };

      console.log('🔍 Dify Chat Stream API 请求详情:', {
        url: requestDetails.url,
        method: requestDetails.method,
        headers: {
          'Authorization': requestDetails.headers.Authorization,
          'Content-Type': requestDetails.headers['Content-Type']
        },
        bodyKeys: Object.keys(requestBody),
        inputsKeys: Object.keys(inputs),
        query,
        conversationId
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Dify Chat Stream API 响应状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { raw: errorText };
        }
        
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        console.error('❌ Dify Chat Stream API 错误:', errorData);
        onError?.(error);
        return;
      }

      // 检查响应是否为流式
      if (!response.body) {
        const error = new Error('响应体为空');
        onError?.(error);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('🏁 流式响应结束');
            onComplete?.();
            break;
          }

          // 解码数据块
          buffer += decoder.decode(value, { stream: true });
          
          // 处理缓冲区中的完整事件
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后不完整的行

          for (const line of lines) {
            if (line.trim() === '') continue;
            
            // 解析SSE格式
            if (line.startsWith('data: ')) {
              const data = line.slice(6); // 移除 "data: " 前缀
              
              if (data === '[DONE]') {
                console.log('🏁 流式响应完成标志');
                onComplete?.();
                return;
              }

              try {
                const eventData = JSON.parse(data);
                console.log('📦 收到流式数据块:', eventData);
                
                // 构造标准化的数据块
                const chunk: DifyStreamChunk = {
                  event: eventData.event || 'message',
                  data: eventData,
                  id: eventData.id
                };

                onChunk?.(chunk);
              } catch (parseError) {
                console.warn('⚠️ 解析SSE数据失败:', data, parseError);
              }
            }
          }
        }
      } catch (readerError) {
        console.error('❌ 读取流式数据失败:', readerError);
        onError?.(readerError instanceof Error ? readerError : new Error('读取流式数据失败'));
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('❌ Dify Chat Stream API 调用失败:', error);
      onError?.(error instanceof Error ? error : new Error('未知错误'));
    }
  }

  /**
   * 上传文件到Dify
   * @param file 要上传的文件
   * @param apiKey API密钥
   * @returns 上传结果
   */
  async uploadFile(file: File, apiKey: string): Promise<DifyApiResponse> {
    let requestDetails = null;
    
    try {
      const endpoint = `${this.baseUrl}/files/upload`;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user', 'user');

      requestDetails = {
        url: endpoint,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey.substring(0, 10)}...`,
        },
        fileName: file.name,
        fileSize: file.size
      };

      console.log('🔍 Dify File Upload API 请求详情:', requestDetails);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData
      });

      console.log('📡 Dify File Upload API 响应状态:', response.status, response.statusText);

      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        responseData = { raw: responseText };
      }

      console.log('📄 Dify File Upload API 响应数据:', responseData);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            responseData,
            requestDetails
          }
        };
      }
      
      return {
        success: true,
        data: responseData,
        details: {
          status: response.status,
          requestDetails
        }
      };
    } catch (error) {
      console.error('❌ Dify File Upload API 调用失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        details: {
          originalError: error,
          requestDetails
        }
      };
    }
  }

  /**
   * 运行工作流 (runWorkflow的别名)
   * @param params 工作流参数
   * @returns API响应
   */
  async runWorkflow(params: {
    toolId: string;
    inputs: Record<string, any>;
    user?: string;
  }): Promise<DifyApiResponse> {
    return this.callWorkflow(params.toolId, params.inputs, params.user || 'user');
  }
}

// 导出单例实例
export const difyApiService = new DifyApiService(); 