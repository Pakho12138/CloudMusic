import { defineStore } from 'pinia';

export const useUserStore = defineStore('useUserStore', {
  state: () => ({
    userInfo: {
      avatarUrl: 'https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png',
    },
  }),
  actions: {
    setUserInfo(userInfo: any) {
      this.userInfo = userInfo;
    },
  },
});
