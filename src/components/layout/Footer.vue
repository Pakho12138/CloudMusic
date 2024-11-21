<template>
  <div class="footer-wrapper flex-align-center">
    <div class="music-info flex-align-center">
      <div class="photo-wrapper flex-center can-click" @click="emit('show')">
        <img :src="currentSong.cover" />
      </div>
      <div class="detail">
        <div class="name">{{ currentSong.title }}</div>
        <div class="singer">{{ currentSong.singer }}</div>
      </div>
    </div>

    <div class="player flex-align-center">
      <Icon class="btn-pre can-click" icon="mage:previous-fill" @click="playPrevious" />
      <Icon class="btn-play can-click" :icon="isPlaying ? 'material-symbols:pause-circle-rounded' : 'material-symbols:play-circle-rounded'" @click="togglePlayPause" />
      <Icon class="btn-next can-click" icon="mage:next-fill" @click="playNext" />
      <div class="process-bar flex-align-center">
        <el-slider v-model="currentTime" :step="1" :show-tooltip="false" @change="changeCurrentTime" :max="duration" size="small" />
        <div class="duration">
          <span>{{ formatTime(currentTime) }}</span>
          <span>/</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
      <Icon class="btn-like can-click" :class="{ active: isLike }" icon="solar:heart-bold" @click="handleLike" />
      <Icon class="btn-download can-click" icon="material-symbols:download" />
      <Icon class="btn-list can-click" icon="icon-park-solid:music-list" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MusicPlayer } from '@/hooks/interface';
import { Icon } from '@iconify/vue';
import { inject, onMounted, ref } from 'vue';

const { currentSong, togglePlayPause, isPlaying, playNext, playPrevious, currentTime, duration, changeCurrentTime, setPlayMode } = inject('MusicPlayer') as MusicPlayer;

const emit = defineEmits(['show']);

onMounted(() => {});

const isLike = ref<boolean>(false);

// 格式化时间
function formatTime(seconds: number): string {
  // 将秒数转换为整数分钟数和剩余秒数
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);

  // 返回格式化的字符串，确保分钟和秒数都至少有两位数
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

const handleLike = () => {
  isLike.value = !isLike.value;
};
</script>

<style lang="scss" scoped>
.footer-wrapper {
  height: 100%;
  width: 100%;
  padding: 0 20px;
  .music-info {
    width: 220px;
    overflow: hidden;
    .photo-wrapper {
      width: 40px;
      height: 40px;
      background: var(--theme-bg-color);
      border-radius: 6px;
      overflow: hidden;
    }
    .ic-music {
      font-size: 26px;
      color: var(--inactive-color);
    }
    .detail {
      margin-left: 10px;
      .name {
        font-size: 14px;
        line-height: 20px;
        color: var(--theme-color);
      }
      .singer {
        font-size: 12px;
        line-height: 16px;
        color: var(--button-inactive);
      }
    }
  }
  .player {
    flex: 1;
    overflow: hidden;
    .btn-pre,
    .btn-next {
      color: var(--button-inactive);
      font-size: 26px;
    }
    .btn-play {
      color: var(--button-inactive);
      font-size: 32px;
      margin: 0 10px;
    }
    .process-bar {
      flex: 1;
      overflow: hidden;
      margin: 0 20px;
      .el-slider {
        flex: 1;
        overflow: hidden;
        :deep(.el-slider__button-wrapper) {
          display: none;
        }
      }
      .duration {
        font-size: 12px;
        color: var(--button-inactive);
        margin-left: 10px;
      }
    }
    .btn-like {
      color: var(--button-inactive);
      font-size: 26px;
      &.active {
        color: #c20c0c;
      }
    }
    .btn-download {
      color: var(--button-inactive);
      font-size: 30px;
      margin-left: 10px;
    }
    .btn-list {
      color: var(--button-inactive);
      font-size: 28px;
      margin-left: 10px;
    }
  }
}
</style>
