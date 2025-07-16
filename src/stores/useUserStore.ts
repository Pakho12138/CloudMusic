import { defineStore } from 'pinia';

export const useUserStore = defineStore('useUserStore', () => {
  const userInfo = ref({
    avatarUrl: '',
  });

  const setUserInfo = (userInfo: any) => {
    userInfo.value = userInfo;
  };

  // 登录弹窗相关
  const loginDialogVisible = ref(false);
  // 打开登录弹窗
  const openLoginDialog = () => {
    loginDialogVisible.value = true;
  };

  return {
    userInfo,
    setUserInfo,
    loginDialogVisible,
    openLoginDialog,
  };
});
