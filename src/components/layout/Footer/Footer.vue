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
      <Icon
        class="btn-pre can-click"
        icon="mage:previous-fill"
        @click="playPrevious" />
      <div class="relative">
        <Icon
          class="btn-play absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 !m-0 pointer-events-none"
          :class="isLoading ? 'opacity-100' : 'opacity-0'"
          icon="svg-spinners:90-ring-with-bg" />
        <Icon
          class="btn-play can-click"
          :class="
            isLoading
              ? 'opacity-0 !cursor-default'
              : 'opacity-100 !cursor-pointer'
          "
          :icon="
            isPlaying
              ? 'material-symbols:pause-circle-rounded'
              : 'material-symbols:play-circle-rounded'
          "
          @click="togglePlayPause" />
      </div>
      <Icon
        class="btn-next can-click"
        icon="mage:next-fill"
        @click="playNext" />
      <div class="process-bar flex-align-center">
        <el-slider
          v-model="currentTime"
          :step="1"
          :show-tooltip="false"
          @change="changeCurrentTime"
          @input="inputCurrentTime"
          :max="duration"
          :disabled="isLoading"
          size="small" />
        <div class="duration">
          <span>{{ formatTime(currentTime) }}</span>
          <span>/</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <Volume />

      <!-- 添加点击事件 -->
      <Icon
        class="btn-like can-click"
        :class="{ active: AudioStore.isLike }"
        icon="solar:heart-bold"
        @click="handleLike" />
      <Icon
        class="btn-download can-click"
        icon="material-symbols:download"
        @click="downLoadMusic()" />

      <LocalhostSong />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MusicPlayer } from '@/hooks/interface';
import { useAudioStore } from '@/stores/useAudioStore';
import { Icon } from '@iconify/vue';
import { inject, onMounted, ref } from 'vue';

const {
  currentSong,
  togglePlayPause,
  isPlaying,
  isLoading,
  playNext,
  playPrevious,
  currentTime,
  duration,
  changeCurrentTime,
  inputCurrentTime,
  setPlayMode,
  downLoadMusic,
  handleLike,
} = inject('MusicPlayer') as MusicPlayer;

const emit = defineEmits(['show']);

onMounted(() => {});

const AudioStore = useAudioStore();

// 格式化时间
function formatTime(seconds: number): string {
  // 将秒数转换为整数分钟数和剩余秒数
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);

  // 返回格式化的字符串，确保分钟和秒数都至少有两位数
  return `${min.toString().padStart(2, '0')}:${sec
    .toString()
    .padStart(2, '0')}`;
}
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
      margin-left: 20px;
      transition: all 0.3s ease; // 添加过渡效果
      &.active {
        color: #c20c0c;
        animation: heartBeat 0.6s cubic-bezier(0.215, 0.61, 0.355, 1); // 添加心跳动画
      }
      &:active {
        transform: scale(0.85); // 点击时缩小效果
      }
    }
    .btn-download {
      color: var(--button-inactive);
      font-size: 30px;
      margin-left: 10px;
    }
  }
}

// 添加心跳动画关键帧
@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
}
</style>
