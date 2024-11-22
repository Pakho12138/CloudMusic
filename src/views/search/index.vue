<template>
  <TabBar v-model="curTab" :tabs="tabs" />

  <div class="container-wrapper">
    <MusicList v-if="curTab=='songs'" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TabBar from '@/components/TabBar.vue';
import MusicList from './components/MusicList.vue';

onMounted(() => {

});

const curTab = ref<string>('songs');
const tabs = ref<Array<any>>([
  {
    label: '单曲',
    name: 'songs',
  },
  {
    label: '歌手',
    name: 'singer',
  },
  {
    label: '专辑',
    name: 'album',
  },
  {
    label: '歌单',
    name: 'playlist',
  },
  {
    label: 'MV',
    name: 'mv',
  },
]);
</script>

<style lang="scss" scoped>

</style>