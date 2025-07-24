<template>
  <div class="container-wrapper">
    <el-skeleton :loading="isLoading" animated>
      <template #template>
        <div class="flex gap-4 p-4 pb-8">
          <el-skeleton-item
            variant="image"
            class="!w-[200px] !h-[200px] !rounded-lg" />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <el-skeleton-item variant="text" class="!w-[30px] !h-[18px]" />
              <el-skeleton-item variant="text" class="!w-[200px] !h-[28px]" />
            </div>
            <div
              class="flex flex-col justify-between text-sm text-[var(--button-inactive)] gap-1 mt-2">
              <div class="flex items-center gap-3">
                <el-skeleton-item
                  variant="text"
                  class="!w-[30px] !h-[30px] !rounded-full" />
                <div class="flex items-center">
                  <el-skeleton-item
                    variant="text"
                    class="!w-[100px] !h-[20px]" />
                  <el-skeleton-item
                    variant="text"
                    class="!w-[120px] !h-[20px] ml-3" />
                </div>
              </div>
              <el-skeleton-item
                variant="button"
                class="text-sm !w-[104px] !h-[32px] !rounded-3xl my-2" />
              <el-skeleton-item variant="text" class="!w-[200px] !h-[20px]" />
              <div class="flex gap-4">
                <el-skeleton-item
                  variant="text"
                  class="!w-[80px] !h-[20px] mt-1" />
                <el-skeleton-item
                  variant="text"
                  class="!w-[80px] !h-[20px] mt-1" />
              </div>
              <el-skeleton-item variant="text" class="!w-full !h-[20px] mt-1" />
            </div>
          </div>
        </div>
      </template>

      <div class="flex gap-4 p-4">
        <el-image
          class="w-[200px] h-[200px] rounded-lg"
          :src="detail.coverImgUrl"
          fit="cover" />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span
              class="text-xs py-[2px] px-[4px] text-[var(--button-inactive)] border border-solid border-[var(--button-inactive)] rounded"
              >歌单</span
            >
            <h2 class="text-[27px] leading-[1.5] font-bold">
              {{ detail.name || '未知歌单' }}
            </h2>
          </div>
          <div
            class="flex flex-col justify-between text-sm text-[var(--button-inactive)] gap-1">
            <div class="flex items-center gap-3">
              <el-image
                class="w-[30px] h-[30px] rounded-full"
                :src="detail.creator?.avatarUrl"
                fit="cover" />
              <div>
                <span class="can-click text-base text-[var(--theme-color)]">{{
                  detail.creator?.nickname || '未知用户'
                }}</span>
                <span class="ml-3"
                  >{{ formattedDate(detail.createTime) }}创建</span
                >
              </div>
            </div>
            <el-button
              class="text-sm w-[104px] my-2 flex items-center justify-center"
              type="primary"
              round>
              <Icon class="text-[19px] mr-[2px]" icon="ion:play" />
              <span>播放全部</span>
            </el-button>
            <div>
              标签：<span class="text-[var(--theme-color)]">{{ detail.tags?.length ? detail.tags?.join('、') : '暂无' }}</span>
            </div>
            <div class="flex gap-4">
              <div>歌曲：<span class="text-[var(--theme-color)]">{{ detail.trackCount || 0 }}首</span></div>
              <div>播放：<span class="text-[var(--theme-color)]">{{ detail.playCount || 0 }}次</span></div>
            </div>
            <div>
              <div class="leading-5" :class="{ 'line-clamp-1': !isExpanded }">
                简介：{{ detail.description || '暂无' }}
              </div>
              <!-- 用于判断是否需要展开按钮 -->
              <div
                ref="descriptionRef"
                class="leading-5 absolute opacity-0 pointer-events-none">
                简介：{{ detail.description || '暂无' }}
              </div>
              <el-button
                :class="showExpandButton ? 'visible' : 'invisible'"
                class="float-right"
                type="primary"
                link
                @click="isExpanded = !isExpanded"
                ><b>{{ isExpanded ? '收起' : '展开' }}</b></el-button
              >
            </div>
          </div>
        </div>
      </div>
    </el-skeleton>
    <MusicList ref="musicListRef" type="playlist" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MusicList from '@/components/MusicList.vue';
import { ElNotification } from 'element-plus';
import { Icon } from '@iconify/vue';

const musicListRef = ref();

onMounted(async () => {
  await getPlaylistDetail();
  await musicListRef.value.getData();
  isLoading.value = false;
});

const route = useRoute();
const detail: any = ref({});
const isLoading = ref(true);
const getPlaylistDetail = async () => {
  const res: any = await Api.get('playlist/detail', {
    id: route.query.id,
  });

  if (res.code == 200) {
    detail.value = res.playlist || {};
    nextTick(() => {
      checkDescriptionHeight();
    });
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

const isExpanded = ref(false);
const descriptionRef = ref();
const showExpandButton = ref(false);
const checkDescriptionHeight = () => {
  if (descriptionRef.value) {
    const element = descriptionRef.value;
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
    const clientHeight = element.clientHeight;
    // 若内容高度超过一行高度，则显示展开按钮
    showExpandButton.value = clientHeight > lineHeight;
  }
};
</script>

<style lang="scss" scoped></style>
