<template>
  <div class="sidebar-wrapper">
    <h5 class="side-title">Music</h5>
    <el-menu default-active="0">
      <el-menu-item index="0">
        <el-icon><Headset /></el-icon>
        <template #title>发现音乐</template>
      </el-menu-item>
      <el-menu-item index="1">
        <el-icon><Film /></el-icon>
        <template #title>MV</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

onMounted(() => {});
</script>

<style lang="scss" scoped>
.sidebar-wrapper {
  height: 100%;
  padding: 26px;
  overflow-y: auto;
  .side-title {
    color: var(--inactive-color);
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
      &+.el-menu-item {
        margin-top: 4px;
      }
    }
  }
}
</style>
