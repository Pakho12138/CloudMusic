<template>
  <div class="container-wrapper">
    <template v-if="isLoading">
      <el-skeleton class="flex flex-col items-center" :throttle="throttle" animated>
        <template #template>
          <el-skeleton-item variant="rect" class="!h-[150px]" />
          <el-skeleton-item class="!w-1/2 mt-2 mb-1" />
        </template>
      </el-skeleton>

      <el-skeleton :throttle="throttle" animated>
        <template #template>
          <el-skeleton-item class="!w-24 !h-8 mt-6 mb-4" />
        </template>
      </el-skeleton>

      <el-skeleton :throttle="throttle" animated>
        <template #template>
          <el-row :gutter="24">
            <el-col class="pt-2 pb-2" :span="4" v-for="item in 12" :key="item">
              <div>
                <el-skeleton-item class="!w-full !h-auto aspect-[1/1]" />
                <el-skeleton-item />
              </div>
            </el-col>
          </el-row>
        </template>
      </el-skeleton>
    </template>

    <template v-else>
      <el-carousel :interval="4000" type="card" height="150px" trigger="click" indicator-position="outside">
        <el-carousel-item v-for="item in banners" :key="item">
          <el-image style="width: 100%; height: 100%" :src="item.imageUrl" fit="cover" />
        </el-carousel-item>
      </el-carousel>

      <PlayList title="热门推荐" :list="personalized" imgProp="picUrl"></PlayList>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Api } from '@/utils/request';
import { onBeforeMount, onMounted, ref } from 'vue';

const isLoading = ref<boolean>(true);
const throttle = ref({ leading: 500, trailing: 500, initVal: true });

onBeforeMount(() => {
  Promise.all([getBanner(), getPersonalized()]).then(() => {
    isLoading.value = false;
  });
});

onMounted(() => {});

// 获取轮播图
const banners = ref<Array<any>>([]);
const getBanner = async () => {
  const res: any = await Api.get('banner', { type: 0 });
  if (res.code == 200) {
    banners.value = res.banners || [];
  }
  return res;
};

const personalized = ref<Array<any>>([]);
const getPersonalized = async () => {
  const res: any = await Api.get('personalized', { limit: 12 });
  if (res.code == 200) {
    personalized.value = res.result || [];
  }
  return res;
};
</script>

<style lang="scss" scoped>
.el-carousel {
  margin: auto;
  .el-carousel__item {
    border-radius: 10px;
  }
}
</style>
