<template>
  <el-popover :width="450" trigger="click" placement="top-end">
    <div class="p-2">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <h1 class="text-xl font-bold dark:text-white">
            最近播放
            <span class="text-base">({{ audioStore.trackList.length }})</span>
          </h1>
        </div>
        <div
          class="can-click flex items-center cursor-pointer text-[var(--button-inactive)]"
          @click="audioStore.clearAllSong">
          <Icon icon="material-symbols:delete-outline-rounded"
            class="text-lg mr-1" />
          清空
        </div>
      </div>

      <el-scrollbar class="!h-[300px]">
        <ul class="space-y-1">
          <li
            v-for="(song, index) in audioStore.trackList"
            :key="index"
            class="flex items-center px-4 py-1 hover:bg-[var(--theme-bg-color)] rounded-lg transition justify-between cursor-pointer"
            @click="playMusic(song.id)"
            @mouseover="mouseOverIndex = index"
            @mouseleave="mouseOverIndex = -1">
            <div class="flex items-center">
              <img
                :src="song.cover + '?param=90y90'"
                :alt="song.title"
                class="w-8 h-8 rounded-lg mr-4" />
              <div>
                <h2 class="text-sm font-semibold dark:text-white">
                  {{ song.title }}
                </h2>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ song.singer }}
                </p>
              </div>
            </div>

            <!-- 默认显示时间 -->
            <div v-show="mouseOverIndex !== index" class="text-[var(--button-inactive)]">
              {{ formatMillisecondsToTime(song.time) }}
            </div>
            <!-- 高亮显示图标 -->
            <div class="flex items-center" v-show="mouseOverIndex == index">
              <Icon
                icon="mingcute:play-circle-line"
                class="can-click text-lg text-[var(--button-inactive)]"
                @click="playMusic(song.id)" />
              <Icon
                icon="solar:video-frame-linear"
                class="can-click text-lg ml-1 text-[var(--button-inactive)]"
                v-if="song.mv && song.mv !== 0"
                @click="router.push(`/video?id=${song.mv}`)" />
              <Icon
                icon="material-symbols:delete-outline-rounded"
                class="can-click text-lg ml-1 text-[var(--button-inactive)]"
                @click="audioStore.deleteTrack(song.id)" />
            </div>
          </li>
        </ul>
      </el-scrollbar>
    </div>
    <!-- 显示的图标 -->
    <template #reference>
      <Icon class="can-click text-[var(--button-inactive)] size-[28px] ml-[10px]" icon="icon-park-solid:music-list" />
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { MusicPlayer } from '@/hooks/interface';
import { useAudioStore } from '@/stores/useAudioStore';
import { formatMillisecondsToTime } from '@/utils/util';
import { Icon } from '@iconify/vue';

const router = useRouter();

const audioStore = useAudioStore();

const { playSong } = inject('MusicPlayer') as MusicPlayer;

const mouseOverIndex = ref(-1); // 用于跟踪鼠标悬停的索引

const playMusic = (id: number | string) => {
  const existingIndex = audioStore.trackList.findIndex(
    existingTrack => existingTrack.id === id
  );
  const existingTrack = audioStore.trackList[existingIndex];
  audioStore.setCurrentSong(existingIndex);
  playSong(existingTrack);
};
</script>

<style scoped>
.el-button + .el-button {
  margin-left: 0;
}
</style>
