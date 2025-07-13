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
  isLoading: Ref<boolean>; // 加载状态
  play: () => void; // 播放音乐
  pause: () => void; // 暂停音乐
  playNext: () => void; // 播放下一首歌曲
  playPrevious: () => void; // 播放上一首歌曲
  togglePlayPause: () => void; // 切换播放/暂停状态
  playMode: Ref<PlayMode>; // 当前播放模式
  setPlayMode: (mode: PlayMode) => void; // 设置播放模式
  audioElement: Ref<HTMLAudioElement>; // 音频元素
  currentTime: Ref<number>; // 当前播放时间
  duration: Ref<number>; // 歌曲总时间
  changeCurrentTime: (currentTime: number) => void; // 改变当前播放时间
  inputCurrentTime: (currentTime: number) => void; // 改变当前播放时间（使用鼠标拖曳时，活动过程实时触发）
  setVolume: (volume: number) => void; // 设置音量
  playSong: (param: Track) => void; // 播放指定的歌曲
  volume: Ref<number>; // 当前音量
  lyricsData: Ref<LyricData>; // 歌词数据
  Loadlyrics: () => Promise<void>; // 加载歌词
  findCurrentLyricIndex: (currentTime: number) => void; // 查找当前歌词索引
  scrollToCurrentLyric: (el1: HTMLElement) => void; // 加载歌词
  currentLyricIndex: Ref<number>; // 当前歌词索引
  scrollStyle: Ref<{ transform: string }>; // 用于滚动歌词的样式
  commenDrawer : Ref<boolean>; // 评论抽屉的显示状态
  commentListData: Ref<Comment[]>; // 评论列表数据
  commenTotal: Ref<number>; // 评论总数
  getCommentPlaylist: (isLoadMore?: boolean) => Promise<void>; // 获取评论列表的方法
  showDrawer : () => void; // 显示评论抽屉
  resetAudio : () => void; // 重置音频
  eqSettings: Ref<{ bass: number; mid: number; treble: number }>; // EQ 设置
  updateEQ: (band: 'bass' | 'mid' | 'treble', value: number) => void; // 更新EQ的方法
  downLoadMusic: (row?: any) => void; // 下载音乐
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

export interface Comment {
  user: CommentUser
  beReplied: any[] // 根据实际情况定义更具体的类型
  commentId: number
  commentLocationType: number
  content: string
  contentResource: any // 根据实际情况定义更具体的类型
  decoration: any // 根据实际情况定义更具体的类型
  expressionUrl: string | null
  grade: any // 根据实际情况定义更具体的类型
  ipLocation: IpLocation
  ip: string | null
  location: string
  liked: boolean
  likedCount: number
  medal?: any // 根据实际情况定义更具体的类型
  detailPage: string
  wearPic: string
  needDisplayTime: boolean
  owner: boolean
  parentCommentId: number
  pendantData?: any // 根据实际情况定义更具体的类型
  repliedMark?: any // 根据实际情况定义更具体的类型
  richContent?: any // 根据实际情况定义更具体的类型
  showFloorComment?: any // 根据实际情况定义更具体的类型
  status: number
  time: number // 时间戳
  timeStr: string
}

interface CommentUser {
  locationInfo: any // 根据实际情况定义更具体的类型
  liveInfo: any // 根据实际情况定义更具体的类型
  anonym: number
  avatarDetail: any // 根据实际情况定义更具体的类型
  userType: number
  avatarUrl: string
  nickname: string
  userId: number
  commonIdentity?: any // 根据实际情况定义更具体的类型
  expertTags?: any // 根据实际情况定义更具体的类型
  followed: boolean
  mutual: boolean
  remarkName?: string // 可选
  socialUserId?: any // 根据实际情况定义更具体的类型
}
interface IpLocation {
  ip: string | null
  location: string
  userId: number
}