<template>
  <div
    class="container-wrapper w-full grid grid-rows-[auto_1fr_auto] gap-6 !px-4 pb-10">
    <main class="grid md:grid-cols-6 gap-10 items-start p-4 md:px-6">
      <div class="col-span-4 grid gap-6">
        <div class="grid gap-4">
          <div
            ref="observedElement"
            class="relative rounded-xl overflow-hidden aspect-video bg-[var(--content-bg)] border-[var(--theme-bg-color)]">
            <!-- <videoPlay
              width="100%"
              height="100%"
              :title="mvDetails.name"
              :src="mvUrls"
              :poster="mvDetails.cover"
              type="video/mp4" /> -->
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
            {{ mvCommentsList?.total || 0 }} Comments
          </h2>
          <div class="grid gap-6">
            <div
              class="text-sm flex items-start gap-4"
              v-for="item in mvCommentsList?.comments || []"
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
  </div>
</template>

<script setup lang="ts">
import Player, { Events } from 'xgplayer';
import 'xgplayer/dist/index.min.css';
import { Icon } from '@iconify/vue';
import {
  MVDetail,
  CommentResponse,
  SimilarPlaylistsResponse,
  SimilarPlaylistsPlaylist,
  CommentMVParams,
} from './interface';
import { useIntersectionObserver, useThrottleFn } from '@vueuse/core';

const route = useRoute();

const state = reactive({
  mvUrls: '',
  mvDetails: {} as MVDetail,
  mvCommentsList: {} as CommentResponse,
  mvs: [] as SimilarPlaylistsPlaylist[],
});

const { mvUrls, mvDetails, mvCommentsList, mvs } = toRefs(state);

// function handleIntersect(PageNum: number) {
//   commentMV<CommentResponse>({
//     offset: PageNum,
//     id: route.query.id as string,
//   }).then(({ comments }) => {
//     state.mvCommentsList.comments =
//       state.mvCommentsList.comments.concat(comments);
//   });
// }

let player: any;
onMounted(() => {
  similarPlaylists();
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

const commentMV = async (params: CommentMVParams) => {
  const res: any = await Api.get('/comment/mv', {
    id: params.id,
    ...calculatePagination({ limit: 30, offset: 1 }),
  });
  if (res.code == 200) {
    state.mvCommentsList = res;
  }
  return res;
};

// const observedElement = ref([]);
// // 元素是否进入视口
// useIntersectionObserver(
//   observedElement,
//   useThrottleFn(([entry], observerElement) => {
//     if (player) {
//       // 获取pip插件实例
//       const pipInstance = player.plugins.pip;
//       const targetIsVisible = entry?.isIntersecting || false;
//       console.log(targetIsVisible);

//       if (targetIsVisible) {
//         pipInstance.exitPIP();
//       } else {
//         pipInstance.isPIPAvailable() && pipInstance.requestPIP();
//       }
//     }
//   }, 300)
// );

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
    download: true, // 是否启用下载按钮
    lang: 'zh-cn', // 语言
    pip: true, // 是否使用画中画插件
  };
  player = new Player(playerOpts);
};

watch(
  () => route.query.id,
  id => {
    if (typeof id == 'string') {
      commentMV({ id });
      Promise.all([mvUrl(id), mvDetail(id)]).then(() => {
        initPlayer(state.mvUrls);
      });
    }
  },
  { immediate: true }
);
</script>
