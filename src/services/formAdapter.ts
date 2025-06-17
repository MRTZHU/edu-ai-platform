/**
 * 表单适配器服务
 * 用于将Dify应用的参数配置转换为DynamicInputForm组件可以使用的表单字段配置
 */

import type { 
  DifyAppParameters, 
  DifyUserInputFormItem, 
  DifyFileUploadSetting 
} from './difyApi';

/**
 * 动态表单字段接口 (与DynamicInputForm.vue兼容)
 */
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'file' | 'number' | 'switch';
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    maxLength?: number;
    minLength?: number;
    pattern?: string;
  };
  fileConfig?: {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxCount?: number;
  };
}

/**
 * 转换后的表单配置
 */
export interface AdaptedFormConfig {
  fields: FormField[];
  fileUpload: {
    enabled: boolean;
    types: string[];
    maxCount: number;
    maxSize: number;
  };
  openingStatement?: string;
  suggestedQuestions?: string[];
}

/**
 * 表单适配器类
 */
export class FormAdapter {
  
  /**
   * 将Dify应用参数转换为表单配置
   * @param difyParams Dify应用参数
   * @returns 转换后的表单配置
   */
  static convertDifyConfigToFormFields(difyParams: DifyAppParameters): AdaptedFormConfig {
    const fields: FormField[] = [];
    
    // 处理用户输入表单
    if (difyParams.user_input_form && Array.isArray(difyParams.user_input_form)) {
      for (const formItem of difyParams.user_input_form) {
        const field = this.convertDifyFormItem(formItem);
        if (field) {
          fields.push(field);
        }
      }
    }
    
    // 处理文件上传配置
    const fileUploadConfig = this.convertFileUploadConfig(difyParams.file_upload);
    
    // 如果启用了文件上传，添加文件字段
    if (fileUploadConfig.enabled) {
      fields.push({
        name: 'files',
        label: '上传文件',
        type: 'file',
        required: false,
        fileConfig: {
          accept: fileUploadConfig.types.join(','),
          multiple: fileUploadConfig.maxCount > 1,
          maxSize: fileUploadConfig.maxSize,
          maxCount: fileUploadConfig.maxCount
        }
      });
    }
    
    return {
      fields,
      fileUpload: fileUploadConfig,
      openingStatement: difyParams.opening_statement,
      suggestedQuestions: difyParams.suggested_questions
    };
  }
  
  /**
   * 转换单个Dify表单项
   * @param formItem Dify表单项
   * @returns 转换后的表单字段
   */
  private static convertDifyFormItem(formItem: DifyUserInputFormItem): FormField | null {
    // 处理文本输入
    if (formItem['text-input']) {
      const textInput = formItem['text-input'];
      return {
        name: textInput.variable,
        label: textInput.label,
        type: 'text',
        required: textInput.required,
        defaultValue: textInput.default || '',
        placeholder: `请输入${textInput.label}`,
        validation: {
          maxLength: textInput.max_length
        }
      };
    }
    
    // 处理段落输入
    if (formItem['paragraph']) {
      const paragraph = formItem['paragraph'];
      return {
        name: paragraph.variable,
        label: paragraph.label,
        type: 'textarea',
        required: paragraph.required,
        defaultValue: paragraph.default || '',
        placeholder: `请输入${paragraph.label}`,
        validation: {
          maxLength: paragraph.max_length
        }
      };
    }
    
    // 处理选择框
    if (formItem['select']) {
      const select = formItem['select'];
      return {
        name: select.variable,
        label: select.label,
        type: 'select',
        required: select.required,
        defaultValue: select.default || '',
        options: select.options.map(option => ({
          label: option,
          value: option
        }))
      };
    }
    
    return null;
  }
  
  /**
   * 转换文件上传配置
   * @param fileUpload Dify文件上传配置
   * @returns 转换后的文件上传配置
   */
  private static convertFileUploadConfig(fileUpload?: DifyFileUploadSetting) {
    const config = {
      enabled: false,
      types: [] as string[],
      maxCount: 1,
      maxSize: 10 * 1024 * 1024 // 默认10MB
    };
    
    if (!fileUpload) {
      return config;
    }
    
    // 检查图片上传
    if (fileUpload.image?.enabled) {
      config.enabled = true;
      config.types.push('image/*');
      config.maxCount = Math.max(config.maxCount, fileUpload.image.number_limits || 1);
    }
    
    // 检查音频上传
    if (fileUpload.audio?.enabled) {
      config.enabled = true;
      config.types.push('audio/*');
      config.maxCount = Math.max(config.maxCount, fileUpload.audio.number_limits || 1);
    }
    
    // 检查视频上传
    if (fileUpload.video?.enabled) {
      config.enabled = true;
      config.types.push('video/*');
      config.maxCount = Math.max(config.maxCount, fileUpload.video.number_limits || 1);
    }
    
    // 检查文档上传
    if (fileUpload.document?.enabled) {
      config.enabled = true;
      config.types.push('.pdf,.doc,.docx,.txt,.md');
      config.maxCount = Math.max(config.maxCount, fileUpload.document.number_limits || 1);
    }
    
    return config;
  }
  
  /**
   * 验证表单数据
   * @param formData 表单数据
   * @param fields 表单字段配置
   * @returns 验证结果
   */
  static validateFormData(formData: Record<string, any>, fields: FormField[]): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};
    
    for (const field of fields) {
      const value = formData[field.name];
      
      // 检查必填字段
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors[field.name] = `${field.label}是必填项`;
        continue;
      }
      
      // 检查字符串长度
      if (value && typeof value === 'string' && field.validation) {
        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          errors[field.name] = `${field.label}不能超过${field.validation.maxLength}个字符`;
        }
        
        if (field.validation.minLength && value.length < field.validation.minLength) {
          errors[field.name] = `${field.label}不能少于${field.validation.minLength}个字符`;
        }
        
        if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
          errors[field.name] = `${field.label}格式不正确`;
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  /**
   * 将表单数据转换为Dify API调用所需的inputs格式
   * @param formData 表单数据
   * @param fields 表单字段配置
   * @returns Dify inputs格式的数据
   */
  static convertFormDataToDifyInputs(formData: Record<string, any>, fields: FormField[]): Record<string, any> {
    const inputs: Record<string, any> = {};
    
    for (const field of fields) {
      if (field.type !== 'file' && formData[field.name] !== undefined) {
        inputs[field.name] = formData[field.name];
      }
    }
    
    return inputs;
  }
  
  /**
   * 处理文件上传数据，转换为Dify API所需的files格式
   * @param files 上传的文件列表
   * @returns Dify files格式的数据
   */
  static convertFilesToDifyFormat(files: File[]): Array<{
    type: string;
    transfer_method: string;
    upload_file_id?: string;
    url?: string;
  }> {
    return files.map(file => ({
      type: file.type,
      transfer_method: 'local_file',
      // 注意：这里需要先上传文件到Dify获取upload_file_id
      // 实际实现时需要调用Dify的文件上传API
    }));
  }
}

// 导出单例实例
export const formAdapter = FormAdapter; 