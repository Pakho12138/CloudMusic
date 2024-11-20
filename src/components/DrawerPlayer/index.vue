<template>
  <el-drawer
    :style="{
      '--track-cover-url': `url(/img/bg.jpg)`,
    }"
    v-model="drawer"
    :direction="direction"
    style="box-shadow: none"
    size="100%"
    :modal="false"
    :showClose="false"
    class="drawer-bg">
    <template #header>
      <div class="flex items-center">
        <Icon class="btn-close can-click size-[40px] text-[--button-inactive]" icon="ic:round-keyboard-arrow-down" @click="close" />
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
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
