<template>
  <!-- 使用 transition 组件添加动画 -->
  <transition name="login-dialog">
    <div
      v-if="loginDialogVisible"
      class="dialog-overlay"
      @click.self="handleCloseLoginDialog">
      <div class="custom-login-dialog">
        <div class="dialog-body">
          <TabBar v-model="curTab" :tabs="tabs" />

          <!-- 二维码登录 -->
          <div v-if="curTab === 'qrcode'" class="dialog-content">
            二维码登录
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
                  :disabled="isGettingCode"
                  @click="getVerificationCode"
                  style="margin-left: 10px">
                  {{ isGettingCode ? `${countdown}s后重试` : '获取验证码' }}
                </el-button>
              </el-form-item>
            </el-form>

            <el-button type="primary" @click="handleLogin">登录</el-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';

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
  newValue => {
    loginDialogVisible.value = newValue;
  }
);

const curTab = ref<string>('phone');
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
let timer: NodeJS.Timeout | null = null;

const handleCloseLoginDialog = () => {
  // 触发 update:modelValue 事件更新外部 v-model 值
  emit('update:modelValue', false);
};

const getVerificationCode = () => {
  if (!/^1[3-9]\d{9}$/.test(loginForm.value.phone)) {
    ElMessage.warning('请输入有效的手机号');
    return;
  }
  isGettingCode.value = true;
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer as NodeJS.Timeout);
      isGettingCode.value = false;
      countdown.value = 60;
    }
  }, 1000);
  // 这里添加实际获取验证码的 API 调用
  console.log('发送验证码到', loginForm.value.phone);
};

const handleLogin = () => {
  if (!loginForm.value.phone || !loginForm.value.code) {
    ElMessage.warning('请输入手机号和验证码');
    return;
  }
  // 这里添加实际的登录 API 调用
  console.log('登录信息', loginForm.value);
  emit('loginSuccess', loginForm.value);
  handleCloseLoginDialog();
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

.custom-login-dialog {
  background-color: var(--theme-bg-color);
  border-radius: 20px; /* 增大圆角 */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); /* 增强阴影 */
  width: 420px; /* 适当增大宽度 */
  overflow: hidden; /* 防止内容溢出 */
}

.dialog-body {
  .dialog-content {
    height: 300px;
    padding: 30px;
    background: var(--theme-bg-color);
  }
}

/* 登录对话框动画 */
.login-dialog-enter-active,
.login-dialog-leave-active {
  transition: all 0.3s ease;
}

.login-dialog-enter-from,
.login-dialog-leave-to {
  opacity: 0;
}

.login-dialog-enter-from .dialog-overlay,
.login-dialog-leave-to .dialog-overlay {
  opacity: 0;
}

.login-dialog-enter-to .dialog-overlay,
.login-dialog-leave-from .dialog-overlay {
  opacity: 1;
}
</style>
