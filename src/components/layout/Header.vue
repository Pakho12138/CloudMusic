<template>
  <div class="header">
    <div class="menu-circle" @click="toggleSpectrogram()"></div>

    <div class="flex-1 flex items-center justify-between">
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-4 ml-6">
          <Icon
            :class="!canGoBack ? 'opacity-30 !cursor-not-allowed' : ''"
            class="can-click text-2xl text-[--button-inactive]"
            icon="material-symbols:arrow-back-ios"
            @click="router.back()" />
          <Icon
            class="can-click text-2xl text-[--button-inactive]"
            icon="material-symbols:arrow-forward-ios"
            @click="router.forward()" />
        </div>

        <el-input
          class="search-bar min-w-64 max-w-64"
          v-model="keyWord"
          :placeholder="searchKW?.showKeyword || '搜索'"
          @keyup.enter="toSearch"
          clearable>
          <template #prefix>
            <el-icon class="text-[--inactive-color]"><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <el-dropdown
        size="large"
        placement="bottom-end"
        @command="handleDropdownCommand"
        :disabled="!userStore.isLogin">
        <div class="flex items-center gap-2 pr-[30px]" @click="login">
          <el-avatar
            v-if="userStore.userInfo?.avatarUrl"
            :src="userStore.userInfo.avatarUrl"
            class="can-click"
            shape="circle"
            :size="40" />
          <div
            v-else
            class="can-click w-10 h-10 flex items-center justify-center rounded-[50%] bg-[--search-bg]">
            <el-icon class="!text-[--inactive-color] !text-xl"
              ><UserFilled
            /></el-icon>
          </div>
          <div
            v-if="!userStore.userInfo?.userId"
            class="can-click text-[--button-inactive] text-sm mr-2">
            登录
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="min-w-[160px]">
            <div
              class="py-[10px] px-[16px] bg-[--theme-bg-color] text-base text-center mx-[7px] mb-[7px] rounded">
              <div class="flex items-center justify-center gap-2">
                <b
                  v-if="userStore.userInfo?.vipType == 11"
                  class="text-sm text-[#FFD700] italic"
                  >VIP</b
                >
                <b
                  v-if="userStore.userInfo?.vipType == 110"
                  class="text-sm text-[#FFD700] italic"
                  >SVIP</b
                >
                <b>{{ userStore.userInfo.nickname }}</b>
              </div>
              <div
                class="flex items-center justify-center text-[--button-inactive] text-sm mt-1">
                <Icon
                  v-if="userStore.userInfo.gender === 1"
                  icon="material-symbols:male-rounded"
                  class="text-lg mr-1 !text-[deepskyblue]"></Icon>
                <Icon
                  v-if="userStore.userInfo.gender === 2"
                  icon="material-symbols:female-rounded"
                  class="text-lg mr-1 !text-[hotpink]"></Icon>
                <div>
                  等级：<b>Lv{{ userStore.userInfo.level || 1 }}</b>
                </div>
              </div>
            </div>
            <el-dropdown-item class="justify-center" command="logout">
              <Icon icon="material-symbols:logout" class="text-base mr-1"></Icon
              >退出登录</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { Api } from '@/utils/request';
import { useUserStore } from '@/stores/useUserStore';
import { ElNotification } from 'element-plus';
import router from '@/router';

const toggleSpectrogram = inject('toggleSpectrogram') as any;

const route = useRoute();
const userStore = useUserStore();

onMounted(() => {
  searchDefault();
  if (localStorage.getItem('cookie')) {
    getUserDetail();
  }
});

const keyWord = ref(route.query.kw || '');
// 默认搜索关键词
const searchKW = ref();
const searchDefault = async () => {
  const res: any = await Api.get('/search/default');
  if (res.code == 200) {
    searchKW.value = res.data;
  }
};
const toSearch = () => {
  const kw = keyWord.value || searchKW.value.realkeyword;
  kw && router.push(`/search?kw=${kw}`);
};

const login = () => {
  !userStore.isLogin && userStore.openLoginDialog();
};

const getUserDetail = async () => {
  const params = {
    cookie: localStorage.getItem('cookie'),
  };
  const res: any = await Promise.all([
    Api.post('/user/account', params),
    Api.post('/user/level', params),
  ]);
  let userInfo = {};
  if (res[0]?.code == 200) {
    const account = res[0].account || {};
    const profile = res[0].profile || {};
    userInfo = { ...profile, vipType: account.vipType || 0 };
  }
  if (res[1]?.code == 200) {
    userInfo = { ...userInfo, level: res[1].data?.level || 1 };
  }
  userStore.setUserInfo(userInfo);
};

const handleDropdownCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout();
    ElNotification({
      title: '成功',
      message: '已退出登录',
      type: 'success',
    });
  }
};

const canGoBack = computed(() => {
  return (
    router.currentRoute.value.matched.length > 0 &&
    window.history.state?.position > 0
  );
});
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 58px;
  width: 100%;
  border-bottom: 1px solid var(--border-color);
  padding: 0 0 0 30px;
  white-space: nowrap;
  .menu-circle {
    width: 15px;
    height: 15px;
    background-color: #f96057;
    border-radius: 50%;
    box-shadow: 24px 0 0 0 #f8ce52, 48px 0 0 0 #5fcf65;
    margin-right: 195px;
    flex-shrink: 0;
  }
  .search-bar {
    flex: 1;
    overflow: hidden;
    --el-input-height: 40px;
    --el-input-border-color: var(--search-bg);
    --el-input-hover-border-color: var(--border-color);
    --el-input-focus-border-color: var(--border-color);
    --el-input-bg-color: var(--search-bg);
    --el-input-text-color: var(--theme-color);
  }
}
</style>
