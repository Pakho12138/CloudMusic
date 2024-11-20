<template>
  <el-drawer v-model="drawer" :direction="direction" style="box-shadow: none" size="100%" :modal="false" :showClose="false" class="drawer-bg">
    <Icon class="btn-close can-click size-36 text-red-500" icon="ic:round-keyboard-arrow-down" />

  </el-drawer>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
import { onMounted, reactive, ref, toRefs } from 'vue';

const state = reactive({
  direction: 'btt',
  drawer: false,
  commentListData: [] as Comment[],
  commenDrawer: false,
  commenTotal: 0,
  isUserScrolling: false,
});

const { direction, drawer, commentListData, commenDrawer, commenTotal } = toRefs(state);

onMounted(() => {});

const show = () => {
  drawer.value = true;
};

const close = () => {
  drawer.value = false;
};

defineExpose({
  show,
});
</script>

<style lang="scss" scoped></style>
