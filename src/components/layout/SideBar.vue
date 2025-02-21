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
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const defaultActive = ref('');
const route = useRoute();
onMounted(() => {
});

const router = useRouter();
const handleSelect = (idx: string) => {
  router.replace({name: idx});
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
    --el-menu-base-level-padding: 10px;
    .el-menu-item {
      padding: 10px var(--el-menu-base-level-padding);
      border-radius: 6px;
      &.is-active {
        color: var(--theme-color);
        background: var(--hover-menu-bg);
      }
      & + .el-menu-item {
        margin-top: 4px;
      }
    }
  }
}
</style>
