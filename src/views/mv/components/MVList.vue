<template>
  <!-- MV列表 -->
  <div
    v-infinite-scroll="loadMore"
    :infinite-scroll-distance="100"
    class="container-wrapper">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
      <div
        class="item-card rounded-lg bg-[var(--content-bg)] bg-card text-card-foreground shadow-sm overflow-hidden cursor-pointer hover:bg-[var(--theme-bg-color)] transition-all duration-300"
        v-for="item in mvList"
        :key="item.id"
        @click="router.push(`/video?id=${item.id}`)">
        <div class="p-0">
          <div class="relative">
            <img
              alt="MV Thumbnail"
              width="320"
              height="180"
              class="w-full object-cover transition-all duration-300"
              :src="item.cover"
              style="aspect-ratio: 320 / 180; object-fit: cover" />
          </div>
          <div class="p-4">
            <h2
              class="font-semibold text-lg mb-1 line-clamp-1"
              :title="item.name">
              {{ item.name }}
            </h2>
            <p class="text-sm text-muted-foreground mb-2 opacity-70">
              {{ item.artistName }}
            </p>
            <p class="text-xs text-muted-foreground opacity-50 text-right">
              {{ item.playCount }} views
            </p>
          </div>
        </div>
      </div>
    </div>

    <Icon
      v-if="showLoading"
      class="text-4xl text-[--button-inactive] mx-auto"
      icon="svg-spinners:90-ring-with-bg" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { ElNotification } from 'element-plus';

interface MV {
  id: number; // MV 唯一标识符
  name: string; // MV 名称
  artistName: string; // 艺术家名称
  cover: string; // 封面图 URL
  playCount: number; // 播放次数
}

const router = useRouter();
const props = defineProps({
  filter: {
    type: Object,
    default: () => ({
      area: '',
      type: '',
      order: '',
    }),
  },
  keywords: {
    type: String,
    default: '',
  },
});

onMounted(() => {});

// 获取 MV 列表的函数
let pages = 1;
const mvList = ref<MV[]>([]);
const isLoading = ref(true);
const showLoading = ref(true);
async function getData(isLoadMore: boolean = false) {
  try {
    isLoading.value = true;

    if (isLoadMore) {
      pages++; // 如果是加载更多，则增加页码
    } else {
      pages = 1; // 否则，重置页码
      mvList.value = []; // 清空列表
    }

    let params, res;

    if (props.keywords) {
      params = {
        keywords: props.keywords,
        type: 1004, // MV
        ...calculatePagination({
          limit: 30,
          offset: pages,
        }),
      };
      res = await Api.get('cloudsearch', params);
    } else {
      params = {
        ...props.filter,
        ...calculatePagination({ offset: pages, limit: 30 }),
      };
      res = await Api.get('mv/all', params);
    }
    if (res.code === 200) {
      let data;
      if (props.keywords) {
        data = res?.result?.mvs || [];
        mvList.value = [...mvList.value, ...data]; // 更新 MV 数据
        hasMore.value = (res?.result?.mvCount || 0) > mvList.value.length;
      } else {
        data = res?.data || [];
        mvList.value = [...mvList.value, ...data]; // 更新 MV 数据
        hasMore.value = res.hasMore || false;
      }
    } else {
      ElNotification({
        title: '错误',
        message: '加载失败',
        type: 'error',
      });
    }
  } catch (error) {
  } finally {
    isLoading.value = false;
    showLoading.value = hasMore.value;
  }
}

const hasMore = ref(true);
const loadMore = async () => {
  if (!isLoading.value && hasMore.value) {
    await getData(true);
  }
};

defineExpose({
  getData,
  mvList
});
</script>

<style lang="scss" scoped>
.item-card:hover img {
  filter: brightness(0.8);
}
</style>
