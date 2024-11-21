<template>
  <div class="video-bg">
    <video width="320" height="240" autoplay loop muted>
      <source src="https://assets.codepen.io/3364143/7btrrd.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>

  <el-container class="app-main">
    <el-header>
      <Header />
    </el-header>
    <el-container>
      <el-aside width="240px">
        <SideBar />
      </el-aside>
      <el-main>
        <router-view v-if="showPage"></router-view>
      </el-main>
    </el-container>
    <el-footer>
      <Footer @show="handleShow" />
    </el-footer>

    <DrawerPlayer ref="DrawerPlayerRef" />
  </el-container>
</template>

<script setup lang="ts" name="App">
import { provide, ref, nextTick } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import SideBar from './components/layout/SideBar.vue';
import Header from './components/layout/Header.vue';
import Footer from './components/layout/Footer.vue';
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
</style>
