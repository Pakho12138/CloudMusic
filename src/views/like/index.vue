<template>
  <MusicList ref="musicListRef" type="like" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MusicList from '../../components/MusicList.vue';

const musicListRef = ref();
onMounted(() => {
  musicListRef.value.getData();
});
</script>

<style lang="scss" scoped></style>
