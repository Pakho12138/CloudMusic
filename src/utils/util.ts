// 检测是否为空对象
export function isEmptyObject(obj: any): boolean {
    if (obj == null || !/^(object|function)$/.test(typeof obj)) return false;
    let keys = Object.getOwnPropertyNames(obj);
    if (typeof Symbol !== 'undefined') keys = keys.concat(Object.getOwnPropertySymbols(obj) as any);
    return keys.length === 0;
}