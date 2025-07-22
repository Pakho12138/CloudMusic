<template>
  <MusicList ref="musicListRef" type="like" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MusicList from '../../components/MusicList.vue';
import { useUserStore } from '@/stores/useUserStore';
import { useAudioStore } from '@/stores/useAudioStore';

const musicListRef = ref();
const userStore = useUserStore();
const audioStore = useAudioStore();

const getLikeList = async () => {
  const res: any = await Api.get('likelist', {
    uid: userStore.userInfo.userId,
    cookie: localStorage.getItem('cookie'),
  });
  if (res.code == 200) {
    audioStore.likeList = res.data;
  }
};

onMounted(() => {
  musicListRef.value.getData();
});
</script>

<style lang="scss" scoped></style>
