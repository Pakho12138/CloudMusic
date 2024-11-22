import type { Params } from '@/hooks/interface';

// 检测是否为空对象
export function isEmptyObject(obj: any): boolean {
  if (obj == null || !/^(object|function)$/.test(typeof obj)) return false;
  let keys = Object.getOwnPropertyNames(obj);
  if (typeof Symbol !== 'undefined') keys = keys.concat(Object.getOwnPropertySymbols(obj) as any);
  return keys.length === 0;
}

export function calculatePagination(params: Params, defaultLimit = 30) {
  const limit = params.limit || defaultLimit;
  const offset = ((params.offset || 1) - 1) * limit;
  return { limit, offset };
}

// 格式化数字函数，将数字转换为易读的字符串（如 1.5万）
export function formatNumber(num: number): string {
  if (num < 10000) {
    return num.toString(); // 直接返回小于10000的数字
  } else if (num < 100000) {
    const formatted = (num / 10000).toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) + '万' : formatted + '万'; // 处理 1.0万 和 1.5万
  } else {
    return (num / 10000).toFixed(0) + '万'; // 对于大于或等于100000的数字，直接显示为整数的万
  }
}

export function formatMillisecondsToTime(totalMilliseconds: number) {
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map(n => (n < 10 ? `0${n}` : n.toString()))
    .filter((val, index) => val !== '00' || index > 0) // 移除开头的"00"小时
    .join(':');
}
