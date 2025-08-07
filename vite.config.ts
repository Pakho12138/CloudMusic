import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import IconsResolver from 'unplugin-icons/resolver'; // 集成图标集

import Icons from 'unplugin-icons/vite';
import path from 'path';
import cssnano from 'cssnano';
import { AcceptedPlugin } from 'postcss';

const pathSrc = path.resolve(__dirname, 'src');

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dirs: ['src/utils/**', 'src/stores/modules/**', 'src/hooks/**'],
      resolvers: [
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
      dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
    }),
    Components({
      // dirs: ["src/components"],
      dts: path.resolve(pathSrc, 'components.d.ts'),
    }),
    Icons({
      autoInstall: true, // 自动安装所需图标集
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // or 'modern'
        silenceDeprecations: ['legacy-js-api'],
        additionalData: `@use "@/assets/element.scss" as *;`,
      },
    },
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
        // 开发环境启用基础压缩
        (process.env.NODE_ENV === 'development' &&
          cssnano({
            preset: ['default', { discardComments: { removeAll: true } }],
          })) as AcceptedPlugin,
      ].filter(Boolean),
    },
  },
});
