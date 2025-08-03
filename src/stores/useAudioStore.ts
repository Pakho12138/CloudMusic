import type { AudioStore, Track } from '@/hooks/interface';
import type { LyricData } from '@/utils/parseLyrics';
import { defineStore } from 'pinia';

/**
 * 音频
 */
export const useAudioStore = defineStore('audioStore', {
  state: (): AudioStore => ({
    // 歌曲缓存
    trackList: [
      // {
      //   id: '2112196350',
      //   title: '浮光',
      //   singer: '周深',
      //   album: '浮光',
      //   cover:
      //     'http://p1.music.126.net/zfdCU3cL-dsTqVvjmKPrjg==/109951169222823883.jpg',
      //   source:
      //     'http://m801.music.126.net/20241123231312/122400e3b66d3f81814a9cc7f344906a/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/32407773353/f8a6/1163/aa19/7065abd5982bf7c5d91717d17036e05a.mp3',
      //   time: 274544,
      // },
      // {
      //   id: '64093',
      //   title: '孤独患者',
      //   singer: '陈奕迅',
      //   album: '？',
      //   cover:
      //     'http://p1.music.126.net/Po0tJTtv4aBaYozWlnojHg==/18546562139313276.jpg',
      //   source:
      //     'http://m801.music.126.net/20241123231807/321ce169ef3e791010caf7fa4f4750da/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/28481799312/75d8/23c2/0cf6/5e60f4b106410e8bc3112e29f71e7c6b.mp3',
      //   time: 271226,
      // },
    ],
    currentSongIndex: 0,
    likeList: [], // 喜欢列表
  }),
  getters: {
    isLike: state => {
      return state.likeList.includes(
        state.trackList[state.currentSongIndex as number]?.id as number
      );
    },
  },
  actions: {
    // 设置当前歌曲
    setCurrentSong(index: number) {
      if (index >= 0 && index < this.trackList.length) {
        this.currentSongIndex = index;
      }
    },
    // 设置当前歌曲链接
    setCurrentSongUrl(url: string) {
      this.trackList[this.currentSongIndex as number].source = url;
    },
    // 设置当前歌曲歌词
    setCurrentSonglyrics(Lyric: LyricData) {
      this.trackList[this.currentSongIndex as number].Lyric = Lyric;
    },
    addTrack(param: Track | Track[]) {
      if (Array.isArray(param)) {
        this.trackList = this.trackList.concat(param);
      } else {
        this.trackList.push(param);
      }
    },
    addTrackAndPlay(param: Track | Track[]) {
      let addedIndex = -1; // 用于记录新添加的歌曲索引
      let existingIndex = -1; // 用于记录已存在歌曲的索引

      const addTrack = (track: Track) => {
        existingIndex = this.trackList.findIndex(
          existingTrack => existingTrack.id === track.id
        );

        if (existingIndex === -1) {
          this.trackList.push(track);
          addedIndex = this.trackList.length - 1; // 记录新添加的歌曲索引
        } else {
          // console.warn(`Track with ID ${track.id} already exists at index ${existingIndex}.`);
          addedIndex = existingIndex; // 更新 addedIndex 为已存在歌曲的索引
        }
      };

      if (Array.isArray(param)) {
        param.forEach(track => addTrack(track));
      } else {
        addTrack(param);
      }

      // 设置当前歌曲为新添加的或已存在的歌曲
      if (addedIndex !== -1) {
        this.setCurrentSong(addedIndex);
      }
    },
    // 删除指定歌曲
    deleteTrack(id: number | string) {
      this.trackList = this.trackList.filter(track => track.id !== id);
    },
    clearAllSong() {
      this.trackList = [];
    },
  },
  persist: {
    storage: localStorage,
    // 自定义存储键名
    key: 'audioStore',
    // 只存储某个字段
    pick: ['trackList', 'currentSongIndex'],
  },
});
