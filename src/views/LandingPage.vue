<script setup lang="ts">
/**
 * 营销主页组件
 * 展示平台介绍、核心功能和用户入口
 * 参考pandeai-app设计，适配Vue 3 + Supabase项目
 */
import { useRouter } from 'vue-router'

const router = useRouter()

// 导航到注册页面
const navigateToSignUp = () => {
  router.push('/auth/signup')
}

// 导航到登录页面
const navigateToSignIn = () => {
  router.push('/auth/signin')
}
</script>

<template>
  <main class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
    <!-- 导航栏 -->
    <nav class="w-full flex justify-center border-b border-slate-200 dark:border-slate-700 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div class="w-full max-w-6xl flex justify-between items-center p-3 px-5 text-sm">
        <div class="flex gap-5 items-center font-semibold">
          <router-link to="/" class="flex items-center gap-2">
            <i-lucide-graduation-cap class="h-6 w-6 text-blue-600" />
            <span class="text-xl font-bold text-slate-900 dark:text-white">EduAI</span>
          </router-link>
          <div class="hidden sm:flex px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
            AI教学平台
          </div>
        </div>
        <div class="flex gap-2">
          <VButton variant="outline" @click="navigateToSignIn">
            登录
          </VButton>
          <VButton @click="navigateToSignUp">
            注册
          </VButton>
        </div>
      </div>
    </nav>

    <div class="flex-1 w-full flex flex-col">
      <!-- 英雄区域 -->
      <section class="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div class="container mx-auto px-4 max-w-6xl">
          <div class="text-center space-y-8">
            <div class="space-y-4">
              <h1 class="text-4xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
                让AI为教育赋能
                <br />
                <span class="text-blue-600 dark:text-blue-400">智慧教学从这里开始</span>
              </h1>
              <p class="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                专为中国中小学教师和学生打造的AI教学平台
                <br />
                集成先进AI技术，提升教学效率，优化学习体验
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <VButton size="lg" class="px-8 py-6 text-lg" @click="navigateToSignUp">
                <i-lucide-graduation-cap class="mr-2 h-5 w-5" />
                开始使用
                <i-lucide-arrow-right class="ml-2 h-4 w-4" />
              </VButton>
              <VButton size="lg" variant="outline" class="px-8 py-6 text-lg" @click="navigateToSignIn">
                <i-lucide-book-open class="mr-2 h-5 w-5" />
                立即登录
                <i-lucide-arrow-right class="ml-2 h-4 w-4" />
              </VButton>
            </div>

            <p class="text-sm text-slate-500 dark:text-slate-400">
              🎉 已有 <span class="font-semibold text-blue-600 dark:text-blue-400">1000+</span> 位教师和 
              <span class="font-semibold text-blue-600 dark:text-blue-400">5000+</span> 名学生在使用
            </p>
          </div>
        </div>
      </section>

      <!-- AI模型支持展示 -->
      <section class="py-12 bg-slate-100 dark:bg-slate-800">
        <div class="container mx-auto px-4 max-w-6xl">
          <div class="text-center mb-8">
            <p class="text-slate-600 dark:text-slate-400">兼容国内所有主流AI大模型</p>
          </div>
          <div class="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg">通义千问</div>
            <div class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg">智谱清言</div>
            <div class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg">Kimi</div>
            <div class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg">DeepSeek</div>
            <div class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg">腾讯混元</div>
            <div class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg">文心一言</div>
          </div>
        </div>
      </section>

      <!-- 核心功能展示 -->
      <section class="py-20 bg-white dark:bg-slate-900">
        <div class="container mx-auto px-4 max-w-6xl">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">AI赋能教学的核心功能</h2>
            <p class="text-xl text-slate-600 dark:text-slate-300">四大AI工具，全面覆盖教学场景</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- 智能备课助手 -->
            <div class="group p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div class="text-center mb-4">
                <div class="mx-auto w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <i-lucide-file-check class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">智能备课助手</h3>
                <p class="text-slate-600 dark:text-slate-400 text-sm mt-2">
                  输入教学主题，AI自动生成完整课程计划
                </p>
              </div>
              <ul class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  课程大纲自动生成
                </li>
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  教学活动智能推荐
                </li>
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  评估方案个性化
                </li>
              </ul>
            </div>

            <!-- 作业智能批改 -->
            <div class="group p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div class="text-center mb-4">
                <div class="mx-auto w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                  <i-lucide-star class="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">作业智能批改</h3>
                <p class="text-slate-600 dark:text-slate-400 text-sm mt-2">
                  AI自动批改作业，提供详细反馈
                </p>
              </div>
              <ul class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  自动评分打分
                </li>
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  详细错误分析
                </li>
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  改进建议推送
                </li>
              </ul>
            </div>

            <!-- AI学习助手 -->
            <div class="group p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div class="text-center mb-4">
                <div class="mx-auto w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <i-lucide-message-circle class="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">AI学习助手</h3>
                <p class="text-slate-600 dark:text-slate-400 text-sm mt-2">
                  24/7在线答疑，个性化学习指导
                </p>
              </div>
              <ul class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  即时问题解答
                </li>
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  学习路径规划
                </li>
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  知识点串联
                </li>
              </ul>
            </div>

            <!-- 内容智能生成 -->
            <div class="group p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div class="text-center mb-4">
                <div class="mx-auto w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                  <i-lucide-target class="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white">内容智能生成</h3>
                <p class="text-slate-600 dark:text-slate-400 text-sm mt-2">
                  一键生成练习题、测试卷和教学素材
                </p>
              </div>
              <ul class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  多题型自动生成
                </li>
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  难度智能调节
                </li>
                <li class="flex items-center gap-2">
                  <i-lucide-check-circle class="h-4 w-4 text-green-500" />
                  素材丰富多样
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA区域 -->
      <section class="py-20 bg-blue-600 dark:bg-blue-700 text-white">
        <div class="container mx-auto px-4 max-w-4xl text-center">
          <h2 class="text-3xl lg:text-4xl font-bold mb-4">
            开启AI教学新时代
          </h2>
          <p class="text-xl mb-8 opacity-90">
            加入数千名教师和学生，体验AI为教育带来的革命性改变
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <VButton size="lg" variant="secondary" class="px-8 py-6 text-lg" @click="navigateToSignUp">
              <i-lucide-star class="mr-2 h-5 w-5" />
              立即开始免费体验
            </VButton>
            <VButton size="lg" variant="outline" class="px-8 py-6 text-lg bg-transparent hover:bg-white/10 border-white text-white" @click="navigateToSignIn">
              已有账号？立即登录
            </VButton>
          </div>
        </div>
      </section>

      <!-- 页脚 -->
      <footer class="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div class="container mx-auto px-4 max-w-6xl py-12">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="space-y-4">
              <div class="flex items-center gap-2">
                <i-lucide-graduation-cap class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span class="text-xl font-bold text-slate-900 dark:text-white">EduAI</span>
              </div>
              <p class="text-slate-600 dark:text-slate-400">
                专业的AI教学平台，让教育更智能、更高效
              </p>
            </div>
            
            <div class="space-y-4">
              <h4 class="font-semibold text-slate-900 dark:text-white">产品功能</h4>
              <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>智能备课助手</li>
                <li>作业智能批改</li>
                <li>AI学习助手</li>
                <li>内容智能生成</li>
              </ul>
            </div>
            
            <div class="space-y-4">
              <h4 class="font-semibold text-slate-900 dark:text-white">用户服务</h4>
              <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><router-link to="/auth/signup" class="hover:text-blue-600 dark:hover:text-blue-400">用户注册</router-link></li>
                <li><router-link to="/auth/signin" class="hover:text-blue-600 dark:hover:text-blue-400">用户登录</router-link></li>
              </ul>
            </div>
            
            <div class="space-y-4">
              <h4 class="font-semibold text-slate-900 dark:text-white">关于我们</h4>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                基于Supabase和Vue 3构建的现代化教学平台
              </p>
            </div>
          </div>
          
          <div class="border-t border-slate-200 dark:border-slate-700 mt-8 pt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>© 2024 EduAI. 保留所有权利。由先进AI技术驱动</p>
          </div>
        </div>
      </footer>
    </div>
  </main>
</template>

<style scoped>
/* 自定义样式 */
.container {
  @apply mx-auto px-4;
}
</style>
