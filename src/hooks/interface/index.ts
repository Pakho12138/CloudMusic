import type { PlayMode } from '@/enum';
import type { LyricData } from '@/utils/parseLyrics';
import type { Ref } from 'vue';

export interface themeState {
  language: string;
  primary: string;
  isDark: string | number | boolean;
}

export interface AudioStore {
  trackList: Track[]; // 歌曲列表
  currentSongIndex: Number; // 当前正在播放的歌曲的索引
}

// 定义单个音轨的接口
export interface Track {
  id: string | number; // 歌曲 ID
  title: string; // 歌曲标题
  singer: string; // 歌手
  album: string; // 专辑
  cover: string; // 封面图 URL
  source: string; // 歌曲源 URL
  time: number; // 时长（毫秒）
  mv?: number | string; // mvID
  Lyric?: LyricData; // 歌词
}

// 定义 MusicPlayer 的类型
export interface MusicPlayer {
  currentSong: Ref<Track>; // 当前播放的歌曲
  isPlaying: Ref<boolean>; // 播放状态
  play: () => void; // 播放音乐
  playNext: () => void; // 播放下一首歌曲
  playPrevious: () => void; // 播放上一首歌曲
  togglePlayPause: () => void; // 切换播放/暂停状态
  playMode: Ref<PlayMode>; // 当前播放模式
  setPlayMode: (mode: PlayMode) => void; // 设置播放模式
  audioElement: Ref<HTMLAudioElement>; // 音频元素
  currentTime: Ref<number>; // 当前播放时间
  duration: Ref<number>; // 歌曲总时间
  changeCurrentTime: (currentTime: number) => void; // 改变当前播放时间
  setVolume: (volume: number) => void; // 设置音量
  playSong: (param: Track) => void; // 播放指定的歌曲
  volume: Ref<number>; // 当前音量
  lyricsData: Ref<LyricData>; // 歌词数据
  Loadlyrics: () => Promise<void>; // 加载歌词
  findCurrentLyricIndex: (currentTime: number) => void; // 查找当前歌词索引
  scrollToCurrentLyric: (el1: HTMLElement) => void; // 加载歌词
  currentLyricIndex: Ref<number>; // 当前歌词索引
  scrollStyle: Ref<{ transform: string }>; // 用于滚动歌词的样式
  eqSettings: Ref<{ bass: number; mid: number; treble: number }>; // EQ 设置
  updateEQ: (band: 'bass' | 'mid' | 'treble', value: number) => void; // 更新EQ的方法
}

export interface Params {
  id?: number | string; // 用户 ID
  limit?: number; // 可选，默认值为 30
  offset?: number; // 可选，默认值为 1
  cat?: string | []; // 用于精选歌单的
}

// 设置
export interface SettingState {
  isOriginalParsed: Boolean;
  isTranslatedParsed: Boolean;
  isRomaParsed: Boolean;
  isDrawerCover: Boolean;
}

// 搜索
// 歌曲的实体类型
export interface Song {
  name: string;
  id: number;
  pst: number;
  t: number;
  al: {
    id: number;
    name: string;
    picUrl: string; // 或者 picUrl
  };
  ar: Array<{
    id: number;
    name: string;
    tns: string[];
    alias: string[];
  }>;
  dt: number; //歌曲时长
  mv: number | null; // MV ID
  // 针对其他字段您可以继续添加
}
