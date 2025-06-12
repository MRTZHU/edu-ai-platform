<script lang="ts" setup>
import { useAuthStore } from "@/stores/auth";
import { Ref } from "vue";
import { UserCredentials } from "@supabase/supabase-js";

// 定义组件接收的 props（从父组件传入的配置）
const props = defineProps<{
  signUp: boolean; // 是否是注册模式（true=注册，false=登录）
  title: string; // 页面标题
  subtitle: string; // 页面副标题
  emailPlaceholder: string; // 邮箱输入框的 placeholder 文字
  passwordPlaceholder: string; // 密码输入框的 placeholder 文字
}>();

// 定义响应式变量存储用户输入的凭据（email 和 password）
const credentials: Ref<UserCredentials> = ref({
  email: "",
  password: "",
});

// 获取 Vue Router 实例，用于页面跳转
const router = useRouter();

// Email 登录/注册的加载状态
const emailLoading = ref(false);

// Email 登录/注册函数
async function emailAuth() {
  emailLoading.value = true; // 开始加载
  const { supabase } = useAuthStore(); // 从 Pinia store 获取 Supabase 客户端
  
  try {
    // 根据 signUp 的值决定是调用 signUp 还是 signIn
    const { user, error } = props.signUp
      ? await supabase.auth.signUp(credentials.value, {
          redirectTo: `${window.location.origin}/auth/callback`, // 注册确认后跳转到回调页面
        }) // 注册
      : await supabase.auth.signIn(credentials.value); // 登录
      
    if (error) {
      console.error('认证错误:', error);
      alert(error.message || '认证失败，请检查您的邮箱和密码'); // 显示错误信息
      emailLoading.value = false; // 结束加载
      return;
    }
    
    if (user) {
      console.log('认证成功:', user);
      // 如果是注册，可能需要邮箱确认
      if (props.signUp && !user.confirmed_at) {
        alert('注册成功！请检查您的邮箱并点击确认链接来激活账户。');
      } else {
        router.push("/dashboard"); // 登录/注册成功，跳转到dashboard
      }
    }
  } catch (error) {
    console.error('认证异常:', error);
    alert('认证过程中发生错误，请稍后重试');
  } finally {
    emailLoading.value = false; // 确保加载状态结束
  }
}

// GitHub 登录的加载状态
const gitHubLoading = ref(false);

// GitHub 登录函数
async function gitHubAuth() {
  gitHubLoading.value = true; // 开始加载
  const { supabase } = useAuthStore(); // 从 Pinia store 获取 Supabase 客户端
  try {
    // 调用 Supabase 的 signIn 方法，使用 GitHub 作为登录提供商
    const { user, error } = await supabase.auth.signIn(
      { provider: "github" },
      {
        redirectTo: `${window.location.origin}/auth/callback`, // 登录后跳转到回调页面
      }
    );
    if (error) {
      console.error('GitHub 登录错误:', error);
      alert(error.message); // 显示错误信息
    } else if (user) {
      router.push("/dashboard"); // 登录成功，跳转到dashboard
    }
  } catch (error) {
    console.error('GitHub 登录异常:', error);
    alert('GitHub 登录失败，请稍后重试');
  } finally {
    gitHubLoading.value = false; // 结束加载
  }
}

// Google 登录的加载状态
const googleLoading = ref(false);

// Google 登录函数
async function googleAuth() {
  googleLoading.value = true; // 开始加载
  const { supabase } = useAuthStore(); // 从 Pinia store 获取 Supabase 客户端
  try {
    // 调用 Supabase 的 signIn 方法，使用 Google 作为登录提供商
    const { user, error } = await supabase.auth.signIn(
      { provider: "google" },
      {
        redirectTo: `${window.location.origin}/auth/callback`, // 登录后跳转到回调页面
      }
    );
    if (error) {
      console.error('Google 登录错误:', error);
      alert(error.message); // 显示错误信息
    } else if (user) {
      router.push("/dashboard"); // 登录成功，跳转到dashboard
    }
  } catch (error) {
    console.error('Google 登录异常:', error);
    alert('Google 登录失败，请稍后重试');
  } finally {
    googleLoading.value = false; // 结束加载
  }
}

// Twitter 登录的加载状态
const twitterLoading = ref(false);

// Twitter 登录函数
async function twitterAuth() {
  twitterLoading.value = true; // 开始加载
  const { supabase } = useAuthStore(); // 从 Pinia store 获取 Supabase 客户端
  try {
    // 调用 Supabase 的 signIn 方法，使用 Twitter 作为登录提供商
    const { user, error } = await supabase.auth.signIn(
      { provider: "twitter" },
      {
        redirectTo: `${window.location.origin}/auth/callback`, // 登录后跳转到回调页面
      }
    );
    if (error) {
      console.error('Twitter 登录错误:', error);
      alert(error.message); // 显示错误信息
    } else if (user) {
      router.push("/dashboard"); // 登录成功，跳转到dashboard
    }
  } catch (error) {
    console.error('Twitter 登录异常:', error);
    alert('Twitter 登录失败，请稍后重试');
  } finally {
    twitterLoading.value = false; // 结束加载
  }
}

// Facebook 登录的加载状态
const facebookLoading = ref(false);

// Facebook 登录函数
async function facebookAuth() {
  facebookLoading.value = true; // 开始加载
  const { supabase } = useAuthStore(); // 从 Pinia store 获取 Supabase 客户端
  try {
    // 调用 Supabase 的 signIn 方法，使用 Facebook 作为登录提供商
    const { user, error } = await supabase.auth.signIn(
      { provider: "facebook" },
      {
        redirectTo: `${window.location.origin}/auth/callback`, // 登录后跳转到回调页面
      }
    );
    if (error) {
      console.error('Facebook 登录错误:', error);
      alert(error.message); // 显示错误信息
    } else if (user) {
      router.push("/dashboard"); // 登录成功，跳转到dashboard
    }
  } catch (error) {
    console.error('Facebook 登录异常:', error);
    alert('Facebook 登录失败，请稍后重试');
  } finally {
    facebookLoading.value = false; // 结束加载
  }
}

// 统一计算所有登录方式的加载状态
const loading = computed(
  () =>
    gitHubLoading.value ||
    emailLoading.value ||
    googleLoading.value ||
    twitterLoading.value ||
    facebookLoading.value
);
</script>

<template>
  <div>
    <!-- 页面标题 -->
    <h2 class="mb- text-2xl font-bold">
      {{ title }}
    </h2>
    <!-- 页面副标题 -->
    <p class="mb-4 text-sm text-slate-500">
      {{ subtitle }}
    </p>

    <!-- Email 登录/注册表单 -->
    <form class="flex w-full flex-col items-start" @submit.prevent="emailAuth">
      <!-- 邮箱标签 -->
      <VLabel for="email">Email</VLabel>
      <!-- 邮箱输入框 -->
      <VInput
        required
        :disabled="loading"
        class="w-full"
        name="email"
        id="email"
        type="email"
        :placeholder="emailPlaceholder"
        v-model="(credentials.email as string)"
      />
      <!-- 密码标签 -->
      <VLabel for="password">Password</VLabel>
      <!-- 密码输入框 -->
      <VPasswordInput
        :disabled="loading"
        class="mb-4 w-full"
        name="password"
        id="password"
        :placeholder="passwordPlaceholder"
        v-model="(credentials.password as string)"
      />

      <!-- 忘记密码链接（仅在登录模式显示） -->
      <router-link
        v-if="!signUp"
        to="/auth/forgotpassword"
        class="mb-4 text-sm font-bold"
        >Forgot your password?</router-link
      >

      <!-- 提交按钮 -->
      <VButton
        :loading="emailLoading"
        :disabled="loading"
        type="submit"
        class="bg-teal-700"
        >{{ signUp ? "Sign Up" : "Sign In" }}</VButton
      >
    </form>

    <!-- 第三方登录按钮 -->
    <div class="flex space-x-2">
      <!-- GitHub 登录按钮 -->
      <VButton
        :loading="gitHubLoading"
        :disabled="loading"
        type="button"
        class="flex items-center justify-center bg-black"
        @click="gitHubAuth"
      >
        <i-mdi-github class="h-5 w-5" />
      </VButton>
      <!-- Google 登录按钮 -->
      <VButton
        :loading="googleLoading"
        :disabled="loading"
        type="button"
        class="flex items-center justify-center bg-[#EA4335]"
        @click="googleAuth"
      >
        <i-mdi-google class="h-5 w-5" />
      </VButton>
      <!-- Twitter 登录按钮 -->
      <VButton
        :loading="twitterLoading"
        :disabled="loading"
        type="button"
        class="flex items-center justify-center bg-[#1DA1F2]"
        @click="twitterAuth"
      >
        <i-mdi-twitter class="h-5 w-5" />
      </VButton>
      <!-- Facebook 登录按钮 -->
      <VButton
        :loading="facebookLoading"
        :disabled="loading"
        type="button"
        class="flex items-center justify-center bg-[#425F9C]"
        @click="facebookAuth"
      >
        <i-mdi-facebook class="h-5 w-5" />
      </VButton>
    </div>

    <!-- 预留插槽，允许父组件插入额外内容 -->
    <slot name="actions" />
  </div>
</template>