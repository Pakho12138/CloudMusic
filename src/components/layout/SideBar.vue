<template>
  <div class="sidebar-wrapper">
    <h5 class="side-title">Music</h5>
    <el-menu :default-active="defaultActive" @select="handleSelect">
      <el-menu-item index="home">
        <el-icon><Headset /></el-icon>
        <template #title>发现音乐</template>
      </el-menu-item>
      <el-menu-item index="mv">
        <el-icon><Film /></el-icon>
        <template #title>MV</template>
      </el-menu-item>
      <el-menu-item index="playlist" v-if="userStore.isLogin">
        <Icon
          icon="icon-park-solid:music-list"
          class="menu-icon" />
        <template #title>我的歌单</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/useUserStore';
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';

onMounted(() => {});

const defaultActive = ref('');
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const handleSelect = (idx: string) => {
  router.replace({ name: idx });
};

watch(
  () => route.name,
  newKw => {
    defaultActive.value = newKw as string;
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.sidebar-wrapper {
  height: 100%;
  padding: 26px;
  overflow-y: auto;
  .side-title {
    color: var(--button-inactive);
    margin-bottom: 14px;
    font-size: 15px;
    font-weight: 500;
  }
  .el-menu {
    --el-menu-bg-color: transparent;
    --el-menu-border-color: transparent;
    --el-menu-text-color: var(--theme-color);
    --el-menu-hover-bg-color: var(--hover-menu-bg);
    --el-menu-item-height: auto;
    --el-menu-sub-item-height: auto;
    --el-menu-base-level-padding: 10px;
    > :not(:first-child) {
      margin-top: 4px;
    }
    .el-menu-item,
    :deep(.el-sub-menu__title) {
      padding: 10px var(--el-menu-base-level-padding) 10px
        calc(
          var(--el-menu-base-level-padding) + var(--el-menu-level) *
            var(--el-menu-level-padding)
        );
      border-radius: 6px;
      &.is-active {
        color: var(--theme-color);
        background: var(--hover-menu-bg);
      }
      .menu-icon {
        width: 24px;
        font-size: 18px;
        margin-right: 5px;
      }
    }
  }
}
</style>
