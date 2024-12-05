<template>
  <div
    v-infinite-scroll="loadMore"
    ref="videoMainRef"
    class="container-wrapper w-full grid grid-rows-[auto_1fr_auto] gap-6 !px-4 pb-10">
    <main class="grid md:grid-cols-6 gap-10 items-start p-4 md:px-6">
      <div class="col-span-4 grid gap-6">
        <div class="grid gap-4">
          <div
            ref="observedElement"
            class="relative rounded-xl overflow-hidden aspect-video bg-[var(--content-bg)] border-[var(--theme-bg-color)]">
            <div id="xgplayer"></div>
          </div>
          <div class="py-2 grid gap-4">
            <h1 class="text-2xl font-semibold line-clamp-2">
              {{ mvDetails.name }}
            </h1>
            <div class="flex items-center justify-between">
              <div class="flex gap-3 items-center">
                <img
                  v-if="mvDetails.artists && mvDetails.artists.length > 0"
                  alt="Thumbnail"
                  class="rounded-full object-cover aspect-square border w-10 h-10"
                  :src="mvDetails.cover + '?param=90y90'" />
                <div class="text-base">
                  <div
                    class="font-semibold"
                    v-if="mvDetails.artists && mvDetails.artists.length > 0">
                    {{ mvDetails.artists.map(item => item.name).join() }}
                  </div>
                  <div class="text-gray-500 dark:text-gray-400 flex gap-2">
                    <!-- 70K subscribers -->
                    <span
                      class="bg-[var(--content-bg)] text-white px-2 py-1 rounded-md text-xs"
                      v-for="item in mvDetails.videoGroup"
                      >{{ item.name }}</span
                    >
                  </div>
                </div>
              </div>
              <!-- 关注 -->
              <!-- <div class="flex items-center gap-3">
                <el-button type="primary">
                  <div class="flex gap-1 items-center">
                    <icon-ic:baseline-favorite-border class="text" />
                    <span>Subscribe</span>
                  </div>
                </el-button>
              </div> -->
            </div>
          </div>
          <div class="grid gap-4 text-sm leading-relaxed">
            <p>
              {{ mvDetails.desc }}
            </p>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            Video created on {{ mvDetails.publishTime }} •
            {{ mvDetails.playCount }} views • {{ mvDetails.subCount }} likes
          </div>
        </div>
        <div class="grid gap-8">
          <h2 class="font-semibold text-xl">
            {{ mvCommentsCount || 0 }} Comments
          </h2>
          <div class="grid gap-6">
            <div
              class="text-sm flex items-start gap-4"
              v-for="item in mvCommentsList || []"
              :key="item.id">
              <span
                class="relative flex shrink-0 overflow-hidden rounded-full w-10 h-10 border">
                <el-avatar
                  :src="item.user.avatarUrl + '?param=60y60'"
                  :alt="item.user.nickname" />
              </span>
              <div class="grid gap-2">
                <div class="flex items-center gap-2">
                  <div class="font-semibold">@{{ item.user.nickname }}</div>
                  <div class="text-gray-500 text-xs dark:text-gray-400">
                    {{ item.timeStr }}
                  </div>
                  {{ item.ipLocation.location }}
                </div>
                <div>
                  {{ item.content }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-2 grid gap-6">
        <div class="flex items-start gap-4 relative group" v-for="item in mvs">
          <a class="absolute inset-0 z-10" href="#">
            <span class="sr-only">View</span>
          </a>
          <img
            alt="Thumbnail"
            class="aspect-video rounded-lg object-cover w-28 h-16"
            :src="item.cover" />
          <div class="text-sm">
            <div class="font-medium line-clamp-2">
              {{ item.name }}
            </div>
            <div class="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">
              {{ item.artistName }}
            </div>
            <div
              class="text-xs text-gray-500 line-clamp-1 dark:text-gray-400 flex gap-1 items-center">
              <Icon
                icon="material-symbols:android-now-playing-outline"
                class="text-base" />
              {{ item.playCount }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <Icon
      v-if="!isLoading && hasMore"
      class="text-4xl text-[--button-inactive] mx-auto"
      icon="svg-spinners:90-ring-with-bg" />
  </div>
</template>

<script setup lang="ts">
import Player, { Events } from 'xgplayer';
import 'xgplayer/dist/index.min.css';
import { Icon } from '@iconify/vue';
import { MVDetail, SimilarPlaylistsPlaylist } from './interface';
import { useDebounceFn, useIntersectionObserver } from '@vueuse/core';
import { MusicPlayer } from '@/hooks/interface';

const musicPlayer = inject('MusicPlayer') as MusicPlayer;

const route = useRoute();
const state = reactive({
  mvUrls: '',
  mvDetails: {} as MVDetail,
  mvCommentsList: [] as any,
  mvCommentsCount: 0,
  mvs: [] as SimilarPlaylistsPlaylist[],
});

const { mvDetails, mvCommentsList, mvCommentsCount, mvs } =
  toRefs(state);

let player: any;
const videoMainRef = ref();
const observedElement = ref([]);
onMounted(() => {
  similarPlaylists();
  // 元素是否进入视口
  useIntersectionObserver(
    observedElement,
    useDebounceFn(([entry], observerElement) => {
      if (player) {
        // 获取画中画插件实例
        const pipInstance = player.plugins.pip;
        // 获取小屏插件实例
        const miniInstance = player.plugins.miniscreen;
        const targetIsVisible = entry?.isIntersecting || false;
        if (targetIsVisible) {
          miniInstance.exitMini();
          // pipInstance.exitPIP();
        } else {
          isPlaying.value && !pipInstance.isPip && miniInstance.getMini();
          // pipInstance.isPIPAvailable() && pipInstance.requestPIP();
        }
      }
    }, 300),
    // {
    //   root: videoMainRef.value,
    //   threshold: 0,
    //   rootMargin: '60px 0px 0px 0px',
    // }
  );
});
onUnmounted(() => {
  player && player.destroy();
});

const similarPlaylists = async () => {
  const res: any = await Api.get('/simi/mv', { mvid: route.query.id });
  if (res.code == 200) {
    state.mvs = res.mvs || [];
  }
};

const mvUrl = async (id: string) => {
  const res: any = await Api.get('/mv/url', { id });
  if (res.code == 200) {
    state.mvUrls = res.data.url;
  }
  return res;
};

const mvDetail = async (id: string) => {
  const res: any = await Api.get('/mv/detail', { mvid: id });
  if (res.code == 200) {
    state.mvDetails = res.data;
  }
  return res;
};

let pages = 1;
const commentMV = async (isLoadMore: boolean = false) => {
  try {
    if (isLoadMore) {
      pages++; // 如果是加载更多，则增加页码
    } else {
      pages = 1; // 否则，重置页码
      state.mvCommentsList = []; // 清空列表
      state.mvCommentsCount = 0; // 清空评论数量
    }

    const res: any = await Api.get('/comment/mv', {
      id: route.query.id,
      ...calculatePagination({ limit: 30, offset: pages }),
    });
    if (res.code == 200) {
      state.mvCommentsCount = res?.total || 0;
      state.mvCommentsList = [
        ...state.mvCommentsList,
        ...(res?.comments || []),
      ];
      hasMore.value = res.more || false;
    }
    return res;
  } catch (error) {
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const hasMore = ref(true);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const loadMore = async () => {
  if (!isLoading.value && !isLoadingMore.value && hasMore.value) {
    isLoadingMore.value = true;
    await commentMV(true);
    isLoadingMore.value = false;
  }
};

const isPlaying = ref(false);
const initPlayer = url => {
  const playerOpts = {
    id: 'xgplayer',
    url: url,
    // width: '100%',
    // height: '100%',
    fluid: true,
    autoplay: true,
    poster: state.mvDetails.cover, // 封面图地址
    miniprogress: true, // 是否启用mini进度条
    lang: 'zh-cn', // 语言
    pip: {
      // 是否使用浏览器画中画插件
      showIcon: true,
      index: 1,
    },
    miniscreen: {
      // 小屏幕插件配置
      disable: false, // 是否禁用小屏幕插件
      isShowIcon: false, // 是否显示小屏幕按钮
      disableDrag: true, // 是否禁用拖拽
    },
    download: true, // 是否显示下载按钮
    playbackRate: {
      // 倍速按钮
      list: [
        {
          text: '0.5X',
          rate: 0.5,
        },
        {
          text: '0.75X',
          rate: 0.75,
        },
        {
          text: '1X',
          iconText: '倍速',
          rate: 1,
        },
        {
          text: '1.25X',
          rate: 1.25,
        },
        {
          text: '1.5X',
          rate: 1.5,
        },
        {
          text: '2X',
          rate: 2,
        },
      ],
    },
  };
  player = new Player(playerOpts);

  player.on(Events.PLAY, () => {
    musicPlayer.isPlaying && musicPlayer.pause();
    isPlaying.value = true;
  });

  player.on(Events.PAUSE, () => {
    isPlaying.value = false;
  });
};

watch(
  () => route.query.id,
  id => {
    if (typeof id == 'string') {
      commentMV();
      Promise.all([mvUrl(id), mvDetail(id)]).then(() => {
        initPlayer(state.mvUrls);
      });
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
:deep(.xgplayer-mini) {
  inset: auto 10px 10px auto !important;
  border-radius: 10px;
  .xg-mini-layer {
    cursor: default;
    .mini-cancel-btn {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
