// 播放模式枚丽数
import { PlayMode } from '@/enum';
import { Api } from '@/utils/request';
import { ElNotification } from 'element-plus';
import { computed, nextTick, onMounted, ref } from 'vue';
import { parseAndMergeLyrics, type LyricData } from '@/utils/parseLyrics';
import { useAudioStore } from '@/stores/useAudioStore';
import type { Song, Track } from './interface';
import { useThrottleFn } from '@vueuse/core';
import { calculatePagination } from '@/utils/util';
import { useUserStore } from '@/stores/useUserStore';

export function useMusicPlayer() {
  const AudioStore = useAudioStore();
  // 默认数据
  const defaultSong = {
    title: '未选择歌曲',
    singer: '未知歌手',
    cover: new URL(`/img/default_album.jpg`, import.meta.url).href,
  };
  // 计算属性，用来获取当前播放的歌曲
  const currentSong = computed(
    () =>
      AudioStore.trackList[AudioStore.currentSongIndex as number] || defaultSong
  );
  // 用于追踪播放状态的响应式变量
  const isPlaying = ref(false);
  // 是否正在加载
  const isLoading = ref(false);
  // 当前播放模式的响应式变量
  const playMode = ref(PlayMode.Sequence);
  // 创建一个新的Audio实例
  const audio = new Audio();
  // 添加当前时间和总时间的响应式引用
  const currentTime = ref(0);
  const duration = ref(0);
  // 音量控制
  const volume = ref(70); // 音量范围：0到100
  // 音乐歌词
  const lyricsData = ref<LyricData>({
    lines: [],
  });
  // 用于追踪当前歌词索引
  const currentLyricIndex = ref(0);
  // 评论弹窗
  const commenDrawer = ref(false);
  // 评论列表
  const commentListData = ref<Comment[]>([]);
  // 评论总数
  const commenTotal = ref(0);

  // EQ相关的响应式变量
  const eqSettings = ref({
    bass: 0, // 低音
    mid: 0, // 中音
    treble: 0, // 高音
  });
  let isFirst = true; // 用于判断是否第一次加载
  const userStore = useUserStore();

  // 在组件挂载时添加事件监听器
  onMounted(() => {
    userStore.isLogin && getLikeList();
    playSong(); // 默认播放当前歌曲
    audio.onloadstart = () => {
      isLoading.value = true;
    };
    audio.oncanplaythrough = () => {
      isLoading.value = false;
    };
    audio.ontimeupdate = useThrottleFn(() => {
      if (isChanging && currentTime.value == Math.round(audio.currentTime)) {
        isChanging = false;
        return;
      }
      currentTime.value = audio.currentTime;
    }, 800);
    audio.onloadedmetadata = () => {
      duration.value = audio.duration;
    };
    // 初始化音量
    audio.volume = volume.value / 100; // 将音量转换为 0 到 1 的范围

    audio.onplay = () => {
      isPlaying.value = true;
    };
    audio.onpause = () => {
      isPlaying.value = false;
    };
    // 歌曲播放完毕后自动切换
    audio.onended = () => {
      playNext();
    };

    // 添加错误监听
    audio.onerror = async () => {
      await handleAudioError();
      isPlaying.value = false;
      isLoading.value = false;
    };
  });

  const getDetail = async () => {
    Loadlyrics();
    getCommentPlaylist();
  };

  const handleAudioError = async () => {
    if (!audio.error) return;

    if (audio.error.code === audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED) {
      currentTime.value = 0;
      duration.value = 0;
      try {
        if (!currentSong.value?.id) return;

        // 尝试获取新的音源地址，然后重新播放
        const { data } = await Api.get('song/url/v1', {
          id: currentSong.value.id,
          level: 'standard',
          br: 128000,
        });
        if (!data?.length || !data[0].url) {
          AudioStore.trackList[AudioStore.currentSongIndex as number].disabled =
            true;
          playNext(); // 如果没有新的音源，播放下一首
          ElNotification({
            title: '错误',
            message: '当前歌曲没有可用音源，已切换到下一首。',
            type: 'error',
          });
        } else {
          audio.src = data[0].url;
          AudioStore.setCurrentSongUrl(data[0].url);
          audio.load();
        }
      } catch (e) {
        // 如果有获取新源失败的专用错误信息
        // errorMessage = "获取新源失败。";
      }
    }
  };

  // 加载歌词
  async function Loadlyrics() {
    if (!currentSong.value?.id) return;

    // 初始化歌词当前坐标
    lyricsData.value = { lines: [] };
    try {
      if (
        currentSong.value.Lyric &&
        (currentSong.value.Lyric.lines.length > 0 ||
          currentSong.value.Lyric.remark)
      ) {
        // 如果 `currentSong` 已有歌词
        // 这里可直接更新使用已有的 `lyric` 字段
        // 在模板中用它的 `lyric` 字段显示
        lyricsData.value = currentSong.value.Lyric;
      } else {
        if (!currentSong.value?.id) return;

        const result: any = await Api.get('lyric', {
          id: currentSong.value.id,
        }); // 调用 API 获取歌词
        lyricsData.value = parseAndMergeLyrics(result);
        // 缓存歌词
        AudioStore.setCurrentSonglyrics(lyricsData.value);
      }
      // 初始化歌词
      findCurrentLyricIndex();
    } catch (error) {
      console.error('获取歌词时出错:', error);
    }
  }

  // 用于查找当前歌词索引并计算 translateY 值
  function findCurrentLyricIndex(newTime = 0) {
    if (lyricsData.value.lines.length === 0) return;

    const targetIndex = lyricsData.value.lines.findIndex(
      (line: any) => line.time > newTime * 1000
    );
    currentLyricIndex.value =
      targetIndex === -1 ? lyricsData.value.lines.length - 1 : targetIndex - 1;
  }

  // 函数计算当前高亮歌词的位置，并将其滚动到中间。使用 offsetTop 属性获取元素距离顶部的距离，并设置 scrollTop。
  function scrollToCurrentLyric(el: HTMLDivElement) {
    if (!el) return;

    const activeLyric = el.querySelector('.activeLyric') as HTMLElement;

    if (activeLyric) {
      el.scrollTop =
        activeLyric.offsetTop -
        (el.clientHeight - activeLyric.clientHeight) / 2;
    }
  }

  // 播放音乐
  function play() {
    audio && audio.play();
  }

  // 暂停音乐
  function pause() {
    audio && audio.pause();
  }

  // 重置音频
  function resetAudio() {
    if (audio) {
      audio.pause();
      audio.currentTime = currentTime.value = 0;
      duration.value = 0;
    }
  }

  // 切换播放/暂停状态
  function togglePlayPause() {
    if (!currentSong.value?.id) return;

    if (isPlaying.value) {
      pause();
    } else {
      play();
    }
  }

  // 设置播放模式
  function setPlayMode(mode: PlayMode) {
    playMode.value = mode;
    ElNotification({
      title: 'Play mode',
      message: mode + ' mode',
      type: 'success',
    });
  }

  // 播放下一首歌曲
  function playNext() {
    if (!currentSong.value?.id) return;
    if (AudioStore.trackList.every(song => song.disabled)) {
      return;
    }

    switch (playMode.value) {
      case PlayMode.Random: // 如果是随机模式，则随机选择一首歌曲播放
        playRandomSong();
        break;
      default: // 对于单曲循环模式、顺序播放和列表循环模式，播放列表中的下一首歌
        let nextIndex = (AudioStore.currentSongIndex as number) + 1;
        if (nextIndex >= AudioStore.trackList.length) {
          nextIndex = 0; // 如果是最后一首歌，则回到列表的开始
        }
        if (AudioStore.trackList[nextIndex]?.disabled) {
          AudioStore.setCurrentSong(nextIndex);
          playNext(); // 如果下一首歌被禁用，则继续查找下一首
        } else {
          AudioStore.setCurrentSong(nextIndex);
          playSong();
        }
        break;
    }
  }

  // 播放上一首歌曲
  function playPrevious() {
    if (!currentSong.value?.id) return;

    let previousIndex = (AudioStore.currentSongIndex as number) - 1;
    if (previousIndex < 0) {
      previousIndex = AudioStore.trackList.length - 1; // 如果是第一首歌，则跳到列表的最后
    }
    AudioStore.setCurrentSong(previousIndex); // 播放上一首歌曲
    playSong();
  }

  // 随机播放一首歌曲
  function playRandomSong() {
    const randomIndex = Math.floor(Math.random() * AudioStore.trackList.length);
    AudioStore.setCurrentSong(randomIndex); // 设置当前歌曲为随机选择的歌曲
    playSong();
  }

  // 用户拖动进度条时的时间变化（这里取到的时间为准确时间，用于处理change事件返回值不准确的问题）
  let changeTime = 0;
  const inputCurrentTime = (time: number) => {
    changeTime = time;
  };

  // 改变当前歌曲时间
  let isChanging = false;
  const changeCurrentTime = (time: number) => {
    nextTick().then(() => {
      currentTime.value = audio.currentTime = Math.round(changeTime);
      isChanging = true;
    });
  };

  // 设置音量
  const setVolume = (newVolume: number) => {
    volume.value = newVolume;
    audio.volume = newVolume / 100; // 将音量转换为 0 到 1 的范围
  };

  // 添加播放歌曲的方法
  const playSong = async (song?: Song) => {
    try {
      let track: Track;

      if (song) {
        track = {
          id: song.id,
          title: song.name,
          singer: song.ar.map((ar: any) => ar.name).join(' / '),
          album: song.al.name,
          cover: song.al.picUrl,
          time: song.dt,
          source: '',
          mv: song.mv as number,
        };
      } else {
        track = currentSong.value;
      }

      if (!track?.id) return;

      AudioStore.addTrackAndPlay(track);
      resetAudio();
      isLoading.value = true; // 设置加载状态
      const res: any = await Api.get('song/url', {
        id: track.id,
        level: 'standard',
        br: 128000,
        cookie: localStorage.getItem('cookie') || '',
      });
      if (res.code == 200) {
        const data = res.data;
        audio.src = data[0].url;
        getDetail(); // 加载数据
        if (data?.length && data[0].url) {
          !isFirst && play(); // 播放歌曲
          isFirst = false;
        }
      } else {
        ElNotification({
          title: '错误',
          message: '播放失败',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  // 获取评论列表的函数，默认请求第一页，如果已有评论则不再请求
  let pages = 1;
  const getCommentPlaylist = async (isLoadMore: boolean = false) => {
    if (!currentSong.value?.id) return;

    if (isLoadMore) {
      pages++; // 如果是加载更多，则增加页码
    } else {
      pages = 1; // 否则，重置页码
      commentListData.value = []; // 清空评论列表
      commenTotal.value = 0; // 重置评论总数
    }

    // 请求评论数据，并合并到现有评论列表中
    const res: any = await Api.get('comment/music', {
      id: currentSong.value.id,
      ...calculatePagination({ offset: pages }),
    });
    commentListData.value = commentListData.value.concat(res.comments); // 更新评论列表
    commenTotal.value = res.total; // 更新评论总数
  };

  // 打开评论抽屉并加载相应的评论数据
  const showDrawer = async () => {
    commenDrawer.value = true; // 打开评论抽屉
    if (commentListData.value.length > 0) return; // 如果已有评论数据，则不再请求

    // 请求评论数据，并更新评论列表和评论总数
    getCommentPlaylist();
  };

  // 更新EQ设置
  const updateEQ = (band: 'bass' | 'mid' | 'treble', value: number) => {
    eqSettings.value[band] = value;
    // 这里可以添加逻辑来应用 EQ 设置.
    applyEQ();
  };

  // 应用EQ设置的逻辑
  // 由于跨域问题 暂时搁浅
  // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // const source = audioContext.createMediaElementSource(audio);
  const applyEQ = () => {
    // 这里可以结合Web Audio API来处理音频均衡器
    // const bassFilter = audioContext.createBiquadFilter();
    // bassFilter.type = 'lowshelf';
    // bassFilter.frequency.value = 250; // 250Hz 以下
    // bassFilter.gain.value = eqSettings.value.bass;
    // const midFilter = audioContext.createBiquadFilter();
    // midFilter.type = 'peaking';
    // midFilter.frequency.value = 1000; // 1000Hz
    // midFilter.gain.value = eqSettings.value.mid;
    // const trebleFilter = audioContext.createBiquadFilter();
    // trebleFilter.type = 'highshelf';
    // trebleFilter.frequency.value = 6000; // 6000Hz 以上
    // trebleFilter.gain.value = eqSettings.value.treble;
    // // 将过滤器连接到音频链
    // source.connect(bassFilter);
    // bassFilter.connect(midFilter);
    // midFilter.connect(trebleFilter);
    // trebleFilter.connect(audioContext.destination);
  };

  const downLoadMusic = (row: any = currentSong.value) => {
    Api.get('song/url', {
      id: row.id,
      level: 'standard',
      br: 320000,
      cookie: localStorage.getItem('cookie') || '',
    })
      .then(({ data }) => {
        const musicUrl = data[0].url;
        const link = document.createElement('a');
        if (row.ar) {
          link.download = `${row.ar.map(item => item.name).join(' ')} - ${
            row.name
          }.mp3`;
        } else {
          link.download = `${row.singer} - ${row.title}.mp3`;
        }
        // 设置下载链接
        link.href = `https://cloudmusic.pages.dev/proxy?url=${encodeURIComponent(
          musicUrl
        )}&filename=${encodeURIComponent(link.download)}&download=true`;
        document.body.appendChild(link); // 将链接添加到DOM中（临时）
        link.click(); // 触发点击下载
        document.body.removeChild(link); // 删除链接
      })
      .catch(error => {
        console.error('Download failed:', error);
      });
  };

  const getLikeList = async () => {
    const res: any = await Api.get('likelist', {
      uid: userStore.userInfo.userId,
      cookie: localStorage.getItem('cookie') || '',
    });
    if (res.code == 200) {
      AudioStore.likeList = res.ids || [];
    }
  };

  const handleLike = async () => {
    if (AudioStore.isLike) {
      AudioStore.likeList = AudioStore.likeList.filter(
        id => id !== currentSong.value.id
      );
    } else {
      AudioStore.likeList.push(Number(currentSong.value.id));
    }
    const res: any = await Api.get('like', {
      id: currentSong.value.id,
      cookie: localStorage.getItem('cookie') || '',
      like: AudioStore.isLike,
    });
    if (res.code == 200) {
      getLikeList(); // 更新喜欢列表
    }
  };

  return {
    currentSong,
    isPlaying,
    isLoading,
    play,
    pause,
    playNext,
    playPrevious,
    togglePlayPause,
    playMode,
    setPlayMode,
    audio,
    currentTime, // 暴露当前播放时间
    duration, // 暴露歌曲总时间
    changeCurrentTime,
    inputCurrentTime,
    setVolume,
    volume,
    playSong,
    Loadlyrics,
    lyricsData,
    currentLyricIndex,
    updateEQ,
    eqSettings,
    scrollToCurrentLyric,
    findCurrentLyricIndex,
    commenDrawer,
    commentListData,
    commenTotal,
    getCommentPlaylist,
    showDrawer,
    resetAudio,
    downLoadMusic,
    handleLike,
  };
}
