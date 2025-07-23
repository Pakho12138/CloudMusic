<template>
  <div class="container-wrapper">
    <div>
      <div class="text-2xl font-semibold mt-6 mb-4 text-[--theme-color]">
        我的歌单
      </div>
      <el-row :gutter="24">
        <el-col
          class="pt-2 pb-2"
          :span="4"
          v-for="item in playlist"
          :key="item.id"
          @click="router.push(`/playlistDetail?id=${item.id}`)">
          <div>
            <el-image
              class="can-click w-full h-full rounded-xl"
              style="width: 100%; height: 100%"
              :src="item.coverImgUrl"
              fit="cover" />
            <div class="can-click line-clamp-2 text-[--theme-color]">
              {{ item.name }}
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { useUserStore } from '@/stores/useUserStore';
import { onMounted, ref } from 'vue';

onMounted(() => {
  getPlaylist();
});

const userStore = useUserStore();
const playlist: any = ref([]);
const hasMore = ref(true);
const getPlaylist = async () => {
  const res: any = await Api.get('user/playlist', {
    uid: userStore.userInfo.userId,
  });
  if (res.code == 200) {
    const list = res.playlist || [];
    list[0].name = '我喜欢的音乐';
    playlist.value = list;
    hasMore.value = res.more || false;
  }
};
</script>

<style lang="scss" scoped></style>
