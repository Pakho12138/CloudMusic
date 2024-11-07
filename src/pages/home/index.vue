<template>
  <el-container>
    <el-header height="auto">
      <img class="img-icon" src="/img/icon-cloud-music.png" />
      <div class="div-searchbar" @click="openSearch">
        <el-icon class="el-icon-search"><Search /></el-icon>
        搜索
      </div>
    </el-header>

    <el-main>
      <el-carousel :interval="4000" height="calc(134 / 375 * 100vw)">
        <el-carousel-item v-for="item in banners" :key="item.bannerId" :style="{ 'background-image': 'url(' + item.pic + ')' }"> </el-carousel-item>
      </el-carousel>
    </el-main>

    <el-footer class="footer-audio" height="auto">
      <div class="div-audio">
        <div class="div-img-wrapper rotate" :style="{ 'animation-play-state': isPaused ? 'paused' : 'running' }" @click="showDetail = true">
          <img class="img-song" :src="musicDetail.al.picUrl" v-if="Object.keys(musicDetail).length > 0" />
        </div>
        <div class="div-name-wrapper">
          <div>
            <span v-cloak>{{ musicDetail.name ? musicDetail.name : '' }}</span>
            <span v-cloak style="font-size: 12px; color: #666">{{ musicDetail.ar ? ' - ' + musicDetail.ar[0].name : '' }}</span>
          </div>
        </div>
        <div class="div-btn-play">
          <el-progress type="circle" :percentage="playProgress" :width="32" :stroke-width="2" color="#C20C0C" :show-text="false" style="position: absolute"></el-progress>
          <i class="icon-play" v-show="isPaused" @click="audioPlay"></i>
          <i class="icon-pause" v-show="!isPaused" @click="audioPause"></i>
        </div>
      </div>
      <audio :src="music.url" ref="audioRef" preload="auto" @play="syncAudioStatus" @pause="syncAudioStatus" @timeupdate="getPercent">该浏览器不支持audio属性</audio>
      <!-- <audio :src="music.url" ref="audioRef" preload="auto" controls @play="syncAudioStatus" @pause="syncAudioStatus" @timeupdate="getPercent">该浏览器不支持audio属性</audio> -->
    </el-footer>
  </el-container>

  <transition name="el-fade-in-linear">
    <div class="div-dialog" v-show="showSearch">
      <el-container>
        <el-header height="auto">
          <div style="position: relative; width: 100%">
            <el-icon class="el-icon-search"><Search /></el-icon>
            <input type="text" class="input-searchbar" :placeholder="searchPlaceholder" v-model="searchVal" @keyup.enter="search" ref="searchbarRef" />
          </div>
          <div class="div-cancle" @click="closeSearch">取消</div>
        </el-header>

        <el-main v-loading="loading" element-loading-text="拼命加载中">
          <div class="div-search-list" v-if="searchList && searchList.length > 0">
            <div class="div-list-item" v-for="song in searchList" @click="playSong(song)">
              <div>
                <b style="color: #333">{{ song.name }}</b>
              </div>
              <div style="font-size: 13px; color: #333">{{ song.ar[0].name }}</div>
            </div>
          </div>
        </el-main>
      </el-container>
    </div>
  </transition>

  <el-drawer :with-header="false" v-model="showDetail" direction="btt" size="100%" ref="drawerRef">
    <el-container :style="{ background: Object.keys(musicDetail).length > 0 ? 'url(' + musicDetail.al.picUrl + ')' : '#fff' }">
      <el-header class="drawer-header" height="auto" style="z-index: 1">
        <el-icon @click="showDetail = false"><ArrowDown /></el-icon>
        <div class="div-wrapper-name">
          <div v-cloak>{{ musicDetail.name ? musicDetail.name : '' }}</div>
          <div v-cloak style="font-size: 12px; color: #999">{{ musicDetail.ar ? musicDetail.ar[0].name : '' }}</div>
        </div>
      </el-header>
      <el-main style="z-index: 1; overflow: hidden">
        <div class="div-lyrics" @scroll="handleScroll">
          <div class="lyric-placeholder"></div>
          <div class="lyricsItem" v-for="(row, index) in lyric" :key="index" :class="lyricsIndex - 1 == index ? 'currentLyric' : ''">{{ row[1] }}</div>
          <div class="lyric-placeholder"></div>
        </div>
      </el-main>
      <el-footer class="footer-btn" style="height: 120px">
        <div class="div-btn">
          <i class="fa fa-step-backward" aria-hidden="true"></i>
          <span class="span-btn-play" v-show="isPaused" @click="audioPlay">
            <i class="fa fa-play" style="margin-left: 4px" aria-hidden="true"></i>
          </span>
          <span class="span-btn-play" v-show="!isPaused" @click="audioPause">
            <i class="icon-pause1"></i>
          </span>
          <i class="fa fa-step-forward" aria-hidden="true"></i>
        </div>
      </el-footer>
    </el-container>
  </el-drawer>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, reactive, ref, watch } from 'vue';
import { Api } from '@/utils/request';
import { ElMessage } from 'element-plus';

const { proxy } = getCurrentInstance() as any;

const searchbarRef = ref();
const audioRef = ref();
const drawerRef = ref();

const banners: any = ref([]);
const curMusicID = ref('1475596788');
const music: any = ref({});
const musicDetail: any = ref({});
const lyric: any = ref([]);
const searchList: any = ref([]);
const searchVal = ref('');
const searchPlaceholder = ref('起风了');
const lyricsIndex = ref(0);
const playProgress = ref(0);
const placeholderHeight = ref(0);
const currentTime = ref(0);
const showDetail = ref(false);
const showSearch = ref(false);
const isPaused = ref(true);
const loading = ref(false);
const loadingTime = ref(10); //歌曲最大加载时间，超出则提示加载失败
const intervalReady = ref();

onMounted(async () => {
  getBanner();
  await getMusic(false);
  getMusicDetail();
  isPaused.value = audioRef.value.paused;
});

watch(currentTime, (currentTime, lastTime) => {
  // 如果两个时间间隔有1秒,则可得知进度条被拖动 需要重新校准歌词index
  // 当歌词数量大于1并且索引为零时,可能歌词位置差距较大,走这个if进行快速跳转
  if ((lastTime && Math.abs(currentTime - lastTime) >= 1) || (lyricsIndex.value == 0 && lyric.value.length > 1)) {
    // 处理播放时间跳转时歌词位置的校准
    if (lyric.value.length > 1) {
      getCurrentLyricsIndex(currentTime);
      // 滑动到当前歌词
      lyricScroll(lyricsIndex.value);
    }
  }
  // 根据实时播放时间实现歌词滚动
  if (lyricsIndex.value < lyric.value.length) {
    if (currentTime >= lyric.value[lyricsIndex.value][0]) {
      lyricsIndex.value += 1;
      lyricScroll(lyricsIndex.value);
    }
  }
});

function openSearch() {
  showSearch.value = true;

  setTimeout(() => {
    searchbarRef.value.focus();
  }, 300);
}

function closeSearch() {
  showSearch.value = false;
  searchVal.value = '';
  searchList.value = [];
}
// 获取轮播图
function getBanner() {
  Api.get('banner', { type: 2 })
    .then((response: any) => {
      banners.value = response.banners ? response.banners : [];
    })
    .catch(error => {});
}
//获取当前歌曲信息
async function getMusic(autoPlay = true) {
  try {
    const response: any = await Api.get('song/url', { id: curMusicID.value });
    let data = response.data ? response.data[0] : {};

    if (data) {
      if (data.code == 404) {
        data.url = 'https://music.163.com/song/media/outer/url?id=' + curMusicID.value + '.mp3';
      }

      getMusicDetail();
      getLyric();

      music.value = data;
      autoPlay && audioRef.value.load();
      autoPlay && audioPlay();
    } else {
      ElMessage.error('歌曲加载失败！');
    }
  } catch (error) {
    ElMessage.error('歌曲加载失败！');
  }
}
//获取当前歌曲详情
async function getMusicDetail() {
  const response: any = await Api.get('song/detail', { ids: curMusicID.value });
  musicDetail.value = response.songs ? response.songs[0] : [];
}
//获取歌词
async function getLyric() {
  const response: any = await Api.get('lyric', { id: curMusicID.value });
  lyric.value = response.lrc.lyric ? parseLyric(response.lrc.lyric) : [];
}
//歌词同步部分
function parseLyric(text: string) {
  //将文本分隔成一行一行，存入数组
  let lines = text.split('\n');
  //用于匹配时间的正则表达式，匹配的结果类似[xx:xx.xx]
  let pattern = /\[\d{2}:\d{2}.\d{3}\]/g;
  //保存最终结果的数组
  let result: any = [];
  //去除空行
  let array: any = [];
  lines.forEach(item => {
    if (item != '') {
      array.push(item);
    }
  });
  lines = array;
  //上面用'\n'生成生成数组时，结果中最后一个为空元素，这里将去掉
  lines[lines.length - 1].length === 0 && lines.pop();
  lines.forEach((v /*数组元素值*/, i /*元素索引*/, a /*数组本身*/) => {
    //提取出时间[xx:xx.xx]
    let time: any = v.match(pattern);
    //提取歌词
    let value = v.replace(pattern, '');
    //因为一行里面可能有多个时间，所以time有可能是[xx:xx.xx][xx:xx.xx][xx:xx.xx]的形式，需要进一步分隔
    time.forEach((v1: any, i1: any, a1: any) => {
      //去掉时间里的中括号得到xx:xx.xx
      let t = v1.slice(1, -1).split(':');
      //将结果压入最终数组
      result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
    });
  });
  //最后将结果数组中的元素按时间大小排序，以便保存之后正常显示歌词
  result.sort((a: any, b: any) => {
    return a[0] - b[0];
  });
  return result;
}
//搜索歌曲
async function search() {
  if (searchVal.value == '') {
    searchVal.value = searchPlaceholder.value;
  }

  loading.value = true;
  Api.get('cloudsearch', { keywords: searchVal.value })
    .then((response: any) => {
      loading.value = false;
      searchList.value = response.result.songs ? response.result.songs : [];
    })
    .catch(error => {
      loading.value = false;
    });
}
//播放歌曲
async function playSong(song: any) {
  try {
    music.value = {};
    musicDetail.value = {};
    curMusicID.value = song.id;
    await getMusic();
  } catch (error) {
    ElMessage.error(error + '');
  }
}
//播放器播放
function audioPlay() {
  if (audioRef.value.readyState != 0) {
    console.log(audioRef.value.readyState);
    audioRef.value.play();
    return;
  }

  intervalReady.value = setInterval(() => {
    if (loadingTime.value == 0) {
      loadingTime.value = 10;
      clearInterval(intervalReady.value);
      ElMessage.error('歌曲加载失败！');
    }

    console.log(audioRef.value.readyState);
    if (audioRef.value.readyState != 0) {
      audioRef.value.play();
      clearInterval(intervalReady.value);
    } else {
      loadingTime.value--;
    }
  }, 1000);
}
//播放器暂停
function audioPause() {
  audioRef.value.pause();
}
//同步播放按钮状态
function syncAudioStatus() {
  isPaused.value = audioRef.value.paused;
}
//获取歌曲播放进度
function getPercent() {
  if (audioRef.value && audioRef.value.readyState != 0) {
    playProgress.value = (audioRef.value.currentTime / audioRef.value.duration) * 100;
  } else {
    playProgress.value = 0;
  }

  currentTime.value = audioRef.value.currentTime;
}
// 实现歌词滚动
function lyricScroll(currentLyric: number) {
  // 获取歌词item
  let lyricsArr: any = document.querySelectorAll('.lyricsItem');
  // 获取歌词框
  let lyrics: any = document.querySelector('.div-lyrics');

  if (lyricsArr?.length && lyrics) {
    // placeholder的高度
    if (placeholderHeight.value == 0) {
      placeholderHeight.value = lyricsArr[0].offsetTop - lyrics.offsetTop;
    }
    //   歌词item在歌词框的高度 = 歌词框的offsetTop - 歌词item的offsetTop
    //   console.log(currentLyric);
    if (lyricsArr[currentLyric - 1]) {
      let distance = lyricsArr[currentLyric - 1].offsetTop - lyrics.offsetTop;
      //   lyricsArr[currentLyric].scrollIntoView();
      lyrics.scrollTo({
        behavior: 'smooth',
        top: distance - placeholderHeight.value,
      });
    }
  }
}
//获取当前歌词索引
function getCurrentLyricsIndex(currentTime: any) {
  let lyricsIdx = 0;
  lyric.value.some((item: any) => {
    if (lyricsIdx < lyric.value.length - 1) {
      if (currentTime > item[0]) {
        lyricsIdx += 1;
      }
      return currentTime <= item[0];
    }
  });
  lyricsIndex.value = lyricsIdx;
}
// 监听滚动事件
function handleScroll(e: any) {
  // // 歌词滚动距离
  // let lyricsScrollTop = e && e.srcElement.scrollTop;
  // // 歌词显示区高度
  // let lyricsClientHeight = e && e.srcElement.clientHeight;
  // // 头部高度
  // let headerHeight = document.getElementsByClassName('drawer-header')[0].clientHeight;
  // // 歌词占位区高度
  // let placeholderHeight = document.getElementsByClassName('lyric-placeholder')[0].clientHeight;
  // // 获取歌词item
  // let lyricsArr: any = document.querySelectorAll('.lyricsItem');
  // // 淡化范围
  // let desalinationHeight = 120;
  // if (lyricsArr && lyricsArr.length > 0) {
  //   // 下标
  //   let index = 0;
  //   for (const item of lyricsArr) {
  //     // 淡化行数
  //     let desalinationLinesCount = Math.ceil(desalinationHeight / item.clientHeight);
  //     // 当前歌词底部到歌词显示区域最顶部的距离（不变）
  //     let toLyricsTopHeight = item.offsetTop + item.clientHeight - headerHeight;
  //     if (toLyricsTopHeight < lyricsScrollTop + desalinationHeight) {
  //       // 一行歌词底部到歌词显示区顶部淡化区域底部的距离
  //       let absHeigth = Math.abs(lyricsScrollTop + desalinationHeight - toLyricsTopHeight);
  //       // 重置上方透明度
  //       if (absHeigth > desalinationHeight) {
  //         item.style.opacity = 0.7;
  //         continue;
  //       }
  //       let opacity = (desalinationHeight - absHeigth) / (desalinationHeight + item.clientHeight);
  //       if (opacity > 0) {
  //         item.style.opacity = 0.7 * opacity;
  //       }
  //     } else {
  //       // 超出歌词显示区停止设置透明度，这里以歌词顶部计算距离，所以减去item.clientHeight
  //       if (toLyricsTopHeight - item.clientHeight - lyricsScrollTop > lyricsClientHeight) {
  //         // 底部歌词渐变
  //         for (let i = desalinationLinesCount; i > 0; i--) {
  //           const row = lyricsArr[index - i];
  //           console.log(index - i);
  //           // 当前歌词顶部到歌词显示区域最顶部的距离（不变）
  //           let curToLyricsTopHeight = item.offsetTop - headerHeight;
  //           // 一行歌词顶部到歌词显示区顶部淡化区域顶部的距离
  //           let absHeigth = Math.abs(lyricsClientHeight + lyricsScrollTop - curToLyricsTopHeight);
  //           let opacity = (desalinationHeight - absHeigth) / desalinationHeight;
  //           if (opacity > 0) {
  //             item.style.opacity = 0.7 * opacity;
  //           }
  //         }
  //         break;
  //       }
  //       // 重置下方透明度
  //       item.style.opacity = 0.7;
  //     }
  //     index++;
  //   }
  // }
}
</script>

<style lang="scss" scoped>
[v-cloak] {
  display: none;
}

body {
  margin: 0;
}

.el-header {
  padding-top: 44px;
  padding-bottom: 10px;
  background-color: #c20c0c;
}

.img-icon {
  width: 25px;
  height: 25px;
  float: left;
  margin: 3px 12px 3px 0;
}

.el-container {
  height: 100%;
}

.div-searchbar {
  height: 30px;
  background: #f5f5f5;
  color: #999;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  font-size: 13px;
}

.el-icon-search {
  display: inline-block;
  font-size: 15px;
  margin-right: 4px;
}

.el-main {
  padding: 0;
}

.el-carousel {
  margin: 10px 16px 16px;
  border-radius: 8px;
}

:deep(.el-carousel__button) {
  width: 6px;
}

.el-carousel__item {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.footer-audio {
  z-index: 3;
  border-top: 1px solid #e6e6e6;
  padding-bottom: 20px;
  position: relative;
}

.div-dialog {
  position: absolute;
  height: calc(100% - 56px);
  width: 100%;
  top: 0;
  background: white;
  z-index: 2;
}

.div-dialog .el-header {
  position: relative;
  display: flex;
  margin-bottom: 20px;
}

.div-dialog .el-icon-search {
  position: absolute;
  top: 1px;
  line-height: 30px;
  margin-left: 12px;
  color: #999;
}

.div-dialog .el-main {
  padding: 0 20px 20px;
}

.input-searchbar {
  width: 100%;
  height: 30px;
  background: #f5f5f5;
  color: #333;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 16px 0 32px;
  font-size: 13px;
  border: none;
  outline: none;
}

.input-searchbar::placeholder {
  color: #999;
}

.div-cancle {
  float: right;
  line-height: 30px;
  margin-left: 12px;
  color: #fff;
  min-width: 32px;
}

.div-search-list {
  /* background-color: rgba(0, 0, 0, .1); */
  background-color: rgba(194, 12, 12, 0.1);
  border-radius: 12px;
  padding: 8px;
}

.div-list-item {
  padding: 8px;
  border-bottom: 1px solid #b2b2b2;
}

.div-list-item:last-of-type {
  border-bottom: none;
}

.el-loading-spinner i {
  color: #c20c0c;
}

.el-loading-spinner .el-loading-text {
  color: #c20c0c;
}

.div-audio {
  position: relative;
  height: 35px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.div-audio i {
  font-size: 30px;
  position: absolute;
}

.div-img-wrapper {
  width: 45px;
  height: 45px;
  background-image: url('/img/bg-music.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -6px;
}

.img-song {
  width: 25px;
  height: 25px;
  border-radius: 25px;
  object-fit: cover;
  object-position: center;
}

.div-name-wrapper {
  display: flex;
  align-items: center;
  margin-left: 50px;
}

audio {
  box-sizing: content-box;
  width: 100%;
  height: 40px;
  padding: 16px 0;
}

.footer-audio .div-btn-play {
  position: relative;
  width: 30px;
  height: 30px;
}

.icon-play {
  height: 32px;
  width: 32px;
  border: 2px solid rgba(194, 12, 12, 0.3);
  border-radius: 25px;
  background: url('/icon/play.svg') 9px center no-repeat;
  background-size: 12px 12px;
}

.icon-pause {
  height: 32px;
  width: 32px;
  border: 2px solid rgba(194, 12, 12, 0.3);
  border-radius: 25px;
  background: url('/icon/pause.svg') center no-repeat;
  background-size: 12px 12px;
}

.rotate {
  animation: rotate 30s linear infinite;
}

@-webkit-keyframes rotate {
  from {
    -webkit-transform: rotate(0deg);
  }

  to {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.drawer-header {
  .el-icon {
    font-size: 30px;
    color: #fff;
  }
}

.el-drawer .el-header {
  background-color: transparent;
  position: relative;
  display: flex;
}

.el-drawer .el-header .div-wrapper-name {
  position: absolute;
  left: 50%;
  transform: translate(-50%);
  text-align: center;
  color: #fff;
  font-size: 18px;
}

.el-drawer .el-container {
  position: relative;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  overflow: hidden;
}

.el-drawer .el-container::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  filter: blur(20px) brightness(0.5);
  margin: -30px;
  background: inherit;
}

.el-drawer .el-main {
  z-index: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.el-drawer .footer-btn {
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-drawer .footer-btn .div-btn {
  color: white;
  font-size: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.el-drawer .footer-btn .div-btn .span-btn-play {
  border: 2px solid #fff;
  display: inline-flex;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  margin: 0 40px;
  font-size: 20px;
}

.icon-pause1 {
  height: 28px;
  width: 28px;
  background: url('/icon/pause1.svg') center / 20px 20px no-repeat;
}

.div-lyrics {
  word-wrap: break-word;
  color: white;
  padding: 0 50px;
  text-align: center;
  line-height: 40px;
  height: 100%;
  overflow-y: auto;
  transition: all 0.5s;
  -webkit-mask-image: -webkit-linear-gradient(top, transparent, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, transparent);
  mask-image: linear-gradient(top, transparent, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 1) 90%, transparent);
}

.div-lyrics::-webkit-scrollbar {
  display: none;
}

.div-lyrics .lyric-placeholder {
  height: 50%;
}

.div-lyrics .lyricsItem {
  opacity: 0.7;
  /* transition: all .5s; */
}

.currentLyric {
  opacity: 1 !important;
}
</style>
