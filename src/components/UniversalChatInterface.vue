<template>
  <div class="universal-chat-interface h-full flex">
    <!-- 左侧主对话区域 -->
    <div class="flex-1 flex flex-col">
      <!-- 顶部工具栏 -->
      <div class="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div class="flex items-center justify-between">
          <!-- 工具信息 -->
          <div class="flex items-center gap-3">
            <button
              @click="goBack"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <i-lucide-arrow-left class="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
            
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: toolConfig?.iconBgColor || '#e0f2fe' }"
              >
                <component :is="toolConfig?.icon" class="h-5 w-5" />
              </div>
              <div>
                <h1 class="font-semibold text-slate-900 dark:text-white">
                  {{ toolConfig?.name || '未知工具' }}
                </h1>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {{ getAppTypeLabel(appType) }}
                </p>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2">
            <!-- 新建对话按钮 -->
            <button
              v-if="supportHistory"
              @click="startNewConversation"
              class="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 
                     hover:text-slate-800 dark:hover:text-slate-200
                     hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors
                     flex items-center gap-2"
            >
              <i-lucide-plus class="h-4 w-4" />
              新对话
            </button>

            <!-- 清空对话按钮 -->
            <button
              v-if="supportHistory && messages.length > 0"
              @click="clearConversation"
              class="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 
                     hover:text-slate-800 dark:hover:text-slate-200
                     hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              清空对话
            </button>
            
            <!-- 应用类型标识 -->
            <div class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 
                        text-xs rounded-md font-medium">
              {{ appType }}
            </div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Chat/Agent 模式：改进的对话界面 -->
        <template v-if="appType === 'chat' || appType === 'agent'">
          <!-- 消息列表 -->
          <div 
            ref="messagesContainer"
            class="flex-1 overflow-y-auto p-6 space-y-6"
          >
            <!-- 欢迎消息 -->
            <div v-if="messages.length === 0" class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 
                          rounded-full mb-4">
                <i-lucide-message-circle class="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">
                开始对话
              </h3>
              <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {{ toolConfig?.description || '请输入您的问题，我会尽力为您解答。' }}
              </p>
            </div>

            <!-- 消息气泡 - 全新设计 -->
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="space-y-3"
            >
              <!-- Agent思考过程 - 独立区块（在消息气泡外） -->
              <div v-if="message.role === 'assistant' && message.agent_thoughts && message.agent_thoughts.length > 0" 
                   class="flex gap-4">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                       :style="{ backgroundColor: toolConfig?.iconBgColor || '#e0f2fe' }">
                    <component :is="toolConfig?.icon" class="h-4 w-4" />
                  </div>
                </div>
                <div class="flex-1">
                  <!-- 思考过程展开/收起按钮 -->
                  <div class="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      <button 
                          @click="toggleThoughts(index)"
                          class="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      >
                          <i-lucide-lightbulb class="h-3 w-3 text-amber-500" />
                          <span>已深度思考 (用时8秒)</span>
                          <i-lucide-chevron-down 
                              class="h-3 w-3 transition-transform"
                              :class="{ 'rotate-180': message.showThoughts }"
                          />
                      </button>
                  </div>
                  
                  <!-- 思考过程内容 - 可展开收起 -->
                  <div v-if="message.showThoughts" 
                      class="rounded-lg p-3 text-xs leading-relaxed space-y-2 mb-3">
                      <div class="flex items-center gap-1 mb-1">
                          <i-lucide-lightbulb class="h-3 w-3 text-amber-500" />
                          <span class="text-slate-600 dark:text-slate-300">思考过程</span>
                      </div>
                      <div class="rounded p-1 text-slate-700 dark:text-slate-300">
                          <div v-for="(thought, idx) in message.agent_thoughts" :key="idx" class="flex gap-2 items-start">
                              <span class="text-slate-500 text-sm">•</span>
                              <div class="flex-1">{{ thought }}</div>
                          </div>
                      </div>
                  </div>
                </div>
              </div>

              <!-- 消息气泡 -->
              <div class="flex gap-4"
                   :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
                <!-- 头像 -->
                <div class="flex-shrink-0">
                  <div v-if="message.role === 'user'" 
                       class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <i-lucide-user class="h-4 w-4 text-white" />
                  </div>
                  <div v-else 
                       class="w-8 h-8 rounded-lg flex items-center justify-center"
                       :style="{ backgroundColor: toolConfig?.iconBgColor || '#e0f2fe' }">
                    <component :is="toolConfig?.icon" class="h-4 w-4" />
                  </div>
                </div>

                <!-- 消息内容区域 -->
                <div class="flex-1 min-w-0">
                  <div
                    class="rounded-lg px-4 py-3 max-w-[85%]"
                    :class="message.role === 'user' 
                      ? 'bg-blue-600 text-white ml-auto' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'"
                  >
                    <!-- 思考过程 - 在消息气泡内 -->
                    <div v-if="message.role === 'assistant' && message.agent_thoughts && message.agent_thoughts.length > 0" 
                        class="mb-3">
                      <div class="flex items-center gap-1 mb-1">
                        <i-lucide-lightbulb class="h-3 w-3 text-amber-500" />
                        <!-- 移除独立背景色，调整文字样式 -->
                        <span class="bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400 font-normal">
                          正在思考...
                        </span>
                      </div>
                      <!-- 移除背景色，调整文字样式使其更紧凑 -->
                      <div class="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-tight font-normal">
                        {{ message.agent_thoughts.join('\n') }}
                      </div>
                    </div>

                    <!-- 正式回复内容 - 突出显示 -->
                    <div class="text-base leading-relaxed whitespace-pre-wrap font-medium">
                      <div v-html="renderedContent(message.content)"></div>
                    </div>
                    
                    <!-- 时间戳 -->
                    <div class="text-xs opacity-60 mt-2">
                      {{ formatTime(message.timestamp) }}
                    </div>
                  </div>

                  <!-- AI消息操作按钮 -->
                  <div v-if="message.role === 'assistant' && message.content" 
                       class="flex items-center gap-2 mt-2 ml-2">
                    <button
                      @click="copyMessage(message.content)"
                      class="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 
                             hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="复制消息"
                    >
                      <i-lucide-copy class="h-4 w-4" />
                    </button>
                    <button
                      @click="favoriteMessage(message)"
                      class="p-1.5 text-slate-400 hover:text-amber-500 
                             hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      title="收藏消息"
                    >
                      <i-lucide-star class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 加载中指示器 - 改进版 -->
            <div v-if="isLoading" class="flex gap-4">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                     :style="{ backgroundColor: toolConfig?.iconBgColor || '#e0f2fe' }">
                  <component :is="toolConfig?.icon" class="h-4 w-4" />
                </div>
              </div>
              <div class="flex-1">
                <div class="bg-slate-100 dark:bg-slate-700 px-4 py-3 rounded-lg inline-block">
                  <div class="flex items-center gap-2">
                    <i-lucide-loader-2 class="h-4 w-4 animate-spin text-slate-500" />
                    <span class="text-slate-500 dark:text-slate-400">正在思考...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 p-4">
            <div class="flex gap-3">
              <div class="flex-1 relative">
                <textarea
                  v-model="currentMessage"
                  @keydown="handleKeydown"
                  placeholder="输入您的问题..."
                  rows="1"
                  class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                         resize-none overflow-hidden"
                  :disabled="isLoading"
                ></textarea>
              </div>
              <button
                @click="sendMessage"
                :disabled="!currentMessage.trim() || isLoading"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       disabled:bg-slate-400 disabled:cursor-not-allowed
                       flex items-center justify-center min-w-[100px]"
              >
                <i-lucide-send v-if="!isLoading" class="h-4 w-4" />
                <i-lucide-loader-2 v-else class="h-4 w-4 animate-spin" />
              </button>
            </div>
          </div>
        </template>

        <!-- Workflow/Completion 模式：表单式界面 -->
        <template v-else>
          <div class="flex-1 overflow-y-auto p-6">
            <!-- 结果展示区域 -->
            <div v-if="workflowResult" class="mb-6">
              <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                          rounded-lg p-4">
                <h3 class="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <i-lucide-check-circle class="h-5 w-5" />
                  执行结果
                </h3>
                <div class="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                  {{ workflowResult }}
                </div>
                <div class="text-xs text-green-600 dark:text-green-400 mt-2">
                  执行时间: {{ workflowTimestamp ? formatTime(workflowTimestamp) : '--' }}
                </div>
              </div>
            </div>

            <!-- 错误信息展示 -->
            <div v-if="errorMessage" class="mb-6">
              <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                          rounded-lg p-4">
                <h3 class="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <i-lucide-alert-circle class="h-5 w-5" />
                  执行失败
                </h3>
                <div class="text-red-800 dark:text-red-200">
                  {{ errorMessage }}
                </div>
              </div>
            </div>

            <!-- 动态输入表单 -->
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
                        rounded-lg p-6">
              <h3 class="font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <i-lucide-settings class="h-5 w-5" />
                参数配置
              </h3>
              
              <DynamicInputForm
                :fields="workflowFields"
                :allow-add-fields="true"
                @submit="executeWorkflow"
                @change="onFormDataChange"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 右侧对话历史区域 -->
    <div v-if="supportHistory" class="w-80 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col">
      <!-- 历史区域头部 -->
      <div class="p-4 border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-slate-900 dark:text-white">历史对话</h3>
          <button
            @click="startNewConversation"
            class="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 
                   hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            title="新建对话"
          >
            <i-lucide-plus class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- 对话历史列表 -->
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <!-- 加载状态 -->
        <div v-if="isLoadingHistory" class="text-center py-8">
          <div class="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p class="text-sm text-slate-500 dark:text-slate-400">加载中...</p>
        </div>

        <!-- 对话列表 -->
        <div
          v-for="(conversation, index) in conversationHistory"
          :key="conversation.id"
          class="group relative p-3 rounded-lg cursor-pointer transition-colors"
          :class="conversation.id === conversationId 
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' 
            : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'"
        >
          <div @click="loadConversation(conversation)" class="pr-8">
            <div class="font-medium text-sm truncate">
              {{ conversation.title || '新对话' }}
            </div>
            <div class="text-xs opacity-75 mt-1">
              {{ formatTime(conversation.updatedAt) }}
            </div>
          </div>
          
          <!-- 删除按钮 -->
          <button
            @click.stop="deleteConversation(conversation.id)"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 
                   opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="删除对话"
          >
            <i-lucide-trash-2 class="h-3 w-3" />
          </button>
        </div>

        <!-- 空状态 -->
        <div v-if="!isLoadingHistory && conversationHistory.length === 0" class="text-center py-8">
          <i-lucide-message-circle class="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p class="text-sm text-slate-500 dark:text-slate-400">暂无历史对话</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { DifyAppConfig } from '@/config/ai'
import { difyApiService } from '@/services/difyApi'
import { databaseService, type Conversation, type Message } from '@/services/database'
import DynamicInputForm, { type FormField } from './DynamicInputForm.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * 消息类型定义 - 前端使用的消息类型
 */
interface ChatMessage {
  id?: string // 数据库ID，可选
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  agent_thoughts?: string[] // Agent思考过程
  showThoughts?: boolean // 是否显示思考过程
  metadata?: {
    agent_thoughts?: string[]
    files?: string[]
    [key: string]: any
  }
}

/**
 * 对话历史类型定义 - 前端使用的对话历史类型
 */
interface ConversationHistory {
  id: string
  title: string
  updatedAt: Date
  messages: ChatMessage[]
  difyConversationId?: string // Dify返回的conversation_id
}

/**
 * 组件属性
 */
interface Props {
  toolConfig: DifyAppConfig
  toolId: string
}

const props = defineProps<Props>()
const router = useRouter()

// 基础状态
const isLoading = ref(false)
const errorMessage = ref('')

// 根据工具类型确定应用类型
const appType = computed(() => {
  // 从工具配置中获取类型，如果没有则根据ID推断
  if (props.toolConfig.type) {
    return props.toolConfig.type
  }
  
  // 根据工具ID推断类型（可以扩展这个逻辑）
  const toolId = props.toolId.toLowerCase()
  if (toolId.includes('chat') || toolId.includes('assistant')) {
    return 'chat'
  } else if (toolId.includes('workflow')) {
    return 'workflow'
  } else if (toolId.includes('completion')) {
    return 'completion'
  }
  
  // 默认为chat类型
  return 'chat'
})

// 是否支持对话历史
const supportHistory = computed(() => {
  return appType.value === 'chat' || appType.value === 'agent'
})

// Chat模式相关状态
const messages = reactive<ChatMessage[]>([])
const currentMessage = ref('')
const conversationId = ref<string>()
const messagesContainer = ref<HTMLElement>()

// Workflow/Completion模式相关状态
const workflowResult = ref('')
const workflowTimestamp = ref<Date>()
const workflowFields = ref<FormField[]>([])

// 当前表单数据
const currentFormData = reactive<{
  formData: Record<string, any>
  fileData: Record<string, File[]>
}>({
  formData: {},
  fileData: {}
})

// 对话历史相关状态
const conversationHistory = ref<ConversationHistory[]>([])

// 数据库相关状态
const currentDbConversation = ref<Conversation | null>(null)
const isLoadingHistory = ref(false)

/**
 * 获取应用类型标签
 */
const getAppTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    chat: '聊天助手',
    agent: 'AI智能体',
    workflow: '工作流',
    completion: '文本生成'
  }
  return labels[type] || type
}

/**
 * 格式化时间
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 开始新对话
 */
const startNewConversation = async () => {
  // 清空当前对话
  clearConversation()
  
  // 重置数据库对话状态
  currentDbConversation.value = null
  conversationId.value = undefined
  
  // 重新加载历史对话列表
  await loadConversationHistory()
}

/**
 * 加载历史对话
 */
const loadConversation = async (conversation: ConversationHistory) => {
  // 清空当前对话
  clearConversation()

  // 设置对话状态
  conversationId.value = conversation.id
  currentDbConversation.value = {
    id: conversation.id,
    user_id: '', // 会在数据库服务中自动填充
    tool_id: props.toolId,
    title: conversation.title,
    conversation_id: conversation.difyConversationId || null,
    created_at: '',
    updated_at: conversation.updatedAt.toISOString()
  }
  
  // 加载消息
  messages.splice(0, messages.length, ...conversation.messages)
  
  await scrollToBottom()
}

/**
 * 删除对话
 */
const deleteConversation = async (conversationId: string) => {
  try {
    await databaseService.deleteConversation(conversationId)
    
    // 从历史列表中移除
    const index = conversationHistory.value.findIndex(c => c.id === conversationId)
    if (index >= 0) {
      conversationHistory.value.splice(index, 1)
    }
    
    // 如果删除的是当前对话，开始新对话
    if (currentDbConversation.value?.id === conversationId) {
      await startNewConversation()
    }
  } catch (error) {
    console.error('删除对话失败:', error)
  }
}

/**
 * 清空对话
 */
const clearConversation = () => {
  messages.splice(0)
  conversationId.value = undefined
  errorMessage.value = ''
}

/**
 * 复制消息内容
 */
const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    // 可以添加一个toast提示
    console.log('✅ 消息已复制到剪贴板')
  } catch (error) {
    console.error('❌ 复制失败:', error)
    // 降级方案：创建临时文本区域
    const textArea = document.createElement('textarea')
    textArea.value = content
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

/**
 * 收藏消息
 */
const favoriteMessage = (message: ChatMessage) => {
  // 这里可以集成到数据库存储
  console.log('⭐ 收藏消息:', message)
  // 可以添加一个toast提示
}

/**
 * 滚动到底部
 */
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

/**
 * 处理键盘事件
 */
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

/**
 * 发送消息 (Chat/Agent模式) - 改进的流式版本
 */
const sendMessage = async () => {
  const message = currentMessage.value.trim()
  if (!message || isLoading.value) return

  // 确保对话已初始化
  await initializeConversation()

  // 添加用户消息
  const userMessage: ChatMessage = {
    role: 'user',
    content: message,
    timestamp: new Date(),
    showThoughts: false
  }
  messages.push(userMessage)

  // 保存用户消息到数据库
  await saveMessageToDb(userMessage)

  currentMessage.value = ''
  isLoading.value = true
  errorMessage.value = ''

  await scrollToBottom()

  // 添加助手消息占位符
  const assistantMessageIndex = messages.length;
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    showThoughts: false,
    metadata: {}
  }
  messages.push(assistantMessage);

  try {
    // 流式调用
    await difyApiService.callChatAppStream(
      props.toolId.toUpperCase(),
      currentFormData.formData,
      message,
      'user',
      currentDbConversation.value?.conversation_id || undefined,
      // 数据块回调
      (chunk) => {
        console.log('📦 收到流式数据块:', chunk);
        
        // 处理不同类型的事件
        if (chunk.event === 'agent_message' || chunk.event === 'message') {
          // Agent消息或普通消息
          if (chunk.data?.answer) {
            messages[assistantMessageIndex].content += chunk.data.answer;
            scrollToBottom();
          }
        } else if (chunk.event === 'agent_thought') {
          // Agent思考过程
          if (chunk.data?.thought) {
            if (!messages[assistantMessageIndex].agent_thoughts) {
              messages[assistantMessageIndex].agent_thoughts = [];
            }
            messages[assistantMessageIndex].agent_thoughts!.push(chunk.data.thought);
            
            // 更新metadata
            if (!messages[assistantMessageIndex].metadata) {
              messages[assistantMessageIndex].metadata = {};
            }
            messages[assistantMessageIndex].metadata!.agent_thoughts = messages[assistantMessageIndex].agent_thoughts;
          }
        } else if (chunk.event === 'message_end') {
          // 消息结束，更新Dify对话ID
          if (chunk.data?.conversation_id && currentDbConversation.value) {
            // 更新数据库中的Dify对话ID
            databaseService.updateConversation(currentDbConversation.value.id, {
              conversation_id: chunk.data.conversation_id
            }).catch(error => {
              console.error('更新Dify对话ID失败:', error)
            })
          }
        }
      },
      // 错误回调
      (error) => {
        console.error('❌ 流式响应错误:', error);
        errorMessage.value = error.message;
        // 如果有错误，移除空的助手消息
        if (messages[assistantMessageIndex] && !messages[assistantMessageIndex].content) {
          messages.splice(assistantMessageIndex, 1);
        }
      },
      // 完成回调
      async () => {
        console.log('✅ 流式响应完成');
        isLoading.value = false;
        // 如果消息为空，显示错误提示
        if (!messages[assistantMessageIndex]?.content) {
          messages[assistantMessageIndex].content = '抱歉，我没有收到有效的响应。';
        }
        
        // 保存助手消息到数据库
        await saveMessageToDb(messages[assistantMessageIndex]);
        
        // 更新对话标题（如果是第一条消息）
        if (messages.length === 2 && currentDbConversation.value) {
          const title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '');
          await databaseService.updateConversation(currentDbConversation.value.id, { title });
        }
      }
    );
  } catch (error) {
    console.error('❌ 发送消息失败:', error);
    errorMessage.value = error instanceof Error ? error.message : '发送失败';
    isLoading.value = false;
    
    // 移除空的助手消息
    if (messages[assistantMessageIndex] && !messages[assistantMessageIndex].content) {
      messages.splice(assistantMessageIndex, 1);
    }
  }
}

/**
 * 执行工作流/文本生成
 */
const executeWorkflow = async (data: { formData: Record<string, any>; fileData: Record<string, File[]> }) => {
  if (isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''
  workflowResult.value = ''

  try {
    let response

    if (appType.value === 'workflow') {
      // 调用工作流API
      response = await difyApiService.callWorkflow(
        props.toolId.toUpperCase(),
        data.formData,
        'user'
      )
    } else if (appType.value === 'completion') {
      // 调用文本生成API - 需要实现这个方法
      // 这里先用现有的方法，后续可以添加专门的completion方法
      response = await difyApiService.callApp(
        props.toolId.toUpperCase(),
        'completion',
        data.formData,
        undefined, // completion不需要query
        'user'
      )
    } else {
      throw new Error('不支持的应用类型')
    }

    if (response.success && response.data) {
      workflowResult.value = response.data.answer || response.data.result || response.data.data || '执行完成'
      workflowTimestamp.value = new Date()
    } else {
      throw new Error(response.error || '执行失败')
    }
  } catch (error) {
    console.error('执行失败:', error)
    errorMessage.value = error instanceof Error ? error.message : '执行失败'
  } finally {
    isLoading.value = false
  }
}

/**
 * 表单数据变化处理
 */
const onFormDataChange = (data: { formData: Record<string, any>; fileData: Record<string, File[]> }) => {
  Object.assign(currentFormData.formData, data.formData)
  Object.assign(currentFormData.fileData, data.fileData)
}

/**
 * 初始化工作流字段
 */
const initWorkflowFields = () => {
  // 根据应用类型初始化不同的默认字段
  if (appType.value === 'workflow') {
    workflowFields.value = [
      {
        name: 'input_text',
        label: '输入文本',
        type: 'textarea',
        placeholder: '请输入要处理的文本...',
        required: true,
        rows: 4
      }
    ]
  } else if (appType.value === 'completion') {
    workflowFields.value = [
      {
        name: 'prompt',
        label: '提示词',
        type: 'textarea',
        placeholder: '请输入提示词...',
        required: true,
        rows: 6
      }
    ]
  }
}

/**
 * 初始化组件
 */
onMounted(async () => {
  if (supportHistory.value) {
    // 加载对话历史
    await loadConversationHistory()
  } else {
    // 初始化工作流字段
    initWorkflowFields()
  }
})

// 监听应用类型变化
watch(appType, () => {
  if (!supportHistory.value) {
    initWorkflowFields()
  }
}, { immediate: true })

/**
 * 切换思考过程的显示状态
 */
const toggleThoughts = (index: number) => {
  if (messages[index]) {
    messages[index].showThoughts = !messages[index].showThoughts
  }
}

/**
 * 渲染Markdown内容
 */
const renderedContent = computed(() => {
  return (content: string) => {
    if (!content) return ''
    const html = marked(content)
    return DOMPurify.sanitize(html)
  }
})

/**
 * 初始化对话 - 创建或加载数据库对话
 */
const initializeConversation = async () => {
  try {
    if (!conversationId.value) {
      // 创建新对话
      const dbConversation = await databaseService.createConversation(
        props.toolId,
        '新对话'
      )
      currentDbConversation.value = dbConversation
      conversationId.value = dbConversation.id
    }
  } catch (error) {
    console.error('初始化对话失败:', error)
  }
}

/**
 * 保存消息到数据库
 */
const saveMessageToDb = async (message: ChatMessage) => {
  try {
    if (!conversationId.value) {
      await initializeConversation()
    }
    
    if (conversationId.value) {
      const dbMessage = await databaseService.saveMessage(
        conversationId.value,
        props.toolId,
        message.role,
        message.content,
        message.metadata
      )
      
      // 更新消息的数据库ID
      message.id = dbMessage.id
    }
  } catch (error) {
    console.error('保存消息失败:', error)
  }
}

/**
 * 从数据库加载对话历史
 */
const loadConversationHistory = async () => {
  try {
    isLoadingHistory.value = true
    const conversations = await databaseService.getUserConversations(props.toolId)
    
    // 转换为前端格式
    const historyPromises = conversations.map(async (conv) => {
      const messages = await databaseService.getConversationMessages(conv.id)
      return {
        id: conv.id,
        title: conv.title || '未命名对话',
        updatedAt: new Date(conv.updated_at),
        difyConversationId: conv.conversation_id || undefined,
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.message_type,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          metadata: msg.metadata,
          agent_thoughts: msg.metadata?.agent_thoughts,
          showThoughts: false
        })) as ChatMessage[]
      } as ConversationHistory
    })
    
    conversationHistory.value = await Promise.all(historyPromises)
  } catch (error) {
    console.error('加载对话历史失败:', error)
  } finally {
    isLoadingHistory.value = false
  }
}
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-slate-100 dark:bg-slate-800;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-slate-300 dark:bg-slate-600 rounded-full;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-400 dark:bg-slate-500;
}

/* 文本域自动调整高度 */
textarea {
  field-sizing: content;
  max-height: 120px;
}
</style> 