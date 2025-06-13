import { supabase } from '@/config/db'
import type { User } from '@supabase/supabase-js'

/**
 * 对话会话类型定义
 */
export interface Conversation {
  id: string
  user_id: string
  tool_id: string
  title: string | null
  conversation_id: string | null // Dify返回的conversation_id
  created_at: string
  updated_at: string
}

/**
 * 消息类型定义
 */
export interface Message {
  id: string
  conversation_id: string
  user_id: string
  tool_id: string
  message_type: 'user' | 'assistant' | 'system'
  content: string
  metadata?: {
    agent_thoughts?: string[]
    files?: string[]
    [key: string]: any
  }
  created_at: string
}

/**
 * 文件记录类型定义
 */
export interface UserFile {
  id: string
  user_id: string
  file_name: string
  file_type: string
  file_url: string
  file_size: number | null
  tool_id: string | null
  conversation_id: string | null
  created_at: string
}

/**
 * 数据库服务类
 */
export class DatabaseService {
  /**
   * 获取当前用户
   */
  private async getCurrentUser(): Promise<User> {
    const user = supabase.auth.user()
    if (!user) {
      throw new Error('用户未登录')
    }
    return user
  }

  // ==================== 对话会话相关操作 ====================

  /**
   * 创建新对话会话
   */
  async createConversation(toolId: string, title?: string, difyConversationId?: string): Promise<Conversation> {
    const user = await this.getCurrentUser()
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        tool_id: toolId,
        title: title || null,
        conversation_id: difyConversationId || null
      })
      .select()
      .single()

    if (error) {
      console.error('创建对话失败:', error)
      throw new Error(`创建对话失败: ${error.message}`)
    }

    return data
  }

  /**
   * 获取用户的对话历史列表
   */
  async getUserConversations(toolId?: string): Promise<Conversation[]> {
    const user = await this.getCurrentUser()
    
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (toolId) {
      query = query.eq('tool_id', toolId)
    }

    const { data, error } = await query

    if (error) {
      console.error('获取对话历史失败:', error)
      throw new Error(`获取对话历史失败: ${error.message}`)
    }

    return data || []
  }

  /**
   * 更新对话信息
   */
  async updateConversation(conversationId: string, updates: Partial<Pick<Conversation, 'title' | 'conversation_id'>>): Promise<Conversation> {
    const user = await this.getCurrentUser()
    
    const { data, error } = await supabase
      .from('conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('更新对话失败:', error)
      throw new Error(`更新对话失败: ${error.message}`)
    }

    return data
  }

  /**
   * 删除对话（会级联删除相关消息）
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const user = await this.getCurrentUser()
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('删除对话失败:', error)
      throw new Error(`删除对话失败: ${error.message}`)
    }
  }

  // ==================== 消息相关操作 ====================

  /**
   * 保存消息
   */
  async saveMessage(
    conversationId: string,
    toolId: string,
    messageType: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Message['metadata']
  ): Promise<Message> {
    const user = await this.getCurrentUser()
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        tool_id: toolId,
        message_type: messageType,
        content,
        metadata: metadata || null
      })
      .select()
      .single()

    if (error) {
      console.error('保存消息失败:', error)
      throw new Error(`保存消息失败: ${error.message}`)
    }

    return data
  }

  /**
   * 获取对话的所有消息
   */
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const user = await this.getCurrentUser()
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('获取消息失败:', error)
      throw new Error(`获取消息失败: ${error.message}`)
    }

    return data || []
  }

  /**
   * 删除消息
   */
  async deleteMessage(messageId: string): Promise<void> {
    const user = await this.getCurrentUser()
    
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', user.id)

    if (error) {
      console.error('删除消息失败:', error)
      throw new Error(`删除消息失败: ${error.message}`)
    }
  }

  // ==================== 文件相关操作 ====================

  /**
   * 保存文件记录
   */
  async saveFile(
    fileName: string,
    fileType: string,
    fileUrl: string,
    fileSize?: number,
    toolId?: string,
    conversationId?: string
  ): Promise<UserFile> {
    const user = await this.getCurrentUser()
    
    const { data, error } = await supabase
      .from('user_files')
      .insert({
        user_id: user.id,
        file_name: fileName,
        file_type: fileType,
        file_url: fileUrl,
        file_size: fileSize || null,
        tool_id: toolId || null,
        conversation_id: conversationId || null
      })
      .select()
      .single()

    if (error) {
      console.error('保存文件记录失败:', error)
      throw new Error(`保存文件记录失败: ${error.message}`)
    }

    return data
  }

  /**
   * 获取用户文件列表
   */
  async getUserFiles(conversationId?: string): Promise<UserFile[]> {
    const user = await this.getCurrentUser()
    
    let query = supabase
      .from('user_files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (conversationId) {
      query = query.eq('conversation_id', conversationId)
    }

    const { data, error } = await query

    if (error) {
      console.error('获取文件列表失败:', error)
      throw new Error(`获取文件列表失败: ${error.message}`)
    }

    return data || []
  }

  /**
   * 删除文件记录
   */
  async deleteFile(fileId: string): Promise<void> {
    const user = await this.getCurrentUser()
    
    const { error } = await supabase
      .from('user_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', user.id)

    if (error) {
      console.error('删除文件记录失败:', error)
      throw new Error(`删除文件记录失败: ${error.message}`)
    }
  }

  // ==================== 组合操作 ====================

  /**
   * 获取完整的对话数据（包含消息）
   */
  async getFullConversation(conversationId: string): Promise<{
    conversation: Conversation
    messages: Message[]
  }> {
    const user = await this.getCurrentUser()
    
    // 获取对话信息
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convError) {
      console.error('获取对话信息失败:', convError)
      throw new Error(`获取对话信息失败: ${convError.message}`)
    }

    // 获取消息列表
    const messages = await this.getConversationMessages(conversationId)

    return {
      conversation,
      messages
    }
  }

  /**
   * 清空用户的所有对话数据
   */
  async clearAllUserData(): Promise<void> {
    const user = await this.getCurrentUser()
    
    // 删除所有对话（会级联删除消息）
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('清空用户数据失败:', error)
      throw new Error(`清空用户数据失败: ${error.message}`)
    }
  }
}

// 导出单例实例
export const databaseService = new DatabaseService() 