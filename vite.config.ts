import { fileURLToPath } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import PurgeIcons from "vite-plugin-purge-icons";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    
    // 更新 Icons 插件配置
    Icons({
      compiler: "vue3",
      // 添加 autoInstall 选项以自动下载缺少的图标库
      autoInstall: true
    }),
    
    PurgeIcons({
      content: ["​**​/*.html", "​**​/*.js", "​**​/*.ts", "​**​/*.vue"],
    }),
    
    // 更新 Components 插件配置
    Components({
      dts: true,
      resolvers: [
        // 启用多个图标集合
        IconsResolver({
          prefix: 'i', // 图标前缀
          enabledCollections: ['heroicons-outline', 'heroicons-solid', 'lucide']
        }),
      ],
    }),
    
    AutoImport({
      include: [/\.[tj]s?$/, /\.vue$/, /\.vue\?vue/],
      imports: ["vue", "vue-router", "@vueuse/core", "pinia"],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  
  // 可选：禁用错误覆盖层（错误提示不会全屏显示）
  server: {
    hmr: {
      overlay: false
    }
  }
});