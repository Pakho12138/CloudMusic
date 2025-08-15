<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen w-screen overflow-hidden absolute">
    <Icon
      icon="iconamoon:close-bold"
      class="absolute top-4 right-4 text-5xl text-[--button-inactive] hover:text-[--button-hover] can-click"
      @click="toggleSpectrogram" />
    <!-- 主可视化器容器 -->
    <div class="relative z-10">
      <!-- 外层彩虹发光环 -->
      <div
        class="absolute inset-0 rounded-full transition-all duration-300 ease-out"
        :style="{
          background: `conic-gradient(
            from ${rotationAngle}deg,
            hsl(0, 80%, ${50 + bassIntensity * 30}%) 0deg,
            hsl(60, 80%, ${50 + bassIntensity * 30}%) 60deg,
            hsl(120, 80%, ${50 + bassIntensity * 30}%) 120deg,
            hsl(180, 80%, ${50 + bassIntensity * 30}%) 180deg,
            hsl(240, 80%, ${50 + bassIntensity * 30}%) 240deg,
            hsl(300, 80%, ${50 + bassIntensity * 30}%) 300deg,
            hsl(360, 80%, ${50 + bassIntensity * 30}%) 360deg
          )`,
          filter: 'blur(40px)',
          transform: `scale(${1.3 + bassIntensity * 0.15})`,
          opacity: isPlaying ? 0.3 : 0.2,
        }" />

      <!-- 玻璃容器 -->
      <div
        class="relative bg-black/20 backdrop-blur-xl rounded-full p-6 border border-white/20 shadow-2xl"
        @click.stop="togglePlayPause">
        <svg width="500" height="500" class="drop-shadow-2xl">
          <!-- 定义渐变和滤镜 -->
          <defs>
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(255, 255, 255, 0.8)" />
              <stop offset="50%" stop-color="rgba(100, 200, 255, 0.6)" />
              <stop offset="100%" stop-color="rgba(255, 100, 200, 0.4)" />
            </radialGradient>

            <filter id="glow">
              <!-- <feGaussianBlur stdDeviation="1" result="coloredBlur" /> -->
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <!-- 背景同心圆 -->
          <circle
            v-for="radius in [200, 160, 120]"
            :key="radius"
            cx="250"
            cy="250"
            :r="radius"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            stroke-width="0.5"
            stroke-dasharray="5,5" />

          <!-- 振幅条 -->
          <g filter="url(#glow)">
            <g v-for="(amplitude, i) in smoothedData" :key="i">
              <!-- 发光底层 -->
              <line
                :x1="centerX + Math.cos(getAngle(i)) * innerRadius"
                :y1="centerY + Math.sin(getAngle(i)) * innerRadius"
                :x2="
                  centerX +
                  Math.cos(getAngle(i)) *
                    (innerRadius + amplitude * maxBarLength)
                "
                :y2="
                  centerY +
                  Math.sin(getAngle(i)) *
                    (innerRadius + amplitude * maxBarLength)
                "
                :stroke="getBarColor(i, amplitude, 20)"
                :stroke-width="2 + amplitude * 4 + 2"
                stroke-linecap="round"
                :opacity="0.3" />
              <!-- 主体 -->
              <line
                :x1="centerX + Math.cos(getAngle(i)) * innerRadius"
                :y1="centerY + Math.sin(getAngle(i)) * innerRadius"
                :x2="
                  centerX +
                  Math.cos(getAngle(i)) *
                    (innerRadius + amplitude * maxBarLength)
                "
                :y2="
                  centerY +
                  Math.sin(getAngle(i)) *
                    (innerRadius + amplitude * maxBarLength)
                "
                :stroke="getBarColor(i, amplitude)"
                :stroke-width="2 + amplitude * 4"
                stroke-linecap="round"
                :opacity="0.3" />
            </g>
          </g>

          <!-- 中心圆环 -->
          <g>
            <!-- 外圈脉冲 -->
            <circle
              cx="250"
              cy="250"
              :r="midRadius + 10"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              stroke-width="1"
              :opacity="avgAmplitude * 0.8"
              :stroke-dasharray="`${avgAmplitude * 10} ${
                5 - avgAmplitude * 3
              }`" />

            <!-- 中圈渐变 -->
            <circle
              cx="250"
              cy="250"
              :r="midRadius"
              fill="none"
              stroke="url(#centerGradient)"
              stroke-width="2"
              :opacity="0.7 + avgAmplitude * 0.3" />

            <!-- 内圈低频脉冲 -->
            <circle
              cx="250"
              cy="250"
              :r="bassRadius"
              fill="rgba(255, 100, 50, 0.1)"
              :stroke="`hsl(${15 + bassIntensity * 45}, 90%, ${
                60 + bassIntensity * 20
              }%)`"
              stroke-width="3"
              :opacity="0.6 + bassIntensity * 0.4" />
          </g>

          <!-- 中心核心 -->
          <circle
            cx="250"
            cy="250"
            :r="12 + bassIntensity * 8"
            fill="url(#centerGradient)"
            opacity="0.9">
            <animate
              attributeName="r"
              :values="`${12 + bassIntensity * 8};${16 + bassIntensity * 12};${
                12 + bassIntensity * 8
              }`"
              dur="1s"
              repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="mt-8 space-y-6 z-10 relative">
      <!-- 音频URL输入 -->
      <div
        v-if="!audioUrl"
        class="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 w-[450px]">
        <input
          v-model="inputUrl"
          @keyup.enter="loadAudio"
          type="url"
          placeholder="输入音频文件URL或选择本地文件"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-cyan-400 focus:bg-white/15 transition-all duration-300" />
        <div class="flex gap-3 mt-3">
          <button
            @click="loadAudio"
            :disabled="!inputUrl.trim()"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100">
            加载音频
          </button>
          <label
            class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 cursor-pointer text-center">
            选择文件
            <input
              type="file"
              accept="audio/*"
              @change="handleFileSelect"
              class="hidden" />
          </label>
        </div>
      </div>

      <!-- 主控按钮 -->
      <div class="flex justify-center">
        <button
          @click="togglePlayback"
          :disabled="!audioUrl"
          :class="`
            relative group px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-105
            ${
              isPlaying
                ? 'bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600'
            }
            shadow-xl text-white overflow-hidden
            ${!audioUrl ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}
          `">
          <!-- 按钮背景动画 -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          <div class="flex items-center space-x-3 relative z-10">
            <div v-if="isPlaying" class="w-6 h-6 flex space-x-1">
              <div class="w-2 h-6 bg-white rounded-sm animate-pulse"></div>
              <div
                class="w-2 h-6 bg-white rounded-sm animate-pulse"
                style="animation-delay: 0.2s"></div>
            </div>
            <div v-else class="w-6 h-6 relative">
              <div
                class="absolute left-1 w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
            </div>
            <span>{{ isPlaying ? '暂停播放' : '开始播放' }}</span>
          </div>
        </button>
      </div>

      <!-- 音频信息 -->
      <div
        v-if="audioUrl"
        class="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center w-[450px]">
        <div class="text-white/80 text-sm mb-2">当前音频</div>
        <div class="text-white/60 text-xs break-all mb-3">
          {{ getAudioName() }}
        </div>
        <button
          @click="clearAudio"
          class="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs transition-colors duration-200">
          更换音频
        </button>
      </div>

      <!-- 状态指示器 -->
      <!-- <div class="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
        <div class="flex justify-center space-x-8 text-sm">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
            <span class="text-white/80">低频 (红-橙-黄)</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500"></div>
            <span class="text-white/80">中频 (绿-青-蓝)</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
            <span class="text-white/80">高频 (紫-粉-红)</span>
          </div>
        </div>
        
        <div class="mt-3 text-center">
          <div class="text-white/60 text-xs mb-2">
            {{ isPlaying ? '实时音频分析' : audioUrl ? '准备就绪' : '等待加载音频' }}
          </div>
          <div class="flex justify-center space-x-4 text-xs">
            <div class="bg-red-500/20 px-2 py-1 rounded">
              低频: {{ Math.round(bassIntensity * 100) }}%
            </div>
            <div class="bg-green-500/20 px-2 py-1 rounded">
              总强度: {{ Math.round(avgAmplitude * 100) }}%
            </div>
            <div class="bg-blue-500/20 px-2 py-1 rounded">
              频段: 128
            </div>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Icon } from '@iconify/vue';

// Props
const props = defineProps({
  audioUrl: {
    type: String,
    default: '',
  },
  fftSize: {
    type: Number,
    default: 256,
  },
});

// Emit事件
const emit = defineEmits(['playing', 'paused', 'loaded', 'error']);

const toggleSpectrogram = inject('toggleSpectrogram');

const { pause } = inject('MusicPlayer');

// 响应式数据
const isPlaying = ref(false);
const audioData = ref(new Array(128).fill(0));
const smoothedData = ref(new Array(128).fill(0));
const bassIntensity = ref(0);
const inputUrl = ref(props.audioUrl);
const audioUrl = ref(props.audioUrl);
const rotationAngle = ref(0);

// 音频相关
let audioContext = null;
let audioElement = null;
let analyser = null;
let dataArray = null;
let source = null;
let animationId = null;
let resetAnimationId = null; // 添加重置动画ID
const previousDataRef = ref(new Array(128).fill(0));

// 常量
const centerX = 250;
const centerY = 250;
const innerRadius = 80;
const maxBarLength = 120;

// 计算属性
const avgAmplitude = computed(() => {
  return (
    smoothedData.value.reduce((a, b) => a + b, 0) / smoothedData.value.length
  );
});

const bassRadius = computed(() => {
  return 45 + bassIntensity.value * 25;
});

const midRadius = computed(() => {
  return 65 + avgAmplitude.value * 15;
});

// 工具函数
const getAngle = index => {
  return (index / smoothedData.value.length) * Math.PI * 2 - Math.PI / 2;
};

const getBarColor = (index, amplitude, lightnessOffset = 0) => {
  const frequency = index / smoothedData.value.length;
  const hue = frequency * 360;
  const saturation = 85 + amplitude * 15;
  // const lightness = 50 + amplitude * 35 + lightnessOffset;
  const lightness = 50;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const getAudioName = () => {
  if (!audioUrl.value) return '';
  if (audioUrl.value.startsWith('blob:')) return '本地文件';
  return audioUrl.value.split('/').pop() || audioUrl.value;
};

// 音频处理函数
const initAudio = async () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // 创建音频元素
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }

    audioElement = new Audio();
    audioElement.crossOrigin = 'anonymous';
    audioElement.src = audioUrl.value;

    // 创建分析器
    analyser = audioContext.createAnalyser();
    analyser.fftSize = props.fftSize;
    analyser.smoothingTimeConstant = 0.85;

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // 连接音频源
    if (source) {
      source.disconnect();
    }
    source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // 音频事件监听
    audioElement.addEventListener('loadeddata', () => {
      emit('loaded', audioElement);
    });

    audioElement.addEventListener('error', e => {
      emit('error', e);
      console.error('音频加载失败:', e);
    });

    audioElement.load();
  } catch (error) {
    console.error('音频初始化失败:', error);
    emit('error', error);
  }
};

const analyzeAudio = () => {
  if (!analyser || !dataArray) return;

  analyser.getByteFrequencyData(dataArray);

  // 将256个频段压缩到128个
  const newData = new Array(128).fill(0);
  for (let i = 0; i < 128; i++) {
    const start = Math.floor((i * dataArray.length) / 128);
    const end = Math.floor(((i + 1) * dataArray.length) / 128);
    let sum = 0;
    for (let j = start; j < end; j++) {
      sum += dataArray[j];
    }
    newData[i] = sum / (end - start) / 255;
  }

  audioData.value = newData;

  // 计算低频强度
  const bassSum = newData.slice(0, 16).reduce((a, b) => a + b, 0);
  bassIntensity.value = bassSum / 16;

  // 数据平滑处理
  smoothData(newData);
};

const smoothData = newData => {
  const smoothingFactor = 0.15;
  const smoothed = previousDataRef.value.map(
    (prev, i) => prev + (newData[i] - prev) * smoothingFactor
  );
  previousDataRef.value = smoothed;
  smoothedData.value = smoothed;
};

const animate = () => {
  if (isPlaying.value && audioElement && !audioElement.paused) {
    analyzeAudio();
    rotationAngle.value = (rotationAngle.value + 2) % 360;
    animationId = requestAnimationFrame(animate);
  }
};

// 控制函数
const loadAudio = async () => {
  if (!inputUrl.value.trim()) return;

  audioUrl.value = inputUrl.value.trim();
  await nextTick();
  await initAudio();
};

const handleFileSelect = event => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('audio/')) {
    const objectUrl = URL.createObjectURL(file);
    audioUrl.value = objectUrl;
    inputUrl.value = file.name;
    nextTick(() => {
      initAudio();
    });
  }
};

const clearAudio = () => {
  if (isPlaying.value) {
    togglePlayback();
  }

  if (audioElement) {
    audioElement.pause();
    audioElement.src = '';
  }

  if (audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value);
  }

  audioUrl.value = '';
  inputUrl.value = '';

  // 重置数据
  audioData.value = new Array(128).fill(0);
  smoothedData.value = new Array(128).fill(0);
  bassIntensity.value = 0;
  previousDataRef.value = new Array(128).fill(0);
};

const togglePlayback = async () => {
  if (!audioElement || !audioUrl.value) return;

  try {
    if (isPlaying.value) {
      audioElement.pause();
      isPlaying.value = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      emit('paused');
    } else {
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      await audioElement.play();
      isPlaying.value = true;
      animate();
      emit('playing');
    }
  } catch (error) {
    console.error('播放控制失败:', error);
    emit('error', error);
  }
};

// 添加渐进式数据重置函数
const resetDataGradually = () => {
  let isComplete = true;

  // 渐进式降低所有频率数据
  const newSmoothed = smoothedData.value.map(val => {
    const reduced = val * 0.8; // 每帧降低20%
    if (Math.abs(reduced) > 0.01) isComplete = false;
    return reduced;
  });

  const newPrevious = previousDataRef.value.map(val => val * 0.8);
  const newBass = bassIntensity.value * 0.8;

  // 更新响应式数据
  smoothedData.value = newSmoothed;
  previousDataRef.value = newPrevious;
  bassIntensity.value = newBass;

  // 如果未完成，继续下一帧动画
  if (!isComplete) {
    resetAnimationId = requestAnimationFrame(resetDataGradually);
  } else {
    // 最终确保所有值归零
    smoothedData.value = new Array(128).fill(0);
    previousDataRef.value = new Array(128).fill(0);
    bassIntensity.value = 0;
    resetAnimationId = null;
  }
};

const cleanup = () => {
  if (source) {
    source.disconnect();
    source = null;
  }
  if (analyser) {
    analyser.disconnect();
    analyser = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
};

watch(isPlaying, newVal => {
  if (newVal) {
    animate();
  } else {
    resetDataGradually();
  }
});

// 生命周期
onMounted(() => {
  pause();
  initAudio();
  animate();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  cleanup();

  if (audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value);
  }
});
</script>

<style scoped></style>
