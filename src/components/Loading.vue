<template>
  <div id="appLoading">
    <div class="loader"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

onMounted(() => {});
</script>

<style lang="scss" scoped>
#appLoading {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1996;
  width: 100%;
  height: 100%;
  font-size: 20px;
  background: rgba(255, 255, 255, 1);
}
#appLoading.removeAnimate {
  animation: removeAnimate 0.3s 0.5s 1 both;
}
#appLoading .loader {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5em;
  height: 5em;
  transform: translate(-50%, -50%) rotate(165deg);
}
#appLoading .loader::before,
#appLoading .loader::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: 1em;
  height: 1em;
  border-radius: 0.5em;
  transform: translate(-50%, -50%);
}
#appLoading .loader::before {
  animation: before 2s infinite;
}
#appLoading .loader::after {
  animation: after 2s infinite;
}
@keyframes before {
  0% {
    width: 1em;
    box-shadow: 2em -1em rgba(225, 20, 98, 0.75),
      -2em 1em rgba(111, 202, 220, 0.75);
  }
  35% {
    width: 5em;
    box-shadow: 0 -1em rgba(225, 20, 98, 0.75), 0 1em rgba(111, 202, 220, 0.75);
  }
  70% {
    width: 1em;
    box-shadow: -2em -1em rgba(225, 20, 98, 0.75),
      2em 1em rgba(111, 202, 220, 0.75);
  }
  100% {
    box-shadow: 2em -1em rgba(225, 20, 98, 0.75),
      -2em 1em rgba(111, 202, 220, 0.75);
  }
}
@keyframes after {
  0% {
    height: 1em;
    box-shadow: 1em 2em rgba(61, 184, 143, 0.75),
      -1em -2em rgba(233, 169, 32, 0.75);
  }
  35% {
    height: 5em;
    box-shadow: 1em 0 rgba(61, 184, 143, 0.75), -1em 0 rgba(233, 169, 32, 0.75);
  }
  70% {
    height: 1em;
    box-shadow: 1em -2em rgba(61, 184, 143, 0.75),
      -1em 2em rgba(233, 169, 32, 0.75);
  }
  100% {
    box-shadow: 1em 2em rgba(61, 184, 143, 0.75),
      -1em -2em rgba(233, 169, 32, 0.75);
  }
}
@keyframes removeAnimate {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
