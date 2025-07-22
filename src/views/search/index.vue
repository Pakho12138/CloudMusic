<template>
  <TabBar v-model="curTab" :tabs="tabs" @change="getData()" />

  <MusicList v-if="curTab == 'songs'" ref="musicListRef" :keywords="keywords" />
  <MVList v-else-if="curTab == 'mv'" ref="mvListRef" :keywords="keywords" />

  <div v-else class="container-wrapper flex-center"> 暂未开放 </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TabBar from '@/components/TabBar.vue';
import MusicList from '../../components/MusicList.vue';
import MVList from '../mv/components/MVList.vue';

onMounted(() => {
  keywords.value = route.query.kw as string;
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

const tabsOpened = ref<Array<string>>(['songs']);
const mvListRef = ref();
const musicListRef = ref();
const getData = () => {
  nextTick().then(() => {
    tabsOpened.value.includes(curTab.value) ||
      tabsOpened.value.push(curTab.value);
    switch (curTab.value) {
      case 'songs':
        musicListRef.value.getData(true);
        break;
      case 'mv':
        mvListRef.value.getData(false);
        break;
    }
  });
};

const route = useRoute();
const keywords = ref<string>('');
// 监听搜索关键字
watch(
  () => route.query.kw,
  newKw => {
    if (typeof newKw === 'string') {
      keywords.value = newKw;
      getData();
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped></style>
