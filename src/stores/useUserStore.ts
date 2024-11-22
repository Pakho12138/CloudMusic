import { defineStore } from 'pinia';

export const useUserStore = defineStore('useUserStore', {
  state: () => ({
    userInfo: {
      avatarUrl: '',
    },
  }),
  actions: {
    setUserInfo(userInfo: any) {
      this.userInfo = userInfo;
    },
  },
});
