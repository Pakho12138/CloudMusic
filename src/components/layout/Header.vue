<template>
  <div class="header">
    <div class="menu-circle"></div>
    <div class="flex-1 flex items-center justify-between">
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-4 ml-6">
          <Icon
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

      <div class="flex items-center gap-2" @click="login">
        <el-avatar
          v-if="userStore.userInfo?.avatarUrl"
          :src="userStore.userInfo.avatarUrl"
          class="can-click mr-2"
          shape="circle"
          :size="40" />
        <div
          v-else
          class="can-click w-10 h-10 flex items-center justify-center rounded-[50%] bg-[--search-bg]">
          <el-icon class="!text-[--inactive-color] !text-xl"
            ><UserFilled
          /></el-icon>
        </div>
        <div class="can-click text-[--button-inactive] text-sm">登录</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { Api } from '@/utils/request';
import { useUserStore } from '@/stores/useUserStore';
import { ElNotification } from 'element-plus';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  searchDefault();
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
  // ElNotification({
  //   title: '提示',
  //   message: '暂未开放',
  //   type: 'warning',
  // });
  userStore.openLoginDialog();
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 58px;
  width: 100%;
  border-bottom: 1px solid var(--border-color);
  padding: 0 30px;
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
