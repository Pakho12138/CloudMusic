<template>
  <TabBar v-model="curTab" :tabs="tabs" />

  <!-- 使用 KeepAlive 缓存组件 -->
  <KeepAlive>
    <div v-if="curTab === 'song'" class="container-wrapper">
      <MusicList ref="musicListRef" type="recently" />
    </div>

    <view v-else class="container-wrapper flex-center"> 暂未开放 </view>
  </KeepAlive>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TabBar from '@/components/TabBar.vue';
import MusicList from '@/components/MusicList.vue';

onMounted(() => {});

const curTab = ref<string>('song');
const tabs = ref<Array<any>>([
  {
    label: '歌曲',
    name: 'song',
  },
  {
    label: '视频',
    name: 'video',
  },
  {
    label: '歌单',
    name: 'playlist',
  },
  {
    label: '专辑',
    name: 'album',
  },
]);
</script>

<style lang="scss" scoped></style>
