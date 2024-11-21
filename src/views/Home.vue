<template>
  <div class="container-wrapper">
    <el-carousel :interval="4000" type="card" height="150px" trigger="click" indicator-position="outside">
      <el-carousel-item v-for="item in banners" :key="item">
        <el-image style="width: 100%; height: 100%" :src="item.imageUrl" fit="cover" />
      </el-carousel-item>
    </el-carousel>

    <div>
      <div class="text-2xl font-semibold mt-6 mb-4 text-[--theme-color]">热门推荐</div>
      <el-row :gutter="24">
        <el-col class="pt-2 pb-2" :span="4" v-for="item in personalized" :key="item.id">
          <div>
            <el-image class="can-click w-full h-full rounded-xl" style="width: 100%; height: 100%" :src="item.picUrl" fit="cover" />
            <div class="can-click line-clamp-2 text-[--theme-color]">{{ item.name }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Api } from '@/utils/request';
import { onBeforeMount, onMounted, ref } from 'vue';

onBeforeMount(() => {
  getBanner();
  getPersonalized();
});

onMounted(() => {});

// 获取轮播图
const banners = ref<Array<any>>([]);
const getBanner = async () => {
  const res: any = await Api.get('banner', { type: 0 });
  if (res.code == 200) {
    banners.value = res.banners || [];
  }
};

const personalized = ref<Array<any>>([]);
const getPersonalized = async () => {
  const res: any = await Api.get('personalized', { limit: 12 });
  if (res.code == 200) {
    personalized.value = res.result || [];
  }
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
