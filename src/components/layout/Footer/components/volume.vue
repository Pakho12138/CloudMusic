<template>
  <div class="flex items-center">
    <div class="can-click text-[var(--button-inactive)] text-[26px]" @click="toggleVolume">
      <Icon icon="iconamoon:volume-off-light" v-if="isMuted" />
      <Icon icon="bi:volume-up" v-else />
    </div>

    <el-slider
      v-model="volume"
      :show-tooltip="false"
      @change="setVolume"
      class="!w-24 ml-1"
      size="small" />
  </div>
</template>

<script setup lang="ts">
import { MusicPlayer } from '@/hooks/interface';
import { Icon } from '@iconify/vue';
const { setVolume, volume } = inject('MusicPlayer') as MusicPlayer;

const isMuted = computed(() => volume.value === 0);

const toggleVolume = () => {
  setVolume(isMuted.value ? 70 : 0);
};
</script>
