<template>
  <!-- 使用 transition 组件添加动画 -->
  <transition name="login-dialog">
    <div
      v-if="loginDialogVisible"
      class="dialog-overlay"
      @click.self="handleCloseLoginDialog">
      <div class="login-dialog">
        <div class="dialog-body">
          <TabBar v-model="curTab" :tabs="tabs" @change="changeTab" />

          <!-- 二维码登录 -->
          <div v-if="curTab === 'qrcode'" class="dialog-content">
            <!-- 等待扫描 -->
            <template v-if="!scanSuccess">
              <div class="w-[180px] h-[180px] bg-white" v-loading="isQrLoading">
                <img v-if="qrImg" :src="qrImg" alt="二维码" />
              </div>
              <div class="text-base mt-4">
                使用<b class="text-[var(--el-color-primary)]"> 网易云音乐APP </b
                >扫码登录
              </div>
            </template>
            <!-- 扫描成功 -->
            <template v-else>
              <div class="text-center mb-4 flex flex-col items-center">
                <img
                  v-if="avatarUrl"
                  class="w-28 h-28 rounded-[50%] mb-2"
                  :src="avatarUrl"
                  alt="用户头像" />
                <el-icon
                  v-else
                  class="!text-[7rem] !text-[var(--el-color-success)] mb-2"
                  ><SuccessFilled
                /></el-icon>
                <div class="text-xl font-bold mt-2">扫描成功</div>
                <div class="text-base mt-1 text-[var(--button-inactive)]">
                  请在手机上确认登录
                </div>
              </div>
            </template>
          </div>

          <!-- 验证码登录 -->
          <div v-if="curTab === 'phone'" class="dialog-content">
            <el-form :model="loginForm">
              <el-form-item label="手机号">
                <el-input
                  v-model="loginForm.phone"
                  placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="验证码">
                <el-input
                  v-model="loginForm.code"
                  placeholder="请输入验证码"
                  style="width: 60%" />
                <el-button
                  type="primary"
                  size="large"
                  :disabled="isGettingCode"
                  @click="getVerificationCode"
                  style="margin-left: 10px">
                  {{ isGettingCode ? `${countdown}s后重试` : '获取验证码' }}
                </el-button>
              </el-form-item>
            </el-form>

            <el-button
              class="w-1/2 mt-6"
              type="primary"
              size="large"
              @click="handleLogin"
              >登录</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElNotification } from 'element-plus';

// 修改 props 为接收 modelValue
const props = defineProps<{
  modelValue: boolean;
}>();

// 修改 emit 为 update:modelValue
const emit = defineEmits(['update:modelValue', 'loginSuccess']);

// 使用 modelValue 初始化登录对话框可见状态
const loginDialogVisible = ref(props.modelValue);

// 监听 props.modelValue 变化，同步到 loginDialogVisible
watch(
  () => props.modelValue,
  async newValue => {
    loginDialogVisible.value = newValue;
    if (newValue) {
      scanSuccess.value = false;
      avatarUrl.value = '';
      curTab.value = 'phone';
      isQrLoading.value = true;
      !uniKey.value && (await getQrKey());
      createQrCode();
    } else {
      clearInterval(qrInterval);
      qrInterval = null;
    }
  }
);

onMounted(() => {});

const changeTab = (tab: string) => {
  if (tab == 'qrcode') {
    checkQrCodeInterval();
  } else {
    clearInterval(qrInterval);
  }
};

const isQrLoading = ref(true);
const uniKey = ref('');
const getQrKey = async () => {
  const res: any = await Api.get('/login/qr/key');
  if (res.code == 200) {
    uniKey.value = res.data?.unikey || '';
  }
};

let qrInterval: any = null;
const qrImg = ref('');
const createQrCode = async () => {
  isQrLoading.value = true;
  const res: any = await Api.get('/login/qr/create', {
    key: uniKey.value,
    qrimg: true,
  });
  if (res.code == 200) {
    qrImg.value = res.data?.qrimg || '';
    isQrLoading.value = false;
    checkQrCodeInterval();
  }
};

const checkQrCodeInterval = () => {
  clearInterval(qrInterval);
  if (loginDialogVisible.value && curTab.value == 'qrcode') {
    qrInterval = setInterval(() => {
      checkQrCode();
    }, 3000);
  }
};

const scanSuccess = ref(false);
const avatarUrl = ref('');
const checkQrCode = async () => {
  const res: any = await Api.get('/login/qr/check', { key: uniKey.value });
  // 800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功
  switch (res.code) {
    case 800: //二维码过期
      createQrCode();
      break;
    case 801: //等待扫码
      document.cookie = res.cookie;
      // Cookies.set('NMTID', res.cookie);
      break;
    case 802: //待确认
      console.log('扫描成功，请在手机上确认登录');
      document.cookie = res.cookie;
      avatarUrl.value = res.avatarUrl || '';
      scanSuccess.value = true;
      break;
    case 803: //授权登录成功
      console.log('登录成功');
      break;
  }
};

const curTab = ref<string>('qrcode');
const tabs = ref<Array<any>>([
  {
    label: '二维码登录',
    name: 'qrcode',
  },
  {
    label: '验证码登录',
    name: 'phone',
  },
]);

const loginForm = ref({
  phone: '',
  code: '',
});
const isGettingCode = ref(false);
const countdown = ref(60);
let timer: any = null;

const handleCloseLoginDialog = () => {
  // 触发 update:modelValue 事件更新外部 v-model 值
  emit('update:modelValue', false);
};

const getVerificationCode = async () => {
  if (!/^1[3-9]\d{9}$/.test(loginForm.value.phone)) {
    ElNotification.warning('请输入有效的手机号');
    return;
  }
  const res: any = await Api.get('/captcha/sent', {
    phone: loginForm.value.phone,
  });
  if (res.code == 200) {
    isGettingCode.value = true;
    timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        clearInterval(timer);
        isGettingCode.value = false;
        countdown.value = 60;
      }
    }, 1000);
  }
};

const handleLogin = async() => {
  if (!loginForm.value.phone || !loginForm.value.code) {
    ElNotification.warning('请输入手机号和验证码');
    return;
  }
  const res: any = await Api.get('/login/cellphone', {
    phone: loginForm.value.phone,
    captcha: loginForm.value.code,
  });
  if (res.code == 200) {
    console.log(res.data);
    ElNotification.success('登录成功');
    emit('loginSuccess', loginForm.value);
    handleCloseLoginDialog();
  }
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.login-dialog {
  background-color: var(--theme-bg-color);
  border-radius: 20px; /* 增大圆角 */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); /* 增强阴影 */
  width: 420px; /* 适当增大宽度 */
  overflow: hidden; /* 防止内容溢出 */
}

.dialog-body {
  .dialog-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    padding: 30px 50px;
    background: var(--theme-bg-color);
  }
}

.el-form-item {
  display: flex;
  align-items: center;
  --el-text-color-regular: #fff;
}

.el-input {
  flex: 1;
  overflow: hidden;
  --el-input-height: 40px;
  --el-input-border-color: var(--search-bg);
  --el-input-hover-border-color: var(--border-color);
  --el-input-focus-border-color: var(--border-color);
  --el-input-bg-color: var(--search-bg);
  --el-input-text-color: var(--theme-color);
}

/* 登录对话框动画 */
.login-dialog-enter-active,
.login-dialog-leave-active {
  transition: all 0.3s ease;
  .login-dialog {
    transition: all 0.3s ease;
  }
}

.login-dialog-enter-from {
  opacity: 0;
  .login-dialog {
    transform: scale(0.8);
  }
}

.login-dialog-leave-to {
  opacity: 0;
  .login-dialog {
    transform: scale(0.8);
  }
}
</style>
