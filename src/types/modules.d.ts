// 模块声明文件
declare module 'marked' {
  export function marked(src: string, options?: any): string
  export const marked: {
    (src: string, options?: any): string
    parse(src: string, options?: any): string
    setOptions(options: any): void
  }
}

declare module 'dompurify' {
  interface DOMPurify {
    sanitize(dirty: string, config?: any): string
  }
  const DOMPurify: DOMPurify
  export default DOMPurify
} 