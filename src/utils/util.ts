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

/**
 * 将毫秒时间戳转换为指定格式的日期字符串
 * @param timestamp - 毫秒级时间戳
 * @param format - 日期格式模板，默认值为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatTimestampToDate(timestamp: number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const date = new Date(timestamp);
  const dateParts: Record<string, string> = {
    YYYY: date.getFullYear().toString(),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0'),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0')
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => dateParts[match] || match);
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
