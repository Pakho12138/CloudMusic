import router from '@/router';
import { defineStore } from 'pinia';

export const useUserStore = defineStore(
  'userStore',
  () => {
    const userInfo: any = ref({});

    const setUserInfo = (info: any) => {
      userInfo.value = info;
    };

    // 登录弹窗相关
    const loginDialogVisible = ref(false);
    // 打开登录弹窗
    const openLoginDialog = () => {
      loginDialogVisible.value = true;
    };
    // 关闭登录弹窗
    const closeLoginDialog = () => {
      loginDialogVisible.value = false;
    };
    const isLogin = computed(() => {
      return userInfo.value.userId;
    });

    const logout = () => {
      userInfo.value = {};
      localStorage.removeItem('cookie');
      router.push('/'); // 跳转到首页
      location.reload();
    };

    return {
      userInfo,
      setUserInfo,
      loginDialogVisible,
      openLoginDialog,
      closeLoginDialog,
      isLogin,
      logout,
    };
  },
  {
    // 启用持久化
    persist: {
      storage: localStorage,
      // 自定义存储键名
      key: 'userInfo',
      // 只存储某个字段
      pick: ['userInfo'],
    },
  }
);
