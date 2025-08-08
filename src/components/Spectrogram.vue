<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen w-screen overflow-hidden absolute"
    @click="toggleSpectrogram">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

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

const { audio, isPlaying, togglePlayPause } = inject('MusicPlayer');

// 响应式数据
const audioData = ref(new Array(128).fill(0));
const smoothedData = ref(new Array(128).fill(0));
const bassIntensity = ref(0);
const inputUrl = ref(props.audioUrl);
const audioUrl = ref(props.audioUrl);
const rotationAngle = ref(0);

// 音频相关
let audioContext = null;
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

// 音频处理函数
const initAudio = async () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // 创建分析器
    analyser = audioContext.createAnalyser();
    analyser.fftSize = props.fftSize;
    analyser.smoothingTimeConstant = 0.85;

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // 连接音频源
    if (!source) {
      source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }
  } catch (error) {
    console.error('分析器初始化失败:', error);
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
  if (isPlaying.value && audio && !audio.paused) {
    analyzeAudio();
    rotationAngle.value = (rotationAngle.value + 2) % 360;
    animationId = requestAnimationFrame(animate);
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

watch(isPlaying, newVal => {
  if (newVal) {
    animate();
  } else {
    resetDataGradually();
  }
});

// 生命周期
onMounted(() => {
  initAudio();
  animate();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
  }

  if (audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value);
  }
});
</script>

<style scoped></style>
