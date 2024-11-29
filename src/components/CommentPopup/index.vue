<template>
  <el-drawer
    title="评论"
    v-model="drawer"
    :direction="direction"
    class="!h-full !w-[100%] md:!w-[50%] backdrop-blur-[20px]"
    @opened="isOpened = true"
    style="--dropdown-bg: var(--theme-bg-color);">
    <div v-infinite-scroll="loadMore" :infinite-scroll-distance="100" class="w-full h-full overflow-y-auto">
      <div
        class="grid gap-6 grid-cols-[repeat(auto-fill,minmax(320px,1fr))] mx-10 mt-2 mb-8">
        <div
          class="transform transition-all duration-300 hover:scale-105 cursor-pointer"
          v-for="item in commentListData"
          :key="item.commentId"
          ref="observedElement">
          <div
            class="flex flex-col justify-between bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4 h-full shadow-lg border border-white border-opacity-20">
            <div>
              <div class="flex items-center mb-4 space-x-2">
                <el-avatar
                  :src="item.user.avatarUrl + '?param=60y60'"
                  :alt="item.user.nickname" />
                <div>
                  <div class="font-medium text-base">
                    {{ item.user.nickname }}
                  </div>
                  <div class="text-xs text-muted-foreground">
                    {{ item.timeStr }}
                  </div>
                </div>
              </div>
              <p class="text-base line-clamp-2 min-h-12 px-2">
                {{ item.content }}
              </p>
            </div>
            <div
              class="flex justify-between items-center text-xs text-gray-500 mt-4">
              <span>{{ item.timeStr }}</span
              ><span>IP: {{ item.ipLocation.location }}</span>
            </div>
          </div>
        </div>
      </div>

      <Icon
        v-if="hasMore"
        class="text-4xl text-[--button-inactive] mx-auto mb-8"
        icon="svg-spinners:90-ring-with-bg" />
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { MusicPlayer } from '@/hooks/interface';
import { Icon } from '@iconify/vue';

const { getCommentPlaylist, commentListData, commenTotal } = inject(
  'MusicPlayer'
) as MusicPlayer;

const drawer = defineModel();
defineProps({
  direction: {
    type: String as PropType<'rtl' | 'ltr' | 'ttb' | 'btt'>,
    default: 'ltr',
  },
});

const isOpened = ref(false);
const hasMore = ref(true);
const isLoading = ref(false);
const loadMore = async () => {
  if (isOpened.value && !isLoading.value && hasMore.value) {
    isLoading.value = true;
    await getCommentPlaylist(true);
    isLoading.value = false;
    hasMore.value = commentListData.value.length < commenTotal.value;
  }
};
</script>

<style lang="scss" scoped>

</style>
