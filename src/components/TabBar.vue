<template>
  <div class="flex items-center justify-center">
    <div class="px-6 h-14 flex items-center font-medium cursor-pointer border-b-2 border-transparent hover:text-[--theme-color] hover:border-[--theme-color] transition-all duration-300" :class="modelValue == tab.name ? '!text-[--theme-color] !border-[--theme-color]' : 'text-[--button-inactive]'" v-for="tab in tabs" :key="tab.name" @click="changeTab(tab.name)">{{ tab.label }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  tabs: {
    type: Array<any>,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'change']);
const changeTab = (name: string) => {
  emit('update:modelValue', name);
  emit('change', name);
};

onMounted(() => {});
</script>

<style lang="scss" scoped></style>
