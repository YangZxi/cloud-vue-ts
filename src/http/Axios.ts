import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import $router from '@/router/index'
import { user } from '@/store/user'
import API from "./API"
import { createDiscreteApi } from 'naive-ui';
import { decrypt, encrypt } from "@/utils/Cryptor";

import {
  SERVER_BASE, SERVER_API
} from "./API"

import type { Method } from 'axios'

type RespBody = {
  code: number,
  msg: string,
  data: any,
  error?: string
}

type YAxiosResponse = AxiosResponse<RespBody>;

const { loadingBar } = createDiscreteApi(
  ["loadingBar"],
);

const instance = axios.create({
  baseURL: SERVER_BASE,
});

// 请求是否带上cookie
instance.defaults.withCredentials = false;
// 添加请求拦截器
function requestInterceptor(config: InternalAxiosRequestConfig) {
  // 在发送请求之前做些什么
  // 添加此之前添加Token
  // console.log(store.state.token)
  if (isMyApi(config.url)) {
    if (!config.headers["Authorization"]) {
      config.headers["Authorization"] = "Bearer " + user().token;
    }
  }
  return config;
}
instance.interceptors.request.use(
  requestInterceptor,
  // function (config: YAxiosRequestConfig) {
    // alert(1)
  // }
);

type RES_CODE_TYPE = {
  [code: string]: string
}
const RES_CODE: RES_CODE_TYPE =  {
  "401": "授权过期",
  "403": "权限不足，本次请求被拒绝",
}

// 添加响应拦截器
instance.interceptors.response.use(
  function (response: AxiosResponse) {
    // 对响应数据做点什么
    console.log(response);
    if (response.headers["content-type"] === "application/json") {
      if (response.data.code === 200) {
        return response.data
      } else {
        return Promise.reject(response);
      }
    } else {
      return response.data;
    }
  },
  function (error) {
    // 对响应错误做点什么
    // 如果不是请求自己API的请求，将进行跳过
    if (!isMyApi(error.response.config.url)) {
      return Promise.reject(error.response);
    }
    // 如果是登录过期或没有通过认证
    if (error.response.status === 401) {
      logout();
    }
    // console.log(error.response)
    // 如果服务端传了消息，则使用后台的消息提醒
    return Promise.reject(error.response);
  }
);

const msgCache: { [key: string]: string } = {};

function alertErrMsg(err: YAxiosResponse) {
  if (!err.data) return;
  if (err.data && err.data.code == 200) return;
  const url = err.config.url || "";
  if (msgCache[url]) return;
  msgCache[url] = url;
  setTimeout(() => { delete msgCache[url] }, 1000);
  if (err.data!.msg) window.$message.warning(err.data.msg);
  else if (err.data!.error) window.$message.warning(err.data.error);
  else window.$message.warning(RES_CODE[err.status]);
}


/**
 * 判断是否我们自己的接口
 * @param {String} url
 */
function isMyApi(url: String = ""): boolean {
  if (url.indexOf("http") === 0) {
    return url.indexOf(SERVER_BASE) === 0;
  } else {
    return true;
  }
}

/**
 * 退出登录方法
 */
function logout() {
  // 删除token
  user().logout();
  // 跳转至登录界面
  $router.push({
    name: "Login",
    params: {
      // msg: data.msg
    }
  });
}

type Option = {
  headers?: object,
  hiddenMsg?: boolean,
  encrypt?: boolean,
  decrypt?: boolean
}

function request(method: Method, url: string, data: any, option: Option = {}): Promise<RespBody> {
  // 如果要展示页面提醒
  // if (isShow) headers["Show-Time"] = "Hello";
  loadingBar.start();
  if (option.encrypt && method !== "GET") {
    data = {
      data: encrypt(data)
    }
  }
  // @ts-ignore
  return instance({
    method: method,
    url: url,
    data: data !== "GET" ? data : null,
    // data: method === 'POST' || method === 'PUT' ? data : null,
    params: method === "GET" ? data : null,
    // `headers` 是即将被发送的自定义请求头
    headers: Object.assign({
      "Content-Type": "application/json;charset=UTF-8"
    }, option.headers),
    hiddenMsg: !!option.hiddenMsg
  })
  .then((data: any) => {
    loadingBar.finish();
    if (option.decrypt) {
      data.data = decrypt(data.data);
    }
    return data;
  }).catch((err: YAxiosResponse) => {
    // 将错误往方法调用的页面传
    if (!option.hiddenMsg) {
      alertErrMsg(err);
    }
    loadingBar.error();
    return Promise.reject(err.data ? err.data : { code: err.status, msg: "请求出错，请联系管理员", data: null });
  });
}

export { axios, API, isMyApi, alertErrMsg, requestInterceptor }

export type { RespBody }

export default {

  "get": (url: string, data?: any, option?: Option) => {
    return request("GET", url, data, option);
  },
  "post": (url: string, data?: any, option?: Option) => {
    return request("POST", url, data, option);
  },
  "put": (url: string, data: any, option?: Option) => {
    return request("PUT", url, data, option);
  },
  "delete": (url: string, data: any, option?: Option) => {
    return request("DELETE", url, data, option);
  },
  "upload": (url: string, data: any, option?: Option) => {
    return request("POST", url, data, {
      ...option,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
  },

}
