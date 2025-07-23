<template>
  <div class="container-wrapper">
    <div class="flex gap-4 p-4 mb-4">
      <el-image
        class="w-[150px] h-[150px] rounded-lg"
        :src="detail.coverImgUrl"
        fit="cover" />
      <div class="flex-1">
        <h2 class="text-2xl font-bold">{{ detail.name }}</h2>
        <p class="text-[14px] text-[#666]">
          {{ detail.description }}
        </p>
        <div
          class="flex flex-col justify-between text-sm text-[var(--button-inactive)] mt-2">
          <div class="flex items-center gap-2">
            <el-image
              class="w-[30px] h-[30px] rounded-full"
              :src="detail.creator?.avatarUrl"
              fit="cover" />
            <span>{{ detail.creator?.nickname }}</span>
            <span>{{ formattedDate(detail.createTime) }}</span>
          </div>
          <span>收藏: {{ detail.subscribedCount }}</span>
          <span>播放: {{ detail.playCount }}</span>
        </div>
      </div>
    </div>
    <MusicList ref="musicListRef" type="playlist" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MusicList from '@/components/MusicList.vue';
import { ElNotification } from 'element-plus';

const musicListRef = ref();

onMounted(async () => {
  await getPlaylistDetail();
  musicListRef.value.getData();
});

const route = useRoute();
const detail: any = ref({});
const getPlaylistDetail = async () => {
  const res: any = await Api.get('playlist/detail', {
    id: route.query.id,
  });

  if (res.code == 200) {
    detail.value = res.playlist || {};
  } else {
    ElNotification({
      title: '错误',
      message: '加载失败',
      type: 'error',
    });
  }
};

const formattedDate = computed(
  () => timestamp => formatTimestampToDate(timestamp, 'YYYY-MM-DD')
);
</script>

<style lang="scss" scoped></style>
