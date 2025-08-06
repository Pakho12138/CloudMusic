<template>
  <div class="container-wrapper">
    <div
      class="h-[420px] overflow-hidden flex relative bg-[--theme-bg-color] mt-4 rounded-lg">
      <div
        class="w-2/5 h-auto flex flex-col justify-center items-center text-center pt-8 pb-4">
        <h2 class="text-4xl mb-4 font-bold leading-tight pl-0">官方榜单</h2>
        <p class="text-lg mb-4 font-normal leading-tight text-gray-400 pl-0">
          Official Ranking List
        </p>
      </div>
      <CardSwap
        :card-distance="50"
        :vertical-distance="30"
        :width="580"
        :height="330"
        :delay="5000"
        :skew-amount="6"
        easing="elastic"
        :pause-on-hover="true"
        :cardCount="4">
        <template
          v-for="(item, idx) in officialToplist"
          :key="item.id"
          #[`card-${idx}`]>
          <div class="border-b border-[--border-color]">
            <div class="px-4 py-2 flex items-center gap-1">
              <Icon
                class="opacity-50"
                icon="icon-park-outline:ranking"
                width="18px"
                height="18px" />
              <b>{{ item.name }}</b>
            </div>
          </div>

          <div class="h-full flex gap-4 p-8">
            <el-image
              class="can-click w-40 h-40 rounded-xl aspect-square"
              :src="item.coverImgUrl"
              fit="cover"
              @click="router.push(`/playlistDetail?id=${item.id}`)" />
            <div class="flex flex-col gap-2 flex-1 overflow-hidden">
              <div
                class="flex items-center text-sm can-click"
                v-for="(cItem, cIdx) in item.trackList"
                :key="cItem"
                @dblclick="playSong(cItem)">
                <span class="px-4 text-[--inactive-color]">{{ cIdx + 1 }}</span>
                <div class="flex items-center gap-2 text-[--secondary-color]">
                  <span class="text-[--theme-color] whitespace-nowrap">{{
                    cItem.name
                  }}</span>
                  <span> - </span>
                  <span class="single-line">
                    {{ cItem.ar?.map(ar => ar.name)?.join(' / ') }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </template>
      </CardSwap>
    </div>

    <PlayList
      title="全球榜单"
      :list="toplist.slice(4)"
      imgProp="coverImgUrl"></PlayList>
  </div>
</template>

<script setup lang="ts">
import { MusicPlayer, Song, Track } from '@/hooks/interface';
import router from '@/router';
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';

const { playSong } = inject('MusicPlayer') as MusicPlayer;

const officialToplist = ref<Array<any>>([]);
const toplist = ref<Array<any>>([]);
const getToplist = async () => {
  const res: any = await Api.get('/toplist');
  if (res.code == 200) {
    toplist.value = res.list || [];
    officialToplist.value = res.list?.slice(0, 4) || [];

    officialToplist.value.forEach((item: any) => {
      getPlaylistDetail(item);
    });
  }
};

const getPlaylistDetail = async (item: any) => {
  const res: any = await Api.get('playlist/detail', {
    id: item.id,
  });
  if (res.code == 200) {
    item.trackList = res.playlist.tracks?.slice(0, 6) || [];
  }
};

onMounted(() => {
  getToplist();
});
</script>

<style lang="scss" scoped></style>
