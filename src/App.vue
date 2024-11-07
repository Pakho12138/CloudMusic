<script setup lang="ts" name="App">
import { provide, ref, nextTick } from 'vue';
import { RouterLink, RouterView } from 'vue-router';

const showPage = ref<boolean>(true);
const onRefresh = () => {
  showPage.value = false;
  nextTick(() => {
    showPage.value = true;
  });
};
provide('reload', onRefresh);
</script>

<template>
  <router-view v-if="showPage"></router-view>
</template>

<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
