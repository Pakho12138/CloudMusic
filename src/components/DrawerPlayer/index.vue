<template>
  <el-drawer
    :style="{
      '--track-cover-url': `url(${
        SettingStore.isDrawerCover
          ? currentSong.id
            ? currentSong.cover
            : 'img/bg.jpg'
          : ''
      })`,
    }"
    v-model="drawer"
    :direction="direction"
    style="box-shadow: none"
    size="100%"
    :modal="false"
    :showClose="false"
    class="drawer-bg">
    <template #header>
      <div class="flex items-center justify-between z-10">
        <div class="flex items-center gap-2 w-40">
          <Icon
            class="btn-close can-click size-[40px] text-[--button-inactive]"
            icon="ic:round-keyboard-arrow-down"
            @click="close" />
        </div>

        <div class="flex items-center text-sm text-[--button-inactive]">
          <Icon class="size-5 mr-1" icon="mingcute:time-fill" />
          <span class="text-base font-semibold mt-[-2px]">{{ localeCurrentTime }}</span>
        </div>

        <div class="flex items-center gap-4 w-40 justify-end">
          <div class="flex items-center gap-2 text-xl text-[--button-inactive]">
            <Icon icon="material-symbols:bluetooth" />
            <Icon icon="material-symbols:wifi" />
            <Icon icon="ic:baseline-battery-charging-80" />
          </div>

          <el-avatar
            v-if="userStore.userInfo?.avatarUrl"
            :src="userStore.userInfo.avatarUrl"
            class="mr-2"
            shape="circle"
            :size="40" />
          <div
            v-else
            class="w-10 h-10 flex items-center justify-center rounded-[50%] bg-[--search-bg]">
            <el-icon class="!text-[--inactive-color] !text-xl"
              ><UserFilled
            /></el-icon>
          </div>
        </div>
      </div>
    </template>

    <div class="flex h-full w-full flex-col gap-3 px-6 py-2">
      <div
        class="flex flex-row flex-1 items-center justify-between gap-5 overflow-hidden">
        <div
          class="md:flex-[50%] md:max-w-[50%] flex-1 max-w-full flex items-center justify-center"
          :style="{ transform: `scale(${scaleRatio})` }">
          <div class="items-center justify-center flex flex-col w-full">
            <div
              :class="`music-player-container ${
                !isLoading && isPlaying ? 'is-playing' : ''
              }`">
              <div class="album">
                <div
                  class="album-art rounded-md"
                  :style="{
                    '--track-cover-url': `url(${currentSong.cover})`,
                  }"></div>
                <div
                  class="vinyl"
                  :style="{
                    '--track-cover-url': `url(${currentSong.cover})`,
                    animationPlayState: isPlaying ? 'running' : 'paused',
                  }"></div>
              </div>
            </div>
            <div class="flex flex-col items-center w-96 mt-5">
              <div class="flex gap-2 items-center justify-center">
                <!-- <el-button text circle @click="setPlayMode(PlayMode.Sequence)">
                  <icon-octicon:three-bars-16 />
                </el-button>
                <el-button text circle @click="setPlayMode(PlayMode.Random)">
                  <icon-lets-icons:sort-random />
                </el-button> -->
                <Icon
                  icon="mage:previous-fill"
                  class="can-click text-2xl text-[--button-inactive]"
                  @click="handlePlayPrevious" />
                <div class="relative">
                  <Icon
                    class="text-4xl text-[--button-inactive] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    :class="isLoading ? 'opacity-100' : 'opacity-0'"
                    icon="svg-spinners:90-ring-with-bg" />
                  <Icon
                    class="can-click text-4xl text-[--button-inactive]"
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
                  icon="mage:next-fill"
                  class="can-click text-2xl text-[--button-inactive]"
                  @click="handlePlayNext" />
                <!-- <el-button text circle @click="setPlayMode(PlayMode.Loop)">
                  <icon-cil:loop />
                </el-button>
                <el-button text circle @click="setPlayMode(PlayMode.Single)">
                  <icon-cil:loop-1 />
                </el-button> -->
              </div>
              <div class="flex gap-2 w-full items-center pt-2">
                <span class="text-xs w-10 text-foreground/50">{{
                  formatTime(currentTime)
                }}</span>
                <el-slider
                  :model-value="currentTime"
                  :show-tooltip="false"
                  @change="changeCurrentTime"
                  @input="inputCurrentTime"
                  :max="duration"
                  class="w-full"
                  size="small" />
                <span class="text-xs w-10 text-foreground/50">{{
                  formatTime(duration)
                }}</span>
              </div>
              <div v-if="currentSong?.id" class="flex items-center mt-2">
                <Icon
                  icon="uil:comment-dots"
                  class="can-click text-2xl text-[--button-inactive]"
                  @click="showDrawer" />
                <span
                  class="text-sm ml-1 text-[--button-inactive]"
                  v-if="commenTotal !== 0">
                  {{ formatNumber(commenTotal) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          class="flex-[50%] max-w-[50%] md:flex hidden h-full items-center justify-center"
          style="--scroll-shadow-size: 40px">
          <template v-if="lyricsData.lines.length > 0">
            <div
              class="mask-gradient relative !h-[400px] overflow-y-auto scroll-smooth w-full"
              ref="scrollContainer"
              :style="{ transform: `scale(${scaleRatio})` }"
              @scroll="handleScroll">
              <div class="lyric-placeholder"></div>
              <ul
                class="text-center w-full"
                style="--scroll-shadow-size: 40px; width: calc(100% - 50px)">
                <li
                  v-for="(item, index) in lyricsData.lines"
                  :key="index"
                  :class="[
                    `h-9 flex items-center justify-center text-sm py-1 transition-all duration-300 ease-in-out ${
                      currentLyricIndex === index
                        ? 'activeLyric'
                        : 'inactiveLyric'
                    }`,
                  ]">
                  <p v-if="item.text && SettingStore.isOriginalParsed">
                    {{ item.text }}
                  </p>
                  <p v-if="item.translation && SettingStore.isTranslatedParsed">
                    {{ item.translation }}
                  </p>
                  <p v-if="item.romaLrc && SettingStore.isRomaParsed">
                    {{ item.romaLrc }}
                  </p>
                </li>
              </ul>
              <div class="lyric-placeholder"></div>
            </div>
          </template>
          <template v-else>
            <div
              class="h-full flex items-center justify-center w-full text-[--el-color-primary-light-2] dark:text-gray-500 text-sm"
              v-html="parseLyricInfo(lyricsData.remark ?? '')"
              v-if="SettingStore.isOriginalParsed"></div>
          </template>
        </div>
      </div>
    </div>

    <CommentPopup v-model="commenDrawer" />

    <template #footer>
      <div class="flex justify-end">
        <el-switch
          v-model="themeStore.isDark"
          @change="switchDark"
          active-text="暗黑模式"
          class="ml-2" />
        <el-switch
          v-model="SettingStore.isTranslatedParsed"
          @change="SettingStore.setTranslatedParsed"
          class="ml-2"
          active-text="翻译" />
        <el-switch
          v-model="SettingStore.isRomaParsed"
          @change="SettingStore.setRomaParsed"
          class="ml-2"
          active-text="罗马音" />
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import type { MusicPlayer } from '@/hooks/interface';
import { useTheme } from '@/hooks/useTheme';
import { useSettingStore } from '@/stores/useSettingStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { useUserStore } from '@/stores/useUserStore';
import { formatNumber } from '@/utils/util';
import { Icon } from '@iconify/vue';
import { useDebounceFn, useThrottleFn } from '@vueuse/core';
import { inject, nextTick, onMounted, reactive, ref, toRefs, watch } from 'vue';

const userStore = useUserStore();
const themeStore = useThemeStore();
const SettingStore = useSettingStore();
const { switchDark } = useTheme();
const state = reactive({
  direction: 'btt',
  drawer: false,
  isUserScrolling: false,
});

const { direction, drawer } = toRefs(state);

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
  lyricsData,
  currentLyricIndex,
  setPlayMode,
  scrollToCurrentLyric,
  findCurrentLyricIndex,
  commenDrawer,
  commentListData,
  commenTotal,
  getCommentPlaylist,
  showDrawer,
} = inject('MusicPlayer') as MusicPlayer;

// 定义初始宽度和缩放比例
const initialWidth = ref(0);
const scaleRatio = ref(1);
// 定义 app-main 元素的引用
const appMainRef = ref<HTMLElement | null>(null);

// 处理窗口大小变化
const handleResize = () => {
  if (appMainRef.value) {
    const currentWidth = appMainRef.value.offsetWidth;
    scaleRatio.value = currentWidth / initialWidth.value;
  }
};

onMounted(() => {
  // 获取 app-main 元素
  appMainRef.value = document.querySelector('.app-main') as HTMLElement;
  if (appMainRef.value) {
    // 初始化时记录初始宽度
    initialWidth.value = appMainRef.value.offsetWidth;
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
  }
  // 每秒更新一次本地时间
  setInterval(updateTime, 1000);
});

onUnmounted(() => {
  // 组件卸载时移除监听
  window.removeEventListener('resize', handleResize);
});

const localeCurrentTime = ref(new Date().toLocaleTimeString().slice(0, 5));
function updateTime() {
  localeCurrentTime.value = new Date().toLocaleTimeString().slice(0, 5);
}

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

// 播放上一首歌曲的处理函数
function handlePlayPrevious() {
  playPrevious(); // 播放上一首歌曲
  getCommentPlaylist(); // 获取新的评论列表
}

// 播放下一首歌曲的处理函数
function handlePlayNext() {
  playNext(); // 播放下一首歌曲
  getCommentPlaylist(); // 获取新的评论列表
}

function parseLyricInfo(lyricString: string) {
  return lyricString
    .replace(/\n/g, '<br />') // 将换行符替换为 <br />
    .replace(/^\s*|\s*$/g, ''); // 去除前后空格
}

// 防抖函数，用户滚动歌词时停止歌词滚动，3秒后继续
const scrollContainer = ref();
const debouncedFn = useDebounceFn(() => {
  state.isUserScrolling = false; // 重新设置用户滚动状态
  scrollToCurrentLyric(scrollContainer.value); // 恢复歌词滚动
}, 3000); // 防抖延时：3000毫秒

// 处理滚动事件，触发防抖函数
let stopHandleScroll = false;
const handleScroll = useThrottleFn((e: any) => {
  if (!stopHandleScroll) {
    state.isUserScrolling = true; // 标记用户正在滚动
    debouncedFn(); // 调用防抖函数
  }

  handleScrollEnd();
}, 300);

// 滚动结束的处理函数，使用防抖函数，延迟500毫秒后执行
const handleScrollEnd = useDebounceFn(() => {
  stopHandleScroll = false;
}, 500);

const show = () => {
  drawer.value = true;
};

const close = () => {
  drawer.value = false;
};

watch(
  () => currentTime.value,
  (newTime, lastTime) => {
    // 仅在 currentTime 有效且用户未滚动时滚动歌词
    if (newTime && !state.isUserScrolling) {
      stopHandleScroll = true;
      findCurrentLyricIndex(newTime);
      nextTick().then(() => {
        scrollToCurrentLyric(scrollContainer.value); // 滚动到当前歌词
      });
    }
  }
);

defineExpose({
  show,
});
</script>

<style lang="scss" scoped>
.music-player-container {
  display: inline-block;
  height: 300px;
  min-width: 300px;
}

.mask-gradient {
  mask-image: linear-gradient(
    #000,
    #000,
    transparent 0,
    #000 var(--scroll-shadow-size),
    #000 calc(100% - var(--scroll-shadow-size)),
    transparent
  );
  &::-webkit-scrollbar {
    display: none;
  }
}

.album {
  box-shadow: 3px 3px 15px rgba(0, 0, 0, 0.65);
  height: 100%;
  position: relative;
  width: 100%;
  z-index: 10;
  border-radius: 8px;
}

// .album
.album-art {
  background: #fff var(--track-cover) center / cover no-repeat;
  height: 300px;
  position: relative;
  width: 300px;
  z-index: 10;
  --track-cover: var(--track-cover-url, none);
}

.vinyl {
  animation: spin 2s linear infinite;
  transition: all 500ms;
  background-image: url('img/vinyl.png'), var(--track-cover);
  background-position: center, center;
  background-size: cover, 40% auto;
  background-repeat: no-repeat;
  border-radius: 100%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  height: 94%;
  width: auto;
  aspect-ratio: 1 / 1;
  position: absolute;
  left: 5%;
  top: 50%;
  translate: 0 -50%;
  z-index: 5;
  will-change: transform, left;
  --track-cover: var(--track-cover-url, none);

  .is-playing & {
    left: 52%;
  }
}

.lyric-placeholder {
  height: calc(50% - 16px);
}

.activeLyric {
  @apply text-[--theme-color]; // 应用自定义颜色
  @apply text-base;
}

.inactiveLyric {
  @apply text-gray-500 dark:text-gray-400; // 应用灰色文本
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.loading {
  display: flex;
  transform: rotate(180deg);
}

.load {
  width: 2px;
  height: 33px;
  background-color: limegreen;
  animation: 1s move6 infinite;
  border-radius: 5px;
  margin: 0.1em;
}

.load:nth-child(1) {
  animation-delay: 0.2s;
}

.load:nth-child(2) {
  animation-delay: 0.4s;
}

.load:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes move6 {
  0% {
    height: 0.2em;
  }

  25% {
    height: 0.7em;
  }

  50% {
    height: 1.5em;
  }

  100% {
    height: 0.2em;
  }
}
</style>
