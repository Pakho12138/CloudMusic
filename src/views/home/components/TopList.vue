<template>
  <div class="container-wrapper">
    <div
      class="h-[500px] overflow-hidden flex relative bg-[--theme-bg-color] mt-4 rounded-lg">
      <div
        class="w-1/2 h-auto flex flex-col justify-center items-center text-center pt-8 pb-4">
        <h2
          class="text-4xl mb-4 font-bold leading-tight pl-0">
          官方榜单
        </h2>
        <p
          class="text-lg mb-4 font-normal leading-tight text-gray-400 pl-0">
          Official Ranking List
        </p>
      </div>
      <CardSwap
        :card-distance="60"
        :vertical-distance="70"
        :delay="5000"
        :skew-amount="6"
        easing="elastic"
        :pause-on-hover="true"
        @card-click="handleCardClick">
        <template
          v-for="(item, idx) in officialToplist"
          :key="item.id"
          #[`card-${idx}`]>
          <div
            class="border-b border-white bg-gradient-to-t from-[#222] to-[#0b0b0b]">
            <div class="m-2 flex items-center">
              <i class="pi pi-circle-fill mr-2"></i>
              <span>{{ item.name }}</span>
            </div>
          </div>

          <div class="h-full flex gap-4 p-8">
            <el-image
              class="can-click w-44 h-44 rounded-xl aspect-square"
              :src="item.coverImgUrl"
              fit="cover" />
            <div>
              <div v-for="(cItem, cIdx) in item.trackList" :key="cItem">
                <span class="px-4">{{ cIdx + 1 }}</span
                >{{ cItem.name }}
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
import { onMounted, ref } from 'vue';

const handleCardClick = (index: number) => {
  console.log(`Card ${index} clicked`);
};

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
    item.trackList = res.playlist.tracks?.slice(0, 7) || [];
  }
};

onMounted(() => {
  getToplist();
});
</script>

<style lang="scss" scoped></style>
