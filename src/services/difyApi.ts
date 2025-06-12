/**
 * Dify API 服务
 * 用于调用 Dify 应用 API
 */

export interface DifyApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: any; // 添加详细错误信息
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

export class DifyApiService {
  private baseUrl: string;
  
  constructor() {
    // 修复环境变量类型问题
    const envBaseUrl = (import.meta.env as any).VITE_DIFY_API_BASE_URL;
    this.baseUrl = (typeof envBaseUrl === 'string' ? envBaseUrl : 'https://api.dify.ai/v1').replace(/\/$/, '');
  }

  /**
   * 获取指定工具的API Key
   * @param toolId 工具ID，如 'INTERVIEW'
   * @returns API Key
   */
  private getApiKey(toolId: string): string {
    // 先尝试获取工具专用的API Key
    const specificKeyName = `VITE_DIFY_API_KEY_${toolId.toUpperCase()}`;
    const specificKey = (import.meta.env as any)[specificKeyName];
    if (specificKey && typeof specificKey === 'string' && specificKey.trim()) {
      return specificKey.trim();
    }
    
    // 如果没有专用Key，使用默认Key
    const defaultKey = (import.meta.env as any).VITE_DIFY_API_KEY;
    if (!defaultKey || typeof defaultKey !== 'string' || !defaultKey.trim()) {
      throw new Error('未配置Dify API Key，请检查环境变量配置');
    }
    
    return defaultKey.trim();
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
      
      const requestBody: DifyChatRequest = {
        inputs,
        query,
        response_mode: 'blocking',
        user,
        files: [] // 可选的文件数组
      };

      // 记录请求详情用于调试
      requestDetails = {
        url: `${this.baseUrl}/chat-messages`,
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

      const response = await fetch(`${this.baseUrl}/chat-messages`, {
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
      
      const requestBody: DifyWorkflowRequest = {
        inputs,
        response_mode: 'blocking',
        user,
        files: [] // 可选的文件数组
      };

      // 记录请求详情用于调试
      requestDetails = {
        url: `${this.baseUrl}/workflows/run`,
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

      const response = await fetch(`${this.baseUrl}/workflows/run`, {
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
   * 根据应用类型调用对应的API
   * @param toolId 工具ID
   * @param appType 应用类型 ('chat' | 'workflow')
   * @param inputs 输入参数
   * @param query 查询内容（仅chat类型需要）
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
      const chatQuery = query || inputs.query || '这是一个API连接测试';
      return this.callChatApp(toolId, inputs, chatQuery, user);
    } else if (appType === 'workflow') {
      return this.callWorkflow(toolId, inputs, user);
    } else {
      return {
        success: false,
        error: `不支持的应用类型: ${appType}`,
        details: { appType, supportedTypes: ['chat', 'workflow'] }
      };
    }
  }

  /**
   * 检查API配置是否正确
   * @param toolId 工具ID
   * @returns 是否配置正确
   */
  checkApiConfig(toolId: string): boolean {
    try {
      const apiKey = this.getApiKey(toolId);
      // 基本验证：API Key应该是一个合理长度的字符串
      return apiKey.length >= 10; // 假设API Key至少10个字符
    } catch {
      return false;
    }
  }

  /**
   * 获取API配置信息（用于调试）
   * @param toolId 工具ID
   * @returns 配置信息
   */
  getApiConfigInfo(toolId: string): { hasApiKey: boolean; baseUrl: string; keyPrefix?: string } {
    try {
      const apiKey = this.getApiKey(toolId);
      return {
        hasApiKey: true,
        baseUrl: this.baseUrl,
        keyPrefix: apiKey.substring(0, 10) + '...'
      };
    } catch (error) {
      return {
        hasApiKey: false,
        baseUrl: this.baseUrl
      };
    }
  }
}

// 导出单例实例
export const difyApiService = new DifyApiService(); 