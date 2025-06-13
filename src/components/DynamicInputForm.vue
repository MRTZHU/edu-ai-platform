<template>
  <div class="dynamic-input-form space-y-4">
    <!-- 动态生成的输入字段 -->
    <div
      v-for="(field, index) in fields"
      :key="field.id || index"
      class="form-field"
    >
      <!-- 字段标签 -->
      <label
        :for="field.name"
        class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
      >
        {{ field.label }}
        <span v-if="field.required" class="text-red-500">*</span>
        <span v-if="field.description" class="text-xs text-slate-500 ml-1">
          ({{ field.description }})
        </span>
      </label>

      <!-- 文本输入 -->
      <input
        v-if="field.type === 'text'"
        :id="field.name"
        v-model="formData[field.name]"
        type="text"
        :placeholder="field.placeholder"
        :required="field.required"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
               bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
      />

      <!-- 多行文本输入 -->
      <textarea
        v-else-if="field.type === 'textarea'"
        :id="field.name"
        v-model="formData[field.name]"
        :placeholder="field.placeholder"
        :required="field.required"
        :rows="field.rows || 3"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
               bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-y"
      ></textarea>

      <!-- 数字输入 -->
      <input
        v-else-if="field.type === 'number'"
        :id="field.name"
        v-model.number="formData[field.name]"
        type="number"
        :placeholder="field.placeholder"
        :required="field.required"
        :min="field.min"
        :max="field.max"
        :step="field.step"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
               bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
      />

      <!-- 选择框 -->
      <select
        v-else-if="field.type === 'select'"
        :id="field.name"
        v-model="formData[field.name]"
        :required="field.required"
        class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
               bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
      >
        <option value="" disabled>请选择</option>
        <option
          v-for="option in field.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- 文件上传 -->
      <div v-else-if="field.type === 'file'" class="space-y-2">
        <input
          :id="field.name"
          type="file"
          :accept="field.accept"
          :multiple="field.multiple"
          @change="handleFileChange($event, field.name)"
          class="block w-full text-sm text-slate-500 dark:text-slate-400
                 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
        />
        <!-- 显示已选择的文件 -->
        <div v-if="fileData[field.name]?.length > 0" class="text-xs text-slate-600 dark:text-slate-400">
          已选择: {{ fileData[field.name].map(f => f.name).join(', ') }}
        </div>
      </div>

      <!-- 开关 -->
      <label
        v-else-if="field.type === 'switch'"
        class="relative inline-flex items-center cursor-pointer"
      >
        <input
          :id="field.name"
          v-model="formData[field.name]"
          type="checkbox"
          class="sr-only peer"
        />
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 
                    dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 
                    peer-checked:after:translate-x-full peer-checked:after:border-white 
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                    after:bg-white after:border-gray-300 after:border after:rounded-full 
                    after:h-5 after:w-5 after:transition-all dark:border-gray-600 
                    peer-checked:bg-blue-600"></div>
        <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          {{ field.switchLabel || '启用' }}
        </span>
      </label>

      <!-- 删除字段按钮 (仅当可删除时显示) -->
      <button
        v-if="field.removable && fields.length > 1"
        @click="removeField(index)"
        type="button"
        class="mt-2 text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
      >
        <i-lucide-trash-2 class="h-4 w-4" />
        删除字段
      </button>
    </div>

    <!-- 添加字段按钮 -->
    <div v-if="allowAddFields" class="pt-4 border-t border-slate-200 dark:border-slate-700">
      <div class="flex flex-wrap gap-2">
        <button
          @click="addField('text')"
          type="button"
          class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 
                 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
        >
          + 文本
        </button>
        <button
          @click="addField('textarea')"
          type="button"
          class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 
                 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30"
        >
          + 长文本
        </button>
        <button
          @click="addField('number')"
          type="button"
          class="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 
                 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30"
        >
          + 数字
        </button>
        <button
          @click="addField('file')"
          type="button"
          class="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 
                 dark:bg-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/30"
        >
          + 文件
        </button>
      </div>
    </div>

    <!-- 表单操作按钮 -->
    <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
      <button
        @click="resetForm"
        type="button"
        class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 
               rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 
               dark:border-slate-600 dark:hover:bg-slate-700"
      >
        重置
      </button>
      <button
        @click="submitForm"
        type="button"
        :disabled="!isFormValid || isSubmitting"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg 
               hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed
               flex items-center gap-2"
      >
        <i-lucide-loader-2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
        {{ isSubmitting ? '提交中...' : '提交' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

/**
 * 表单字段类型定义
 */
export interface FormField {
  id?: string
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select' | 'file' | 'switch'
  placeholder?: string
  description?: string
  required?: boolean
  removable?: boolean
  
  // 数字类型特有属性
  min?: number
  max?: number
  step?: number
  
  // 文本域特有属性
  rows?: number
  
  // 选择框特有属性
  options?: Array<{ label: string; value: any }>
  
  // 文件上传特有属性
  accept?: string
  multiple?: boolean
  
  // 开关特有属性
  switchLabel?: string
  
  // 默认值
  defaultValue?: any
}

/**
 * 组件属性
 */
interface Props {
  fields: FormField[]
  allowAddFields?: boolean
  autoSubmit?: boolean
}

/**
 * 组件事件
 */
interface Emits {
  (e: 'submit', data: { formData: Record<string, any>; fileData: Record<string, File[]> }): void
  (e: 'change', data: { formData: Record<string, any>; fileData: Record<string, File[]> }): void
  (e: 'field-added', field: FormField): void
  (e: 'field-removed', fieldName: string): void
}

const props = withDefaults(defineProps<Props>(), {
  allowAddFields: false,
  autoSubmit: false
})

const emit = defineEmits<Emits>()

// 表单数据
const formData = reactive<Record<string, any>>({})
const fileData = reactive<Record<string, File[]>>({})
const isSubmitting = ref(false)

// 字段管理
const fields = ref<FormField[]>([...props.fields])

// 初始化表单数据
const initFormData = () => {
  fields.value.forEach(field => {
    if (!(field.name in formData)) {
      formData[field.name] = field.defaultValue !== undefined 
        ? field.defaultValue 
        : (field.type === 'switch' ? false : (field.type === 'number' ? 0 : ''))
    }
    if (field.type === 'file' && !(field.name in fileData)) {
      fileData[field.name] = []
    }
  })
}

// 表单验证
const isFormValid = computed(() => {
  return fields.value.every(field => {
    if (!field.required) return true
    
    const value = formData[field.name]
    
    if (field.type === 'file') {
      return fileData[field.name]?.length > 0
    }
    
    if (field.type === 'switch') {
      return true // 开关字段不需要验证
    }
    
    if (field.type === 'number') {
      return value !== null && value !== undefined && !isNaN(value)
    }
    
    return value !== null && value !== undefined && value !== ''
  })
})

// 文件处理
const handleFileChange = (event: Event, fieldName: string) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  fileData[fieldName] = files
  emitChange()
}

// 添加字段
const addField = (type: FormField['type']) => {
  const fieldCount = fields.value.filter(f => f.type === type).length
  const newField: FormField = {
    id: `dynamic_${type}_${Date.now()}`,
    name: `dynamic_${type}_${fieldCount + 1}`,
    label: `${getTypeLabel(type)} ${fieldCount + 1}`,
    type,
    placeholder: `请输入${getTypeLabel(type)}`,
    required: false,
    removable: true
  }
  
  // 为特定类型设置默认属性
  if (type === 'textarea') {
    newField.rows = 3
  } else if (type === 'file') {
    newField.accept = '*/*'
    newField.multiple = false
  } else if (type === 'select') {
    newField.options = [
      { label: '选项1', value: 'option1' },
      { label: '选项2', value: 'option2' }
    ]
  }
  
  fields.value.push(newField)
  initFormData()
  emit('field-added', newField)
}

// 移除字段
const removeField = (index: number) => {
  const field = fields.value[index]
  if (field.removable) {
    delete formData[field.name]
    delete fileData[field.name]
    fields.value.splice(index, 1)
    emit('field-removed', field.name)
    emitChange()
  }
}

// 获取类型标签
const getTypeLabel = (type: FormField['type']): string => {
  const labels = {
    text: '文本',
    textarea: '长文本',
    number: '数字',
    select: '选择',
    file: '文件',
    switch: '开关'
  }
  return labels[type] || type
}

// 重置表单
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    const field = fields.value.find(f => f.name === key)
    if (field) {
      formData[key] = field.defaultValue !== undefined 
        ? field.defaultValue 
        : (field.type === 'switch' ? false : (field.type === 'number' ? 0 : ''))
    }
  })
  
  Object.keys(fileData).forEach(key => {
    fileData[key] = []
  })
  
  emitChange()
}

// 提交表单
const submitForm = async () => {
  if (!isFormValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    emit('submit', {
      formData: { ...formData },
      fileData: { ...fileData }
    })
  } finally {
    isSubmitting.value = false
  }
}

// 发出数据变化事件
const emitChange = () => {
  emit('change', {
    formData: { ...formData },
    fileData: { ...fileData }
  })
}

// 监听表单数据变化
watch(formData, emitChange, { deep: true })
watch(fileData, emitChange, { deep: true })

// 监听外部字段变化
watch(() => props.fields, (newFields) => {
  fields.value = [...newFields]
  initFormData()
}, { deep: true })

// 自动提交
watch(isFormValid, (valid) => {
  if (valid && props.autoSubmit) {
    submitForm()
  }
})

// 初始化
initFormData()

// 导出方法供父组件调用
defineExpose({
  submitForm,
  resetForm,
  isFormValid,
  formData,
  fileData
})
</script>

<style scoped>
.form-field {
  @apply relative;
}

/* 文件上传样式优化 */
input[type="file"]::-webkit-file-upload-button {
  @apply cursor-pointer;
}
</style> 