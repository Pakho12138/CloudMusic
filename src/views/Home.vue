<template>
  <div class="home-wrapper">
    <el-carousel :interval="4000" type="card" height="225px"  trigger="click" indicator-position="outside">
      <el-carousel-item v-for="item in banners" :key="item">
        <el-image style="width: 100%; height: 100%" :src="item.pic" fit="cover" />
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { Api } from '@/utils/request';
import { onBeforeMount, onMounted, ref } from 'vue';

onBeforeMount(() => {
  getBanner();
})

onMounted(() => {
});

// 获取轮播图
const banners = ref<Array<any>>([]);
const getBanner = async () => {
  const res: any = await Api.get('banner', { type: 2 });
  if(res.code == 200){
    banners.value = res.banners || [];
  }
};
</script>

<style lang="scss" scoped>
.el-carousel {
  margin: auto;
  width: 800px;
  .el-carousel__item {
    border-radius: 10px;
  }
}
</style>
