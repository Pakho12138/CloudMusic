import axios from 'axios';
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { ElNotification } from 'element-plus';
// 自定义axios示例
const instance: AxiosInstance = axios.create({
  // baseURL: 'https://cloud-music-api-nevermore.vercel.app', // 接口前缀地址
  // baseURL: 'https://cloud-music-api.netlify.app', // 接口前缀地址
  baseURL: 'https://163api.qijieya.cn/', // 接口前缀地址
  timeout: 1000 * 10, // 接口超时时间  10秒
});
// 添加请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.params === undefined) {
      config.params = {};
    }
    // 添加或修改params
    Object.assign(config.params, {
      timestamp: Date.now(),
      realIP: '116.25.146.177',
    });
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
// 添加响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message } = response.data;
    if ([200, 800, 801, 802, 803].includes(code)) {
      return response.data;
    }
    message && ElNotification.error(message);
    return message ? Promise.reject(new Error(message)) : response.data;
  },
  (error: AxiosError) => {
    let message = '';
    const status = error.response?.status;
    switch (status) {
      case 401:
        message = 'token失效，请重新登录';
        // 这里写退出登录逻辑
        break;
      case 404:
        message = '请求地址错误';
        break;
      case 500:
        message = '服务器繁忙';
        break;
      default:
        message = '请求失败';
    }
    message && ElNotification.error(message);
    return Promise.reject(error);
  }
);
export default instance;
