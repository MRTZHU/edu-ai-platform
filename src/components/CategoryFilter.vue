<template>
  <div class="flex flex-wrap gap-2 mb-6">
    <button
      v-for="category in categories"
      :key="category"
      @click="selectCategory(category)"
      class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
      :class="[
        selectedCategory === category
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-600'
      ]"
    >
      {{ category }}
      <span 
        v-if="getCategoryCount(category) > 0"
        class="ml-2 px-1.5 py-0.5 rounded text-xs"
        :class="[
          selectedCategory === category
            ? 'bg-blue-500 text-white'
            : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
        ]"
      >
        {{ getCategoryCount(category) }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DifyappConfig } from '../../.cursor/fanben'

interface Props {
  selectedCategory: string
  tools: DifyappConfig[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:selectedCategory'])

// 所有可用的分类
const categories = computed(() => {
  const allCategories = ['全部', ...new Set(props.tools.map(tool => tool.category))]
  return allCategories
})

// 获取分类下的工具数量
const getCategoryCount = (category: string): number => {
  if (category === '全部') {
    return props.tools.length
  }
  return props.tools.filter(tool => tool.category === category).length
}

// 选择分类
const selectCategory = (category: string) => {
  emit('update:selectedCategory', category)
}
</script> 