import type { themeState } from '@/hooks/interface';
import { defineStore } from 'pinia';
// import piniaPersistConfig from '@/config/piniaPersist'

/**
 * 主题设置s
 */
export const useThemeStore = defineStore('themeStore', {
  state: (): themeState => ({
    isDark: true,
    primary: '#000000',
    language: 'Chinese',
  }),
  actions: {
    setDark(isDark: string | number | boolean) {
      this.isDark = isDark;
    },
    setPrimary(primary: string) {
      this.primary = primary;
    },
    setLanguage(language: string) {
      this.language = language;
    },
  },
});
