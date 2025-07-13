<template>
  <!-- <div class="video-bg">
    <video width="320" height="240" autoplay loop muted>
      <source
        src="https://ghcdn.pages.dev/video/bg.mp4"
        type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div> -->

  <div class="background-container">
    <div class="gradient-bg"></div>
    <div class="gradient-bg"></div>
  </div>

  <el-container class="app-main">
    <el-header>
      <Header />
    </el-header>
    <el-container>
      <el-aside width="240px">
        <SideBar />
      </el-aside>
      <el-main class="!flex !flex-col">
        <router-view v-if="showPage"></router-view>
      </el-main>
    </el-container>
    <el-footer v-show="showFooter()" class="-z-[1]">
      <Footer @show="handleShow" />
    </el-footer>

    <DrawerPlayer ref="DrawerPlayerRef" />
  </el-container>
</template>

<script setup lang="ts" name="App">
import { provide, ref, nextTick } from 'vue';
import { RouterView } from 'vue-router';
import SideBar from './components/layout/SideBar.vue';
import Header from './components/layout/Header.vue';
import Footer from './components/layout/Footer/Footer.vue';
import DrawerPlayer from './components/DrawerPlayer/index.vue';
import { useMusicPlayer } from './hooks/useMusicPlayer';

const showPage = ref<boolean>(true);
const onRefresh = () => {
  showPage.value = false;
  nextTick(() => {
    showPage.value = true;
  });
};
provide('reload', onRefresh);

const DrawerPlayerRef = ref();
const handleShow = () => {
  if (DrawerPlayerRef.value) {
    DrawerPlayerRef.value.show();
  }
};
// 共享播放器状态
provide('MusicPlayer', useMusicPlayer());

const route = useRoute();
const showFooter = () => {
  return route?.name != 'video';
};
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  font-family: var(--body-font);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 2em;
  /* background: url('/img/bg.jpg') no-repeat center / cover; */
  .video-bg {
    position: fixed;
    right: 0;
    top: 0;
    width: 100%;
    height: 100%;
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .app-main {
    background-color: var(--theme-bg-color);
    max-width: 1250px;
    max-height: 860px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    width: 100%;
    border-radius: 14px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    font-size: 15px;
    font-weight: 500;
    .el-header {
      padding: 0;
    }
    .el-container {
      overflow: hidden;
      .el-aside {
        border-right: 1px solid var(--border-color);
      }
      .el-main {
        padding: 0;
      }
    }
    .el-footer {
      --el-footer-padding: 0;
      border-top: 1px solid var(--border-color);
    }
  }
}

/* 背景层容器 */
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vw;
  z-index: -1;
}

/* 渐变背景层 */
.gradient-bg {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, #ff0080, #00ffff, #8000ff);
  animation: rotate-gradient 20s linear infinite;
  opacity: 0.6;
  filter: blur(60px);
}

.gradient-bg:nth-child(2) {
  background: linear-gradient(135deg, #ff8c00, #ff0080, #00ffcc);
  animation-duration: 25s;
  animation-direction: reverse;
  opacity: 0.5;
}

/* 动画定义 */
@keyframes rotate-gradient {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
