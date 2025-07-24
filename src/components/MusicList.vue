<template>
  <div class="h-full w-full flex flex-col">
    <el-table
      v-loading="isLoading"
      element-loading-background="transparent"
      :data="tableData"
      @row-dblclick="playMusic"
      class="w-full !text-xs !flex-1">
      <template #empty>
        <span v-show="!isLoading">暂无数据</span>
      </template>
      <!--歌名-->
      <el-table-column prop="name" label="歌名" minWidth="160">
        <template #default="{ row }">
          <div class="flex items-center gap-1">
            <div class="min-w-10 h-10">
              <el-image
                class="w-full h-full rounded-lg"
                lazy
                :src="row.al.picUrl + '?param=90y90'"
                :alt="row.al.name" />
            </div>
            <span
              class="line-clamp-1 cursor-pointer"
              @click="router.push(`/search?kw=${row.name}`)"
              :title="row.name"
              >{{ row.name }}</span
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column label="歌手" minWidth="120">
        <template #default="{ row }">
          <div class="line-clamp-1">
            <template v-if="row.ar && row.ar.length">
              <router-link
                v-for="(item, index) in row.ar"
                :key="item.id"
                class="cursor-pointer"
                :to="`/search?kw=${item.name}`">
                {{ item.name }}
                <!-- 在这里添加分隔符 -->
                <span v-if="index < row.ar.length - 1"> \ </span>
              </router-link>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="al.name" label="专辑" minWidth="120">
        <template #default="{ row }">
          <span class="line-clamp-1" :title="row.al.name">
            {{ row.al.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="时间">
        <template #default="{ row }">
          <span>
            {{ formatMillisecondsToTime(row.dt) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="" width="140">
        <template #default="{ row }">
          <div class="flex items-center gap-4">
            <Icon
              icon="material-symbols:play-circle-rounded"
              class="can-click text-2xl text-[--button-inactive]"
              @click="playMusic(row)" />
            <Icon
              icon="solar:video-frame-linear"
              class="can-click text-xl text-[--button-inactive]"
              @click="router.push(`/video?id=${row.mv}`)"
              v-if="row.mv && row.mv !== 0" />
            <Icon
              icon="material-symbols:download"
              class="can-click text-2xl text-[--button-inactive]"
              @click="downLoadMusic(row)" />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="type !== 'playlist'"
      class="flex items-center justify-end mt-5"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 40]"
      :size="size"
      :total="total"
      :background="true"
      layout="total, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </div>
</template>

<script setup lang="ts">
import type { MusicPlayer, Song, Track } from '@/hooks/interface';
import { useAudioStore } from '@/stores/useAudioStore';
import { useUserStore } from '@/stores/useUserStore';
import { Api } from '@/utils/request';
import { calculatePagination, formatMillisecondsToTime } from '@/utils/util';
import { Icon } from '@iconify/vue';
import { ElNotification } from 'element-plus';
import { inject, onMounted, reactive, ref, toRefs, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { playSong, resetAudio, downLoadMusic } = inject(
  'MusicPlayer'
) as MusicPlayer;

const props = defineProps({
  keywords: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'search',
  },
  playCount: {
    type: Number,
    default: 0,
  },
});

onMounted(() => {});

const state = reactive({
  currentPage: 1,
  pageSize: 20,
  size: 'small',
  total: 0,
});
const { currentPage, pageSize, size, total } = toRefs(state);

const route = useRoute();
const router = useRouter();
const AudioStore = useAudioStore();
const UserStore = useUserStore();
const tableData = ref<Song[]>();
const allTableData = ref<Song[]>();
const isLoading = ref<boolean>(true);
const getData = async (isRefresh: boolean = false) => {
  try {
    if (isRefresh) {
      tableData.value = [];
      state.currentPage = 1;
      state.total = 0;
    }
    
    isLoading.value = true;
    
    let res;
    switch (props.type) {
      case 'playlist':
        res = await getPlaylist();
        break;
      case 'search':
        res = await getSearchlist();
        break;
    }
    return res;
  } catch (error) {
    return Promise.reject(error);
  } finally {
    isLoading.value = false;
  }
};

const getSearchlist = async () => {
  const res: any = await Api.get('cloudsearch', {
    type: 1,
    keywords: props.keywords,
    ...calculatePagination({
      limit: state.pageSize,
      offset: state.currentPage,
    }),
  });

  if (res.code == 200) {
    state.total = res.result.songCount || 0;
    tableData.value = res.result.songs || [];
  } else {
    ElNotification({
      title: '错误',
      message: '加载失败',
      type: 'error',
    });
  }
};

const getPlaylist = async () => {
  const res: any = await Api.get('playlist/track/all', {
    id: route.query.id,
    // ...calculatePagination({
    //   limit: state.pageSize,
    //   offset: state.currentPage,
    // }),
  });

  if (res.code == 200) {
    tableData.value = res.songs || [];
  } else {
    ElNotification({
      title: '错误',
      message: '加载失败',
      type: 'error',
    });
  }
  return res;
};

const playMusic = async (row: Song) => {
  const existingIndex = AudioStore.trackList.findIndex(
    existingTrack => existingTrack.id === row.id
  );

  if (existingIndex === -1) {
    try {
      const param: Track = {
        id: row.id,
        title: row.name,
        singer: row.ar.map((ar: any) => ar.name).join(' / '),
        album: row.al.name,
        cover: row.al.picUrl,
        time: row.dt,
        source: '',
        mv: row.mv as number,
      };

      AudioStore.addTrackAndPlay(param);
      playSong(param); // 自动播放新添加的歌曲
    } catch (error) {
      console.error('Error fetching music URL:', error);
    }
  } else {
    const existingTrack = AudioStore.trackList[existingIndex];
    AudioStore.addTrackAndPlay(existingTrack);
    playSong(existingTrack); // 自动播放已存在的歌曲
  }
};

const handleSizeChange = (Size: number) => {
  getData();
};

const handleCurrentChange = (current: number) => {
  getData();
};

defineExpose({
  getData,
  tableData,
});
</script>

<style lang="scss" scoped></style>
