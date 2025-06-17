<template>
  <div class="artwork-viewer" :class="{ 'fullscreen': isFullscreen }">
    <!-- 图片作品 -->
    <div v-if="isImageArtwork" class="image-artwork">
      <!-- 统一图片显示容器 -->
      <div class="image-container">
        <img
          :src="artwork.output_image_url"
          :alt="artwork.title || '作品'"
          class="artwork-image"
          @load="onImageLoad"
          @error="onImageError"
        />
        
        <!-- 图片加载状态 -->
        <div v-if="imageLoading" class="image-loading">
          <i-lucide-loader-2 class="h-8 w-8 animate-spin text-blue-500" />
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-2">加载中...</p>
        </div>
        
        <!-- 图片加载错误 -->
        <div v-if="imageError" class="image-error">
          <i-heroicons-outline:exclamation-circle class="h-8 w-8 text-red-500" />
          <p class="text-sm text-red-600 dark:text-red-400 mt-2">图片加载失败</p>
        </div>
      </div>
        
      <!-- 图片操作按钮 -->
      <div v-if="!imageLoading && !imageError" class="image-controls">
        <button
          @click="$emit('fullscreen-toggle')"
          class="control-btn"
          :title="isFullscreen ? '退出全屏' : '全屏查看'"
        >
          <i-heroicons-outline:arrows-pointing-out v-if="!isFullscreen" class="h-5 w-5" />
          <i-heroicons-outline:arrows-pointing-in v-else class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- 视频作品 -->
    <div v-else-if="isVideoArtwork" class="video-artwork">
      <video
        :src="artwork.output_image_url"
        class="artwork-video"
        controls
        preload="metadata"
        @loadedmetadata="onVideoLoad"
        @error="onVideoError"
      >
        您的浏览器不支持视频播放。
      </video>
      
      <!-- 视频加载错误 -->
      <div v-if="videoError" class="video-error">
        <i-heroicons-outline:exclamation-circle class="h-8 w-8 text-red-500" />
        <p class="text-sm text-red-600 dark:text-red-400 mt-2">视频加载失败</p>
      </div>
    </div>

    <!-- 音频作品 -->
    <div v-else-if="isAudioArtwork" class="audio-artwork">
      <div class="audio-container">
        <div class="audio-cover">
          <i-heroicons-outline:music-note class="h-16 w-16 text-blue-500" />
        </div>
        <audio
          :src="artwork.output_image_url"
          class="artwork-audio"
          controls
          preload="metadata"
          @loadedmetadata="onAudioLoad"
          @error="onAudioError"
        >
          您的浏览器不支持音频播放。
        </audio>
        
        <!-- 音频信息 -->
        <div class="audio-info">
          <h4 class="audio-title">{{ artwork.title || '未命名音频' }}</h4>
          <p v-if="audioDuration" class="audio-duration">
            时长: {{ formatDuration(audioDuration) }}
          </p>
        </div>
      </div>
      
      <!-- 音频加载错误 -->
      <div v-if="audioError" class="audio-error">
        <i-heroicons-outline:exclamation-circle class="h-8 w-8 text-red-500" />
        <p class="text-sm text-red-600 dark:text-red-400 mt-2">音频加载失败</p>
      </div>
    </div>

    <!-- 文本作品 -->
    <div v-else-if="isTextArtwork" class="text-artwork">
      <div class="text-container">
        <div class="text-content">
          <pre class="text-output">{{ artwork.output_metadata?.text || '暂无内容' }}</pre>
        </div>
        
        <!-- 文本操作 -->
        <div class="text-controls">
          <button
            @click="copyText"
            class="control-btn"
            title="复制文本"
          >
            <i-heroicons-outline:clipboard class="h-5 w-5" />
          </button>
          
          <button
            @click="increaseFontSize"
            class="control-btn"
            title="增大字体"
          >
            <i-heroicons-outline:plus class="h-5 w-5" />
          </button>
          
          <button
            @click="decreaseFontSize"
            class="control-btn"
            title="减小字体"
          >
            <i-heroicons-outline:minus class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- 未知格式 -->
    <div v-else class="unknown-artwork">
      <div class="unknown-content">
        <i-heroicons-outline:question-mark-circle class="h-16 w-16 text-slate-400" />
        <h4 class="text-lg font-medium text-slate-600 dark:text-slate-400 mt-4">
          不支持的文件格式
        </h4>
        <p class="text-sm text-slate-500 dark:text-slate-500 mt-2">
          无法预览此类型的文件
        </p>
        <button
          @click="$emit('download', artwork)"
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          下载文件
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Artwork } from '@/services/database'

/**
 * 组件属性
 */
interface Props {
  artwork: Artwork
  isFullscreen?: boolean
}

/**
 * 组件事件
 */
interface Emits {
  (e: 'fullscreen-toggle'): void
  (e: 'download', artwork: Artwork): void
  (e: 'share', artwork: Artwork): void
  (e: 'favorite', artwork: Artwork): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 组件状态
const imageLoading = ref(true)
const imageError = ref(false)
const videoError = ref(false)
const audioError = ref(false)
const audioDuration = ref(0)

// 文本显示状态
const fontSize = ref(16)

// 计算属性
const isImageArtwork = computed(() => {
  const url = props.artwork.output_image_url
  if (!url) return false
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  return imageExtensions.some(ext => url.toLowerCase().includes(ext)) ||
         url.includes('image') ||
         props.artwork.output_metadata?.format?.startsWith('image/')
})

const isVideoArtwork = computed(() => {
  const url = props.artwork.output_image_url
  if (!url) return false
  
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv']
  return videoExtensions.some(ext => url.toLowerCase().includes(ext)) ||
         url.includes('video') ||
         props.artwork.output_metadata?.format?.startsWith('video/')
})

const isAudioArtwork = computed(() => {
  const url = props.artwork.output_image_url
  if (!url) return false
  
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a']
  return audioExtensions.some(ext => url.toLowerCase().includes(ext)) ||
         url.includes('audio') ||
         props.artwork.output_metadata?.format?.startsWith('audio/')
})

const isTextArtwork = computed(() => {
  return props.artwork.output_metadata?.text || 
         props.artwork.output_metadata?.format === 'text'
})

// 方法
const onImageLoad = () => {
  imageLoading.value = false
  imageError.value = false
}

const onImageError = () => {
  imageLoading.value = false
  imageError.value = true
}

const onVideoLoad = (event: Event) => {
  videoError.value = false
  const video = event.target as HTMLVideoElement
  console.log('视频加载完成:', video.duration)
}

const onVideoError = () => {
  videoError.value = true
}

const onAudioLoad = (event: Event) => {
  audioError.value = false
  const audio = event.target as HTMLAudioElement
  audioDuration.value = audio.duration
}

const onAudioError = () => {
  audioError.value = true
}

const copyText = async () => {
  const text = props.artwork.output_metadata?.text
  if (text) {
    try {
      await navigator.clipboard.writeText(text)
      // 这里可以添加成功提示
      console.log('文本已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
    }
  }
}

const increaseFontSize = () => {
  fontSize.value = Math.min(24, fontSize.value + 2)
}

const decreaseFontSize = () => {
  fontSize.value = Math.max(12, fontSize.value - 2)
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 监听器
watch(() => props.artwork, () => {
  // 重置状态
  imageLoading.value = true
  imageError.value = false
  videoError.value = false
  audioError.value = false
  audioDuration.value = 0
})

// 导出方法供父组件调用
defineExpose({
  copyText
})
</script>

<style scoped>
.artwork-viewer {
  @apply w-full h-full flex items-center justify-center relative;
}

.artwork-viewer.fullscreen {
  @apply fixed inset-0 bg-black z-50;
}

/* 图片作品样式 */
.image-artwork {
  @apply w-full h-full flex items-center justify-center relative;
}

.image-container {
  @apply relative max-w-full max-h-full;
}

.artwork-image {
  @apply max-w-full max-h-full object-contain rounded-lg shadow-lg;
}

.image-loading,
.image-error {
  @apply absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-lg;
}

.image-controls {
  @apply absolute top-4 right-4 flex gap-2 bg-black bg-opacity-50 rounded-lg p-2;
}

.control-btn {
  @apply p-2 rounded-lg bg-white bg-opacity-20 text-white hover:bg-opacity-30 
         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200;
}

/* 视频作品样式 */
.video-artwork {
  @apply w-full h-full flex items-center justify-center relative;
}

.artwork-video {
  @apply max-w-full max-h-full rounded-lg shadow-lg;
}

.video-error {
  @apply flex flex-col items-center justify-center p-8;
}

/* 音频作品样式 */
.audio-artwork {
  @apply w-full h-full flex items-center justify-center;
}

.audio-container {
  @apply flex flex-col items-center gap-4 p-8 bg-slate-50 dark:bg-slate-800 rounded-lg;
}

.audio-cover {
  @apply p-8 bg-blue-50 dark:bg-blue-900/20 rounded-full;
}

.artwork-audio {
  @apply w-full max-w-md;
}

.audio-info {
  @apply text-center;
}

.audio-title {
  @apply text-lg font-medium text-slate-800 dark:text-white;
}

.audio-duration {
  @apply text-sm text-slate-600 dark:text-slate-400 mt-1;
}

.audio-error {
  @apply flex flex-col items-center justify-center p-8;
}

/* 文本作品样式 */
.text-artwork {
  @apply w-full h-full flex flex-col;
}

.text-container {
  @apply flex-1 flex flex-col bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden;
}

.text-content {
  @apply flex-1 p-6 overflow-auto;
}

.text-output {
  @apply whitespace-pre-wrap text-slate-800 dark:text-white font-mono leading-relaxed;
  font-size: v-bind(fontSize + 'px');
}

.text-controls {
  @apply flex justify-center gap-2 p-4 border-t border-slate-200 dark:border-slate-700;
}

/* 未知格式样式 */
.unknown-artwork {
  @apply w-full h-full flex items-center justify-center;
}

.unknown-content {
  @apply text-center p-8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-controls {
    @apply top-2 right-2 p-1;
  }
  
  .control-btn {
    @apply p-1;
  }
  
  .audio-container {
    @apply p-4;
  }
  
  .text-content {
    @apply p-4;
  }
}
</style> 