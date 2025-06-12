# Vuepabase

This is a project I created to show how Supabase auth (email and 3rd party GitHub) can be set up concretely with a new Vue 3 app. This integrates Supabase with Vue 3, Pinia, Vue-router 4, TailwindCSS, Vitest, Cypress and more. Please see package.json for more info.

If you want to a quick start to your next Vue 3 + Supabase app, please feel free to use this template. Below I will guide you through how to set the app up locally, and the configuration you need to do in Supabase.

## Supabase Setup

Head on over to https://supabase.com/ and create your app. Choose your Project name, password, region and pricing plan as appropriate. This app will work just fine on free tier.

Once the app setup is finished, head over to Authentication - Settings.
You'll want to add both your Production URL and localhost URLs to the Site URL / Additional Redirect URLs columns. Along with the base URL, we need to add redirect URLs for our password reset flow, and 3rd party auth flow. These are `/resetpassword` and `/callback` respectively.

All in all your 'Site URL' and 'Additional Redirect URLs' should look something like this (replacing the prod URL as appropriate)

| Field  | Value |
| ------------- | ------------- |
| Site URL  | `https://vuepabase.netlify.app/`  |
| Additional Redirect URLs  | `http://localhost:3000/resetpassword`, `https://vuepabase.netlify.app/resetpassword`, `http://localhost:3000`, `http://localhost:3000/callback`, `https://vuepabase.netlify.app/callback`  |

Once you save this, the email-password authentication flow should work properly after you've set the Vue app up locally.

### GitHub Auth

You can additionally add GitHub auth to the app. First you'll need to go to GitHub and set up some app credentials.

Supabase have a great guide on how to do this already so you can follow that here: https://supabase.com/docs/guides/auth/auth-github

After you've got them, on Supabase - Settings - Auth, just enable GitHub as a 3rd party provider and enter the details you generated.

Your Supabase set up should now be complete and you can run the app locally.

## Setup Vue app

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

Your app should now be running at localhost:3000

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Preview Built App

```sh
npm run preview
```

### Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar) (and disable Vetur).
目录结构
supabase-edu-app/
├── .cursor/                    # 现有的cursor配置
├── .env.example               # 环境变量示例
├── public/                    # 静态资源
├── src/
│   ├── config/               # 🆕 配置文件目录
│   │   ├── ai/
│   │   │   └── index.ts      # AI相关配置 (Dify)
│   │   ├── api/
│   │   │   └── index.ts      # API路由配置
│   │   ├── auth/
│   │   │   └── index.ts      # 认证配置
│   │   ├── db/
│   │   │   └── tables.ts     # 数据库表配置
│   │   ├── payment/          # 🆕 支付配置 (预留)
│   │   │   └── index.ts
│   │   └── products/         # 🆕 产品配置 (预留)
│   │       └── index.ts
│   │
│   ├── modules/              # 🆕 功能模块目录
│   │   ├── marketing/        # 营销模块
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   └── composables/
│   │   ├── auth/             # 认证模块
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   ├── services/
│   │   │   └── composables/
│   │   ├── dashboard/        # 仪表板模块
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   └── composables/
│   │   ├── ai/              # AI工具模块
│   │   │   ├── components/
│   │   │   ├── views/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── payment/         # 🆕 支付模块 (预留)
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── shared/          # 共享模块
│   │       ├── components/
│   │       ├── composables/
│   │       ├── types/
│   │       └── utils/
│   │
│   ├── views/               # 保持现有页面结构
│   ├── components/          # 逐步迁移到modules
│   ├── layouts/             # 布局组件
│   ├── services/            # 服务层
│   ├── stores/              # 状态管理
│   ├── router.ts            # 路由配置
│   └── main.ts              # 应用入口
│
├── sql/                     # 🆕 数据库SQL文件
│   ├── init.sql
│   ├── auth.sql
│   └── ai.sql
│
└── docs/                    # 🆕 项目文档 (预留)
    ├── api/
    ├── deployment/
    └── development/