// 路由配置文件从 vue-router 模块中导入 createRouter 和 createWebHistory。
// createRouter：用于创建一个 Vue Router 实例。
// createWebHistory：用于创建基于 HTML5 History API 的路由模式（无 # 的 URL）。
import { createRouter, createWebHistory } from "vue-router";
// 从 auth 模块中导入 useAuthStore 函数。
import { useAuthStore } from "./stores/auth";
// 从 pinia 模块中导入 pinia 实例。pinia：Pinia 是 Vue 的状态管理库，这里导入它的实例，供 useAuthStore 使用。
// pinia：Pinia 是 Vue 的状态管理库，这里导入它的实例，供 useAuthStore 使用。
import { pinia } from "./stores";

/**
 * 路由配置
 * 新结构：
 * / - 营销主页 (无需认证)
 * /auth/* - 认证相关页面 (无需认证)
 * /dashboard/* - 主应用页面 (需要认证)
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 营销主页 - 新增根路径
    {
      path: "/",
      name: "landing",
      component: () => import("@/views/LandingPage.vue"),
      meta: {
        requiresNoAuth: false, // 任何人都可以访问
      },
    },

    // 认证路由组 - 统一使用 /auth 前缀
    {
      path: "/auth",
      component: () => import("@/layouts/AuthLayout.vue"),
      meta: {
        requiresNoAuth: true, // 已登录用户不能访问
      },
      children: [
        {
          path: "signin",
          name: "signIn",
          component: () => import("@/views/auth/SignIn.vue"),
        },
        {
          path: "signup",
          name: "signUp",
          component: () => import("@/views/auth/SignUp.vue"),
        },
        {
          path: "forgotpassword",
          name: "forgotPassword",
          component: () => import("@/views/auth/ForgotPassword.vue"),
        },
        {
          path: "resetpassword",
          name: "resetPassword",
          component: () => import("@/views/auth/ResetPassword.vue"),
          beforeEnter: (to) => {
            // 只允许通过合法的重置密码链接访问
            if (!to.hash.includes("type=recovery")) {
              const { supabase } = useAuthStore();
              if (supabase.auth.user()) return "/dashboard";
              return "/auth/signin";
            }
          },
        },
        {
          path: "callback",
          name: "callback",
          component: () => import("@/views/auth/AuthCallback.vue"),
          beforeEnter: (to) => {
            /* 解析路由hash为字典 */
            const hashDictionary = {} as any;
            // 首先移除实际的 '#' 字符
            const hash = to.hash.replace("#", "");
            // 将hash分割为键值对
            hash.split("&").forEach((item) => {
              // 将 'key=value' 分割为 [key, value]
              const [key, value] = item.split("=");
              // 添加到结果中
              hashDictionary[key] = value;
            });

            // 检查必要的认证字段
            if (
              [
                "access_token",
                "expires_in",
                "provider_token",
                "refresh_token",
                "token_type",
              ].some((key) => !(key in hashDictionary))
            )
              return "/dashboard";
          },
        },
      ],
    },

    // 主应用路由组 - 使用 /dashboard 前缀
    {
      path: "/dashboard",
      component: () => import("@/layouts/DashboardLayout.vue"),
      meta: {
        requiresAuth: true, // 必须登录才能访问
      },
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("@/views/HomeView.vue"),
        },
        {
          path: "profile",
          name: "profile",
          component: () => import("@/views/ProfileView.vue"),
        },
        {
          path: "ai-magic-toolbox",
          name: "aiMagicToolbox",
          component: () => import("@/views/AIMagicToolbox.vue"),
        },
      ],
    },

    // 404 页面 - 放在最后作为兜底
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

// 监听Supabase认证状态变化
const { supabase } = useAuthStore(pinia);
supabase.auth.onAuthStateChange((event) => {
  console.log("Auth state changed:", event);
  
  if (event == "SIGNED_OUT") {
    // 登出时跳转到营销主页
    return router.push("/");
  }
  
  if (event == "SIGNED_IN") {
    const routeName = router.currentRoute.value.name;
    console.log("Current route:", routeName);

    // 如果是从认证回调页面登录，跳转到dashboard
    if (routeName == "callback") {
      setTimeout(() => {
        return router.push({ name: "dashboard" });
      }, 0);
    }
  }
});

// 全局路由守卫
router.beforeEach((to) => {
  const { supabase } = useAuthStore();

  // 需要认证但未登录 -> 跳转到登录页
  if (to.meta.requiresAuth && !supabase.auth.user()) {
    return {
      path: "/auth/signin",
    };
  }
  
  // 不需要认证但已登录 -> 跳转到dashboard
  if (to.meta.requiresNoAuth && supabase.auth.user()) {
    return {
      path: "/dashboard",
    };
  }
});

// 将配置好的 router 实例导出，供 main.js 或其他入口文件使用。
export default router;
