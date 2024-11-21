<template>
  <el-drawer
    :style="{
      '--track-cover-url': `url(${SettingStore.isDrawerCover ? (currentSong.id ? currentSong.cover : 'img/bg.jpg') : ''})`,
    }"
    v-model="drawer"
    :direction="direction"
    style="box-shadow: none"
    size="100%"
    :modal="false"
    :showClose="false"
    class="drawer-bg">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-center gap-2">
          <Icon class="btn-close can-click size-[40px] text-[--button-inactive]" icon="ic:round-keyboard-arrow-down" @click="close" />
        </div>

        <div class="flex items-center text-sm text-[--button-inactive]">
          <Icon class="size-4 mr-0.5" icon="mingcute:time-fill" />
          <span class="font-semibold">{{ localeCurrentTime }}</span>
        </div>

        <div class="flex items-center gap-2">
          <el-avatar :src="userStore.userInfo.avatarUrl" class="mr-2" shape="circle" :size="32" />
        </div>
      </div>
    </template>

    <div class="flex h-full w-full flex-col gap-3 px-6 py-2">
      <div class="flex flex-row flex-1 items-center justify-between">
        <div class="md:flex-[50%] md:max-w-[50%] flex-1 max-w-full flex h-full items-center justify-center">
          <div class="items-center justify-center flex flex-col h-full w-full">
            <div :class="`music-player-container ${isPlaying ? 'is-playing' : ''}`">
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
                <Icon icon="mage:previous-fill" class="can-click text-2xl text-[--button-inactive]" @click="handlePlayPrevious" />
                <Icon
                  class="can-click text-5xl text-[--button-inactive]"
                  :icon="isPlaying ? 'material-symbols:pause-circle-rounded' : 'material-symbols:play-circle-rounded'"
                  @click="togglePlayPause" />
                <Icon icon="mage:next-fill" class="can-click text-2xl text-[--button-inactive]" @click="handlePlayNext" />
                <!-- <el-button text circle @click="setPlayMode(PlayMode.Loop)">
                  <icon-cil:loop />
                </el-button>
                <el-button text circle @click="setPlayMode(PlayMode.Single)">
                  <icon-cil:loop-1 />
                </el-button> -->
              </div>
              <div class="flex gap-2 w-full items-center pt-2">
                <span class="text-xs w-10 text-foreground/50">{{ formatTime(currentTime) }}</span>
                <el-slider v-model="currentTime" :show-tooltip="false" @change="changeCurrentTime" :max="duration" class="w-full" size="small" />
                <span class="text-xs w-10 text-foreground/50">{{ formatTime(duration) }}</span>
              </div>
              <div v-if="currentSong?.id" class="flex items-center mt-2">
                <Icon icon="uil:comment-dots" class="can-click text-2xl text-[--button-inactive]" @click="showDrawer" />
                <span class="text-sm ml-1 text-[--button-inactive]" v-if="commenTotal !== 0">
                  {{ formatNumber(commenTotal) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex-[50%] max-w-[50%] md:flex hidden h-full items-center justify-center" style="--scroll-shadow-size: 40px">
          <template v-if="lyricsData.lines.length > 0">
            <div class="mask-gradient !h-[600px] overflow-y-auto scroll-smooth w-full" ref="scrollContainer" @scroll="handleScroll">
              <ul class="text-center h-full w-full" style="--scroll-shadow-size: 40px; width: calc(100% - 50px)">
                <li
                  v-for="(item, index) in lyricsData.lines"
                  :key="index"
                  :class="[`text-sm py-1 transition-all duration-300 ease-in-out ${currentLyricIndex === index ? 'activeLyric' : 'inactiveLyric'}`]">
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

    <!-- <CommentPopup
      v-model="commenDrawer"
      :data="commentListData"
      @DIntersect="getCommentPlaylist"
    /> -->

    <template #footer>
      <div class="flex justify-end">
        <el-switch v-model="themeStore.isDark" @change="switchDark" active-text="暗黑模式" class="ml-2" />
        <el-switch v-model="SettingStore.isTranslatedParsed" @change="SettingStore.setTranslatedParsed" class="ml-2" active-text="翻译" />
        <el-switch v-model="SettingStore.isRomaParsed" @change="SettingStore.setRomaParsed" class="ml-2" active-text="罗马音" />
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
import { Api } from '@/utils/request';
import { calculatePagination, formatNumber } from '@/utils/util';
import { Icon } from '@iconify/vue';
import { useDebounceFn } from '@vueuse/core';
import { inject, onMounted, reactive, ref, toRefs } from 'vue';

const userStore = useUserStore();
const themeStore = useThemeStore();
const SettingStore = useSettingStore();
const { switchDark } = useTheme();
const state = reactive({
  direction: 'btt',
  drawer: false,
  commentListData: [] as Comment[],
  commenDrawer: false,
  commenTotal: 0,
  isUserScrolling: false,
});

const { direction, drawer, commentListData, commenDrawer, commenTotal } = toRefs(state);

const { currentSong, togglePlayPause, isPlaying, playNext, playPrevious, currentTime, duration, changeCurrentTime, Loadlyrics, lyricsData, currentLyricIndex, setPlayMode, scrollToCurrentLyric } =
  inject('MusicPlayer') as MusicPlayer;

onMounted(() => {
  setInterval(updateTime, 1000); // 每秒更新一次本地时间
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
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// 获取评论列表的函数，默认请求第一页，如果已有评论则不再请求
const getCommentPlaylist = async (pages: number = 1) => {
  if (!currentSong.value?.id || state.commentListData.length > 0) return; // 如果已有评论数据，则不再请求

  // 请求评论数据，并合并到现有评论列表中
  const res: any = await Api.get('comment/music', { id: currentSong.value.id, ...calculatePagination({ offset: pages }) });
  state.commentListData = state.commentListData.concat(res.comments); // 更新评论列表
  state.commenTotal = res.total; // 更新评论总数
};

// 播放上一首歌曲的处理函数
function handlePlayPrevious() {
  state.commentListData = []; // 清空评论列表
  state.commenTotal = 0; // 重置评论总数
  playPrevious(); // 播放上一首歌曲
  getCommentPlaylist(1); // 获取新的评论列表
}

// 播放下一首歌曲的处理函数
function handlePlayNext() {
  state.commentListData = []; // 清空评论列表
  state.commenTotal = 0; // 重置评论总数
  playNext(); // 播放下一首歌曲
  getCommentPlaylist(1); // 获取新的评论列表
}

function parseLyricInfo(lyricString: string) {
  return lyricString
    .replace(/\n/g, '<br />') // 将换行符替换为 <br />
    .replace(/^\s*|\s*$/g, ''); // 去除前后空格
}

// 打开评论抽屉并加载相应的评论数据
const showDrawer = async () => {
  state.commenDrawer = true; // 打开评论抽屉
  if (state.commentListData.length > 0) return; // 如果已有评论数据，则不再请求

  // 请求评论数据，并更新评论列表和评论总数
  const res: any = await Api.get('comment/music', { id: currentSong.value.id, ...calculatePagination({ offset: 1 }) });
  state.commentListData = res.comments; // 更新评论列表
  state.commenTotal = res.total; // 更新评论总数
};

// 防抖函数，用户滚动歌词时停止歌词滚动，3秒后继续
const scrollContainer = ref();
const debouncedFn = useDebounceFn(() => {
  state.isUserScrolling = false; // 重新设置用户滚动状态
  scrollToCurrentLyric(scrollContainer.value); // 恢复歌词滚动
}, 3000); // 防抖延时：3000毫秒

// 处理滚动事件，触发防抖函数
function handleScroll() {
  state.isUserScrolling = true; // 标记用户正在滚动
  debouncedFn(); // 调用防抖函数
}

const show = () => {
  drawer.value = true;
  Loadlyrics();
  getCommentPlaylist();
};

const close = () => {
  drawer.value = false;
};

defineExpose({
  show,
});
</script>

<style lang="scss" scoped>
.music-player-container {
  display: inline-block;
  height: 315px;
  min-width: 325px;
}

.mask-gradient {
  mask-image: linear-gradient(#000, #000, transparent 0, #000 var(--scroll-shadow-size), #000 calc(100% - var(--scroll-shadow-size)), transparent);
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
  height: 315px;
  position: relative;
  width: 325px;
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
  height: 300px;
  left: 5%;
  position: absolute;
  top: 8px;
  width: 300px;
  z-index: 5;
  will-change: transform, left;
  --track-cover: var(--track-cover-url, none);

  .is-playing & {
    left: 52%;
  }
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
