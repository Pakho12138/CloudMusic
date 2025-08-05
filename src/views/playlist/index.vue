<template>
  <div class="container-wrapper">
    <PlayList title="我的歌单" :list="playlist" imgProp="coverImgUrl"></PlayList>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/useUserStore';
import { onMounted, ref } from 'vue';

onMounted(() => {
  getPlaylist();
});

const userStore = useUserStore();
const playlist: any = ref([]);
const hasMore = ref(true);
const getPlaylist = async () => {
  const res: any = await Api.get('user/playlist', {
    uid: userStore.userInfo.userId,
  });
  if (res.code == 200) {
    const list = res.playlist || [];
    list[0].name = '我喜欢的音乐';
    playlist.value = list;
    hasMore.value = res.more || false;
  }
};
</script>

<style lang="scss" scoped></style>
