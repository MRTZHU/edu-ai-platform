<template>
  <div class="smart-floating-input fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent">
    <!-- 主输入框容器 -->
    <div 
      class="input-container w-full max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-3xl shadow-2xl transition-all duration-300"
      :class="{ 
        'border-blue-500/50 shadow-blue-500/20': isFocused,
        'border-red-500/50 shadow-red-500/20': isGenerating 
      }"
    >
      <!-- 文件预览区域 -->
      <div v-if="uploadedFiles.length > 0" class="file-preview-area p-4 pb-0">
        <div class="flex flex-wrap gap-3">
          <div 
            v-for="(file, index) in uploadedFiles" 
            :key="index"
            class="relative group"
          >
            <!-- 图片预览 -->
            <div 
              v-if="file.type.startsWith('image/')"
              class="w-16 h-16 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              @click="openImagePreview(file.preview)"
            >
              <img 
                :src="file.preview" 
                :alt="file.name"
                class="w-full h-full object-cover"
              />
              <button
                @click.stop="removeFile(index)"
                class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <i-heroicons-outline:x-circle class="h-4 w-4" />
              </button>
            </div>
            
            <!-- 音频预览 -->
            <div 
              v-else-if="file.type.startsWith('audio/')"
              class="flex items-center gap-2 bg-slate-800 rounded-xl p-3 min-w-48"
            >
              <i-heroicons-outline:music-note class="h-5 w-5 text-purple-400" />
              <div class="flex-1 min-w-0">
                <p class="text-sm text-white truncate">{{ file.name }}</p>
                <p class="text-xs text-slate-400">{{ formatFileSize(file.size) }}</p>
              </div>
              <button
                @click="removeFile(index)"
                class="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <i-heroicons-outline:x-circle class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 主输入区域 -->
      <div class="main-input-area p-4">
        <!-- 文本输入框 -->
        <div v-if="currentTool?.features.supportTextInput" class="text-input-area mb-4">
          <textarea
            ref="textareaRef"
            v-model="textInput"
            :placeholder="getPlaceholder()"
            :disabled="isGenerating"
            @focus="isFocused = true"
            @blur="isFocused = false"
            @keydown="handleKeyDown"
            @input="adjustTextareaHeight"
            class="w-full bg-transparent text-white placeholder-slate-400 border-none outline-none resize-none text-base leading-relaxed min-h-[44px] max-h-48"
            rows="1"
          />
        </div>

        <!-- 操作按钮区域 -->
        <div class="actions-area flex items-center justify-between">
          <!-- 左侧功能按钮 -->
          <div class="flex items-center gap-2">
            <!-- 图片上传按钮 -->
            <button
              v-if="currentTool?.features.supportImageInput"
              @click="triggerImageUpload"
              :disabled="isGenerating"
              class="action-button flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="上传图片"
            >
              <i-heroicons-outline:camera class="h-5 w-5" />
            </button>

            <!-- 音频上传按钮 -->
            <button
              v-if="currentTool?.features.supportAudioInput"
              @click="triggerAudioUpload"
              :disabled="isGenerating"
              class="action-button flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-purple-400 hover:bg-purple-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="上传音频"
            >
              <i-heroicons-outline:music-note class="h-5 w-5" />
            </button>

            <!-- 语音录制按钮 -->
            <button
              v-if="currentTool?.features.supportAudioInput"
              @click="toggleVoiceRecording"
              :disabled="isGenerating"
              class="action-button flex items-center justify-center w-8 h-8 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              :class="isRecording 
                ? 'text-red-400 bg-red-400/10 animate-pulse' 
                : 'text-slate-400 hover:text-red-400 hover:bg-red-400/10'"
              :title="isRecording ? '停止录音' : '开始录音'"
            >
              <i-heroicons-outline:microphone v-if="!isRecording" class="h-5 w-5" />
              <i-heroicons-outline:stop v-else class="h-5 w-5" />
            </button>

            <!-- 录音状态指示器 -->
            <div v-if="isRecording" class="flex items-center gap-2 text-red-400 text-sm">
              <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span>{{ formatRecordingTime(recordingTime) }}</span>
            </div>
          </div>

          <!-- 右侧发送按钮 -->
          <button
            @click="handleSubmit"
            :disabled="!canSubmit"
            class="send-button flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
            :class="canSubmit 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/25' 
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'"
            :title="isGenerating ? '生成中...' : '发送'"
          >
            <i-heroicons-outline:paper-airplane v-if="!isGenerating" class="h-5 w-5 transform rotate-45" />
            <div v-else class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          </button>
        </div>
      </div>

      <!-- 生成进度指示器 -->
      <div v-if="isGenerating" class="progress-area px-4 pb-4">
        <div class="bg-slate-800 rounded-lg p-3">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span class="text-sm text-slate-300">{{ generatingMessage }}</span>
          </div>
          <div class="w-full bg-slate-700 rounded-full h-2">
            <div 
              class="bg-blue-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${generatingProgress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="imageInputRef"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleImageUpload"
    />
    
    <input
      ref="audioInputRef"
      type="file"
      accept="audio/*"
      multiple
      class="hidden"
      @change="handleAudioUpload"
    />

    <!-- 图片预览模态框 -->
    <div 
      v-if="previewImage"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      @click="closeImagePreview"
    >
      <div class="relative max-w-4xl max-h-[90vh] p-4">
        <img 
          :src="previewImage" 
          alt="预览图片"
          class="max-w-full max-h-full object-contain rounded-lg"
        />
        <button
          @click="closeImagePreview"
          class="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <i-heroicons-outline:x-circle class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { PaintingToolConfig } from '@/config/ai/painting'

interface Props {
  availableTools: PaintingToolConfig[]
  currentToolId: string
  isGenerating?: boolean
  generatingMessage?: string
  generatingProgress?: number
}

const props = withDefaults(defineProps<Props>(), {
  isGenerating: false,
  generatingMessage: '正在生成...',
  generatingProgress: 0
})

const emit = defineEmits<{
  (e: 'tool-changed', tool: PaintingToolConfig | null): void
  (e: 'form-submitted', data: { inputs: Record<string, any>, files?: File[] }): void
  (e: 'generation-cancelled'): void
}>()

// 响应式数据
const textInput = ref('')
const uploadedFiles = ref<Array<{ file: File, preview: string, name: string, size: number, type: string }>>([])
const isFocused = ref(false)
const isRecording = ref(false)
const recordingTime = ref(0)
const previewImage = ref<string | null>(null)

// DOM引用
const textareaRef = ref<HTMLTextAreaElement>()
const imageInputRef = ref<HTMLInputElement>()
const audioInputRef = ref<HTMLInputElement>()

// 录音相关
let recordingInterval: NodeJS.Timeout | null = null
let mediaRecorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []

// 计算属性
const currentTool = computed(() => {
  return props.availableTools.find(tool => tool.id === props.currentToolId) || null
})

const canSubmit = computed(() => {
  if (props.isGenerating) return false
  
  const hasText = textInput.value.trim().length > 0
  const hasFiles = uploadedFiles.value.length > 0
  
  return hasText || hasFiles
})

/**
 * 获取占位符文本
 */
const getPlaceholder = () => {
  if (!currentTool.value) return '请输入内容...'
  
  const tool = currentTool.value
  const placeholders = {
    'TEXT_TO_IMAGE': '描述您想要生成的图片...',
    'IMAGE_TO_IMAGE': '描述您想要的图片风格或修改...',
    'TEXT_TO_MUSIC': '描述您想要创作的音乐风格...',
    'TEXT_TO_VIDEO': '描述您想要生成的视频内容...'
  }
  
  return placeholders[tool.id as keyof typeof placeholders] || `使用 ${tool.name} 创作...`
}

/**
 * 文件处理方法
 */
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const createFilePreview = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(file)
  })
}

/**
 * 图片上传处理
 */
const triggerImageUpload = () => {
  imageInputRef.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files) return
  
  for (const file of Array.from(files)) {
    if (file.type.startsWith('image/')) {
      const preview = await createFilePreview(file)
      uploadedFiles.value.push({
        file,
        preview,
        name: file.name,
        size: file.size,
        type: file.type
      })
    }
  }
  
  // 清空input
  target.value = ''
}

/**
 * 音频上传处理
 */
const triggerAudioUpload = () => {
  audioInputRef.value?.click()
}

const handleAudioUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files) return
  
  for (const file of Array.from(files)) {
    if (file.type.startsWith('audio/')) {
      uploadedFiles.value.push({
        file,
        preview: '',
        name: file.name,
        size: file.size,
        type: file.type
      })
    }
  }
  
  // 清空input
  target.value = ''
}

/**
 * 语音录制处理
 */
const toggleVoiceRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    recordedChunks = []
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data)
      }
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/webm' })
      const file = new File([blob], `录音_${Date.now()}.webm`, { type: 'audio/webm' })
      
      uploadedFiles.value.push({
        file,
        preview: '',
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      // 停止所有音频轨道
      stream.getTracks().forEach(track => track.stop())
    }
    
    mediaRecorder.start()
    isRecording.value = true
    recordingTime.value = 0
    
    // 开始计时
    recordingInterval = setInterval(() => {
      recordingTime.value++
    }, 1000)
    
  } catch (error) {
    console.error('录音失败:', error)
    alert('无法访问麦克风，请检查权限设置')
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  
  isRecording.value = false
  recordingTime.value = 0
  
  if (recordingInterval) {
    clearInterval(recordingInterval)
    recordingInterval = null
  }
}

const formatRecordingTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 文件管理
 */
const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
}

const openImagePreview = (imageUrl: string) => {
  previewImage.value = imageUrl
}

const closeImagePreview = () => {
  previewImage.value = null
}

/**
 * 文本框自适应高度
 */
const adjustTextareaHeight = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 192) + 'px'
    }
  })
}

/**
 * 键盘事件处理
 */
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

/**
 * 表单提交
 */
const handleSubmit = () => {
  if (!canSubmit.value) return
  
  const inputs: Record<string, any> = {}
  
  // 添加文本输入 - 修复API参数名称
  if (textInput.value.trim()) {
    inputs.text = textInput.value.trim()  // Dify API要求的参数名是text
    inputs.prompt = textInput.value.trim() // 保留prompt作为备用
    inputs.description = textInput.value.trim()
  }
  
  // 添加文件信息
  const files = uploadedFiles.value.map(item => item.file)
  
  // 根据工具类型添加特定字段
  if (currentTool.value) {
    inputs.tool_id = currentTool.value.id
    inputs.tool_name = currentTool.value.name
    
    // 为不同类型的工具添加特定参数
    if (currentTool.value.id === 'text-to-image') {
      inputs.width = 1024
      inputs.height = 1024
      inputs.steps = 20
    } else if (currentTool.value.id === 'image-to-image') {
      inputs.strength = 0.8
    }
  }
  
  // 发送数据
  emit('form-submitted', { inputs, files })
  
  // 清空表单
  textInput.value = ''
  uploadedFiles.value = []
  
  // 重置文本框高度
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

/**
 * 拖拽上传支持
 */
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  
  const files = Array.from(event.dataTransfer?.files || [])
  
  for (const file of files) {
    if (file.type.startsWith('image/') && currentTool.value?.features.supportImageInput) {
      const preview = await createFilePreview(file)
      uploadedFiles.value.push({
        file,
        preview,
        name: file.name,
        size: file.size,
        type: file.type
      })
    } else if (file.type.startsWith('audio/') && currentTool.value?.features.supportAudioInput) {
      uploadedFiles.value.push({
        file,
        preview: '',
        name: file.name,
        size: file.size,
        type: file.type
      })
    }
  }
}

/**
 * 粘贴上传支持
 */
const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return
  
  for (const item of Array.from(items)) {
    if (item.type.startsWith('image/') && currentTool.value?.features.supportImageInput) {
      const file = item.getAsFile()
      if (file) {
        event.preventDefault()
        const preview = await createFilePreview(file)
        uploadedFiles.value.push({
          file,
          preview,
          name: file.name || `粘贴图片_${Date.now()}.png`,
          size: file.size,
          type: file.type
        })
      }
    }
  }
}

// 生命周期
onMounted(() => {
  // 添加全局事件监听
  document.addEventListener('dragover', handleDragOver)
  document.addEventListener('dragleave', handleDragLeave)
  document.addEventListener('drop', handleDrop)
  document.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  // 清理事件监听
  document.removeEventListener('dragover', handleDragOver)
  document.removeEventListener('dragleave', handleDragLeave)
  document.removeEventListener('drop', handleDrop)
  document.removeEventListener('paste', handlePaste)
  
  // 清理录音
  if (recordingInterval) {
    clearInterval(recordingInterval)
  }
  if (mediaRecorder) {
    mediaRecorder.stop()
  }
})

// 监听工具变化
watch(() => props.currentToolId, () => {
  // 工具切换时清空表单
  textInput.value = ''
  uploadedFiles.value = []
  isRecording.value = false
  
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
})
</script>

<style scoped>
.smart-floating-input {
  /* 底部固定输入框 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.input-container {
  /* 输入框容器样式 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.action-button {
  /* 操作按钮样式 */
}

.send-button {
  /* 发送按钮样式 */
}

/* 文本框滚动条样式 */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background-color: #475569;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background-color: #64748b;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .smart-floating-input {
    padding: 1rem;
  }
  
  .input-container {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .smart-floating-input {
    padding: 0.75rem;
  }
  
  .input-container {
    border-radius: 1.5rem;
  }
  
  .file-preview-area .flex {
    gap: 0.5rem;
  }
  
  .actions-area {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}

/* 确保页面内容不被底部输入框遮挡 */
body {
  padding-bottom: 120px; /* 为底部输入框预留空间 */
}
</style> 