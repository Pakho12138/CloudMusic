<template>
  <TabBar v-model="curTab" :tabs="tabs" />

  <!-- 使用 KeepAlive 缓存组件 -->
  <KeepAlive>
    <Recommend v-if="curTab === 'recommend'" />
    
    <view v-else class="container-wrapper flex-center"> 暂未开放 </view>
  </KeepAlive>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TabBar from '@/components/TabBar.vue';
import Recommend from './components/Recommend.vue';

onMounted(() => {});

const curTab = ref<string>('recommend');
const tabs = ref<Array<any>>([
  {
    label: '推荐',
    name: 'recommend',
  },
  {
    label: '排行榜',
    name: 'toplist',
  },
  {
    label: '歌单',
    name: 'playlist',
  },
  {
    label: '主播电台',
    name: 'djradio',
  },
]);
</script>

<style lang="scss" scoped></style>
