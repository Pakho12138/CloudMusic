<template>
  <div class="container h-full flex flex-col mx-auto">
    <!-- 选择区域和类型 -->
    <div class="min-w-[500px] flex self-end gap-4 p-6">
      <el-select
        v-model="area"
        placeholder="选择地区"
        @change="getMvData(false)">
        <el-option
          v-for="area in areas"
          :key="area"
          :label="area"
          :value="area" />
      </el-select>

      <el-select
        v-model="type"
        placeholder="选择类型"
        @change="getMvData(false)">
        <el-option
          v-for="type in types"
          :key="type"
          :label="type"
          :value="type" />
      </el-select>

      <el-select
        v-model="order"
        placeholder="选择排序"
        @change="getMvData(false)">
        <el-option
          v-for="order in orders"
          :key="order"
          :label="order"
          :value="order" />
      </el-select>
    </div>

    <!-- MV 列表展示 -->
    <div
      v-infinite-scroll="loadMore"
      :infinite-scroll-distance="100"
      class="container-wrapper">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-4">
        <div
          class="rounded-lg bg-[var(--content-bg)] bg-card text-card-foreground shadow-sm overflow-hidden cursor-pointer hover:bg-[var(--theme-bg-color)] transition-all duration-300"
          v-for="item in mvList"
          :key="item.id"
          @click="router.push(`/video?id=${item.id}`)">
          <div class="p-0">
            <div class="relative">
              <img
                alt="MV Thumbnail"
                width="320"
                height="180"
                class="w-full object-cover"
                :src="item.cover"
                style="aspect-ratio: 320 / 180; object-fit: cover" />
            </div>
            <div class="p-4">
              <h2
                class="font-semibold text-lg mb-1 line-clamp-1"
                :title="item.name">
                {{ item.name }}
              </h2>
              <p class="text-sm text-muted-foreground mb-2">
                {{ item.artistName }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ item.playCount }} views
              </p>
            </div>
          </div>
        </div>
      </div>

      <Icon
        v-if="!isLoading && hasMore"
        class="text-4xl text-[--button-inactive] mx-auto"
        icon="svg-spinners:90-ring-with-bg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

interface MV {
  id: number; // MV 唯一标识符
  name: string; // MV 名称
  artistName: string; // 艺术家名称
  cover: string; // 封面图 URL
  playCount: number; // 播放次数
}

const router = useRouter();
const areas = ['全部', '内地', '港台', '欧美', '日本', '韩国'];
const types = ['全部', '官方版', '原生', '现场版', '网易出品'];
const orders = ['上升最快', '最热', '最新'];

// 获取 MV 列表的函数
let pages = 1;
const mvList = ref<MV[]>([]);
const filter = reactive({
  area: areas[0],
  type: types[0],
  order: orders[0],
});
const { area, type, order } = toRefs(filter);
const isLoading = ref(true);
async function getMvData(isLoadMore: boolean = false) {
  try {
    if (isLoadMore) {
      pages++; // 如果是加载更多，则增加页码
    } else {
      pages = 1; // 否则，重置页码
      mvList.value = []; // 清空列表
    }

    const params = {
      ...filter,
      ...calculatePagination({ offset: pages, limit: 30 }),
    };
    const res: any = await Api.get('mv/all', params);
    if (res.code === 200) {
      mvList.value = [...mvList.value, ...(res.data || [])]; // 更新 MV 数据
      hasMore.value = res.hasMore || false;
    } else {
      // 处理错误情况，例如显示错误提示
    }
  } catch (error) {
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
}

const hasMore = ref(true);
const isLoadingMore = ref(false);
const loadMore = async () => {
  if (!isLoading.value && !isLoadingMore.value && hasMore.value) {
    isLoadingMore.value = true;
    await getMvData(true);
    isLoadingMore.value = false;
  }
};

// 组件挂载后初次加载数据
onMounted(() => {
  getMvData();
});
</script>
