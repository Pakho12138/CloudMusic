<template>
  <div>
    <div
      v-if="title"
      class="text-2xl font-semibold mt-6 mb-4 text-[--theme-color]">
      {{ title }}
    </div>
    <el-row :gutter="24">
      <el-col
        class="pt-2 pb-2"
        :span="4"
        v-for="item in list"
        :key="item.id"
        @click="router.push(`/playlistDetail?id=${item.id}`)">
        <div>
          <el-image
            class="can-click w-full h-full rounded-xl aspect-square"
            :src="item[imgProp]"
            fit="cover" />
          <div class="can-click line-clamp-2 text-[--theme-color]">
            {{ item.name }}
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { onMounted, ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  list: {
    type: Array<any>,
    default: () => [],
  },
  imgProp: {
    type: String,
    default: 'coverImgUrl',
  }
});

onMounted(() => {});
</script>

<style lang="scss" scoped></style>
