import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * 存储服务类
 * 负责处理图片文件的上传、下载和管理
 */
export class StorageService {
  private supabase: SupabaseClient
  private readonly bucketName = 'dify-images'

  constructor() {
    // 使用anon key创建客户端（适合前端使用）
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('缺少必要的Supabase配置: VITE_SUPABASE_URL 或 VITE_SUPABASE_KEY')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  /**
   * 从URL下载图片并上传到Supabase存储桶
   * @param imageUrl 临时图片URL
   * @param customFileName 自定义文件名（可选）
   * @returns 永久访问URL
   */
  async uploadImageFromUrl(imageUrl: string, customFileName?: string): Promise<string> {
    try {
      console.log('🔄 开始从URL下载图片:', imageUrl)

      // 1. 从URL下载图片数据
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`下载图片失败: ${response.status} ${response.statusText}`)
      }

      const imageBlob = await response.blob()
      console.log('✅ 图片下载成功，大小:', this.formatFileSize(imageBlob.size))

      // 2. 生成唯一文件名
      const fileName = customFileName || this.generateUniqueFileName(imageUrl, imageBlob.type)
      console.log('📝 生成文件名:', fileName)

      // 3. 上传到Supabase存储桶
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fileName, imageBlob, {
          contentType: imageBlob.type,
          upsert: false // 不覆盖已存在的文件
        })

      if (error) {
        console.error('❌ 上传失败:', error)
        throw new Error(`上传图片失败: ${error.message}`)
      }

      if (!data) {
        throw new Error('上传成功但未返回数据')
      }

      console.log('✅ 图片上传成功:', (data as any).Key || fileName)

      // 4. 获取公开访问URL
      const filePathForUrl = (data as any).path || fileName
      console.log('📂 用于生成URL的文件路径:', filePathForUrl)
      const publicUrl = this.getPublicUrl(filePathForUrl)
      console.log('🔗 生成公开URL:', publicUrl)

      return publicUrl

    } catch (error) {
      console.error('❌ 图片存储过程失败:', error)
      throw error
    }
  }

  /**
   * 获取文件的公开访问URL
   * @param filePath 文件路径
   * @returns 公开访问URL
   */
  getPublicUrl(filePath: string): string {
    console.log('🔍 获取公开URL，文件路径:', filePath)
    
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath)

    console.log('🔗 Supabase返回的URL数据:', data)

    // Supabase v1 使用 publicURL 而不是 publicUrl
    const publicUrl = (data as any)?.publicURL || (data as any)?.publicUrl || ''
    console.log('🎯 最终生成的URL:', publicUrl)
    
    // 检查URL是否有重复的bucket名称并修复
    if (publicUrl && publicUrl.includes(`/${this.bucketName}/${this.bucketName}/`)) {
      const fixedUrl = publicUrl.replace(`/${this.bucketName}/${this.bucketName}/`, `/${this.bucketName}/`)
      console.log('🔧 修复重复路径后的URL:', fixedUrl)
      return fixedUrl
    }
    
    return publicUrl
  }

  /**
   * 删除存储桶中的图片
   * @param filePath 文件路径
   */
  async deleteImage(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath])

    if (error) {
      console.error('删除图片失败:', error)
      throw new Error(`删除图片失败: ${error.message}`)
    }

    console.log('✅ 图片删除成功:', filePath)
  }

  /**
   * 生成唯一的文件名
   * @param originalUrl 原始URL
   * @param mimeType 文件MIME类型
   * @returns 唯一文件名
   */
  private generateUniqueFileName(originalUrl: string, mimeType: string): string {
    // 生成时间戳
    const timestamp = Date.now()
    
    // 生成随机字符串
    const randomStr = Math.random().toString(36).substring(2, 8)
    
    // 从MIME类型推断文件扩展名
    const extension = this.getFileExtensionFromMimeType(mimeType)
    
    // 尝试从URL中提取有意义的名称部分
    let baseName = 'image'
    try {
      const urlPath = new URL(originalUrl).pathname
      const urlFileName = urlPath.split('/').pop()
      if (urlFileName && urlFileName.includes('.')) {
        baseName = urlFileName.split('.')[0].substring(0, 20) // 限制长度
      }
    } catch (e) {
      // URL解析失败，使用默认名称
    }

    // 清理文件名，只保留字母数字和连字符
    baseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 20) || 'image'
    
    return `${baseName}_${timestamp}_${randomStr}${extension}`
  }

  /**
   * 从MIME类型获取文件扩展名
   * @param mimeType MIME类型
   * @returns 文件扩展名
   */
  private getFileExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff'
    }

    return mimeToExt[mimeType.toLowerCase()] || '.jpg'
  }

  /**
   * 格式化文件大小显示
   * @param bytes 字节数
   * @returns 格式化的文件大小字符串
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 预加载图片，确保图片完全加载后再返回
   * @param imageUrl 图片URL
   * @param timeout 超时时间，默认60秒
   * @returns Promise，图片加载完成时resolve
   */
  async preloadImage(imageUrl: string, timeout: number = 60000): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // 设置超时机制，避免无限等待
      const timeoutId = setTimeout(() => {
        console.warn('⏰ 图片预加载超时:', imageUrl)
        reject(new Error(`图片预加载超时: ${imageUrl}`))
      }, timeout)
      
      img.onload = () => {
        clearTimeout(timeoutId)
        console.log('✅ 图片预加载完成:', imageUrl)
        resolve()
      }
      
      img.onerror = (error) => {
        clearTimeout(timeoutId)
        console.error('❌ 图片预加载失败:', imageUrl, error)
        reject(new Error(`图片预加载失败: ${imageUrl}`))
      }
      
      img.src = imageUrl
    })
  }

  /**
   * 持续预加载图片，即使失败也会继续尝试直到成功
   * @param imageUrl 图片URL
   * @param onSuccess 预加载成功时的回调
   * @param maxRetries 最大重试次数，默认10次
   * @param retryDelay 重试间隔（毫秒），默认5秒
   * @returns 停止重试的函数
   */
  continuousPreloadImage(
    imageUrl: string,
    onSuccess: () => void,
    maxRetries: number = 10,
    retryDelay: number = 5000
  ): () => void {
    let retryCount = 0
    let isStopped = false
    let timeoutId: NodeJS.Timeout | null = null

    const attemptLoad = async () => {
      if (isStopped) {
        console.log('🛑 预加载已停止:', imageUrl)
        return
      }

      try {
        console.log(`🔄 预加载尝试 ${retryCount + 1}/${maxRetries + 1}:`, imageUrl)
        await this.preloadImage(imageUrl, 60000) // 60秒超时
        
        if (!isStopped) {
          console.log('✅ 持续预加载成功:', imageUrl)
          onSuccess()
        }
        return
      } catch (error) {
        retryCount++
        console.warn(`⚠️ 预加载失败 (${retryCount}/${maxRetries + 1}):`, error)
        
        if (retryCount <= maxRetries && !isStopped) {
          console.log(`🔄 ${retryDelay / 1000}秒后重试预加载:`, imageUrl)
          timeoutId = setTimeout(attemptLoad, retryDelay)
        } else if (!isStopped) {
          console.error('❌ 预加载达到最大重试次数，停止尝试:', imageUrl)
        }
      }
    }

    // 立即开始第一次尝试
    attemptLoad()

    // 返回停止函数
    return () => {
      isStopped = true
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      console.log('🛑 停止持续预加载:', imageUrl)
    }
  }

  /**
   * 生成图片缩略图
   * @param imageUrl 原始图片URL
   * @param maxWidth 缩略图最大宽度，默认200px
   * @param quality 图片质量，默认0.8
   * @returns 缩略图的永久URL
   */
  async generateThumbnail(imageUrl: string, maxWidth: number = 200, quality: number = 0.8): Promise<string> {
    try {
      console.log('🔄 开始生成缩略图:', imageUrl)

      // 1. 下载原始图片
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`下载原图失败: ${response.status} ${response.statusText}`)
      }

      const imageBlob = await response.blob()
      console.log('✅ 原图下载完成，大小:', this.formatFileSize(imageBlob.size))

      // 2. 创建图片元素并加载
      const img = new Image()
      const imageLoadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = URL.createObjectURL(imageBlob)
      })

      const loadedImg = await imageLoadPromise

      // 3. 计算缩略图尺寸（保持宽高比）
      const originalWidth = loadedImg.naturalWidth
      const originalHeight = loadedImg.naturalHeight
      const aspectRatio = originalHeight / originalWidth

      let thumbnailWidth = Math.min(maxWidth, originalWidth)
      let thumbnailHeight = Math.round(thumbnailWidth * aspectRatio)

      // 如果高度超过宽度很多，限制高度
      if (thumbnailHeight > maxWidth * 1.5) {
        thumbnailHeight = Math.round(maxWidth * 1.5)
        thumbnailWidth = Math.round(thumbnailHeight / aspectRatio)
      }

      console.log(`📐 缩略图尺寸: ${thumbnailWidth}x${thumbnailHeight} (原图: ${originalWidth}x${originalHeight})`)

      // 4. 使用Canvas生成缩略图
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('无法创建Canvas 2D上下文')
      }

      canvas.width = thumbnailWidth
      canvas.height = thumbnailHeight

      // 使用高质量缩放
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      
      // 绘制缩略图
      ctx.drawImage(loadedImg, 0, 0, thumbnailWidth, thumbnailHeight)

      // 5. 转换为Blob
      const thumbnailBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('无法生成缩略图Blob'))
          }
        }, 'image/jpeg', quality)
      })

      console.log('✅ 缩略图生成完成，大小:', this.formatFileSize(thumbnailBlob.size))

      // 清理资源
      URL.revokeObjectURL(img.src)

      // 6. 生成缩略图文件名
      const originalFileName = this.extractFileNameFromUrl(imageUrl)
      const thumbnailFileName = `thumbnails/${originalFileName.replace(/\.[^.]+$/, '')}_thumb_${thumbnailWidth}x${thumbnailHeight}.jpg`

      // 7. 上传缩略图到存储桶
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(thumbnailFileName, thumbnailBlob, {
          contentType: 'image/jpeg',
          upsert: false
        })

      if (error) {
        console.error('❌ 缩略图上传失败:', error)
        throw new Error(`缩略图上传失败: ${error.message}`)
      }

      console.log('✅ 缩略图上传成功:', thumbnailFileName)

      // 8. 获取缩略图的公开URL
      const thumbnailUrl = this.getPublicUrl((data as any).path || thumbnailFileName)
      console.log('🔗 缩略图URL:', thumbnailUrl)

      return thumbnailUrl

    } catch (error) {
      console.error('❌ 缩略图生成失败:', error)
      throw error
    }
  }

  /**
   * 从URL中提取文件名
   * @param url 文件URL
   * @returns 文件名
   */
  private extractFileNameFromUrl(url: string): string {
    try {
      const urlPath = new URL(url).pathname
      const fileName = urlPath.split('/').pop() || 'image'
      return fileName
    } catch (error) {
      // URL解析失败，生成默认文件名
      return `image_${Date.now()}`
    }
  }

  /**
   * 带缩略图的图片上传方法
   * @param imageUrl 临时图片URL
   * @param customFileName 自定义文件名（可选）
   * @param generateThumb 是否生成缩略图，默认true
   * @returns 包含原图URL和缩略图URL的对象
   */
  async uploadImageWithThumbnail(
    imageUrl: string, 
    customFileName?: string, 
    generateThumb: boolean = true
  ): Promise<{
    originalUrl: string
    thumbnailUrl?: string
  }> {
    try {
      console.log('🔄 开始上传图片并生成缩略图...')

      // 1. 上传原图
      const originalUrl = await this.uploadImageFromUrl(imageUrl, customFileName)
      console.log('✅ 原图上传完成:', originalUrl)

      let thumbnailUrl: string | undefined

      // 2. 生成缩略图（如果需要）
      if (generateThumb) {
        try {
          thumbnailUrl = await this.generateThumbnail(originalUrl)
          console.log('✅ 缩略图生成完成:', thumbnailUrl)
        } catch (thumbError) {
          console.warn('⚠️ 缩略图生成失败，继续使用原图:', thumbError)
          // 缩略图生成失败不影响主流程，使用原图作为缩略图
          thumbnailUrl = originalUrl
        }
      }

      return {
        originalUrl,
        thumbnailUrl
      }

    } catch (error) {
      console.error('❌ 图片上传和缩略图生成失败:', error)
      throw error
    }
  }

  /**
   * 检查存储桶是否可访问
   * @returns 是否可访问
   */
  async checkBucketAccess(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .list('', { limit: 1 })

      return !error
    } catch (error) {
      console.error('存储桶访问检查失败:', error)
      return false
    }
  }

  /**
   * 获取存储桶信息
   */
  async getBucketInfo(): Promise<any> {
    try {
      const { data, error } = await this.supabase.storage.getBucket(this.bucketName)
      
      if (error) {
        throw new Error(`获取存储桶信息失败: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('获取存储桶信息失败:', error)
      throw error
    }
  }
} 