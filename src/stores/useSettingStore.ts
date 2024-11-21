import type { SettingState } from '@/hooks/interface';
import { defineStore } from 'pinia';
// import piniaPersistConfig from '@/config/piniaPersist'

/**
 * 设置
 */
export const useSettingStore = defineStore({
  id: 'useSettingStore',
  state: (): SettingState => ({
    isDrawerCover: true,
    isOriginalParsed: true,
    isRomaParsed: true,
    isTranslatedParsed: true,
  }),
  actions: {
    setOriginalParsed(isOriginalParsed: boolean) {
      this.isOriginalParsed = isOriginalParsed;
    },
    setRomaParsed(isRomaParsed: boolean) {
      this.isRomaParsed = isRomaParsed;
    },
    setTranslatedParsed(isTranslatedParsed: boolean) {
      this.isTranslatedParsed = isTranslatedParsed;
    },
    setDrawerCover(isDrawerCover: boolean) {
      this.isDrawerCover = isDrawerCover;
    },
  },
  // persist: piniaPersistConfig('SettingStore'),
});
