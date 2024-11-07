import instance from "./http";
import { isEmptyObject } from "./util";

class Request {
    get(url: string, data: any = {}) {
        if (data && !isEmptyObject(data)) {
            url += '?';
            let arr: string[] = [];
            for (let key in data) {
                arr.push(`${key}=${data[key]}`);
            }
            url += arr.join('&');
        }
        return instance.get(url, {});
    }
}

export const Api = new Request();
