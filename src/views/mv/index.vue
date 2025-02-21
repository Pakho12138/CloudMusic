<template>
  <div class="container h-full flex flex-col mx-auto">
    <!-- 选择区域和类型 -->
    <div class="min-w-[500px] flex self-end gap-4 p-6">
      <el-select v-model="area" placeholder="选择地区" @change="getMvData">
        <el-option
          v-for="area in areas"
          :key="area"
          :label="area"
          :value="area" />
      </el-select>

      <el-select v-model="type" placeholder="选择类型" @change="getMvData">
        <el-option
          v-for="type in types"
          :key="type"
          :label="type"
          :value="type" />
      </el-select>

      <el-select v-model="order" placeholder="选择排序" @change="getMvData">
        <el-option
          v-for="order in orders"
          :key="order"
          :label="order"
          :value="order" />
      </el-select>
    </div>

    <!-- MV列表 -->
    <MVList ref="mvListRef" :filter="filter" />
  </div>
</template>

<script setup lang="ts">
import MVList from './components/MVList.vue';

const areas = ['全部', '内地', '港台', '欧美', '日本', '韩国'];
const types = ['全部', '官方版', '原生', '现场版', '网易出品'];
const orders = ['上升最快', '最热', '最新'];

const filter = reactive({
  area: areas[0],
  type: types[0],
  order: orders[0],
});

const { area, type, order } = toRefs(filter);

// 组件挂载后初次加载数据
onMounted(() => {
  getMvData();
});

const mvListRef = ref();
const getMvData = () => {
  mvListRef.value.getData(false);
};
</script>
