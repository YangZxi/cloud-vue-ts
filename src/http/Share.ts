import http, {alertErrMsg, API, axios} from "./Axios"
import {InternalAxiosRequestConfig, AxiosResponse} from 'axios'
import $router from '@/router/index'
import {sharePinia} from '@/store/share'
import {download as DL} from "@/utils/Tools"
import {SERVER_DOWNLOAD, SERVER_PREVIEW} from "./API"


/**
 * 创建分享链接
 */
export const createShare = (data: any) => {
  return http.post(API("/share/create"), data).then((res) => {
    if (res.code == 200) {
      return res.data;
    }
  });
}

/**
 * 获取当前用户的分享列表
 */
export const listShare = () => {
  return http.get(API("/share/list")).then((res) => {
    if (res.code == 200) {
      return res.data;
    }
  });
}

/**
 * 更新分享的资源
 */
export const updateShare = (data: any) => {
  return http.post(API("/share/update"), data).then((res) => {
    if (res.code == 200) {
      return res.data;
    }
  });
}

/**
 * 删除分享
 */
export const deleteShare = (id: number) => {
  return http.get(API(`/share/delete/${id}`)).then((res) => {
    if (res.code == 200) {
      return res.data;
    }
  });
}



/**
 * 以下是分享界面的 API
 */




export const instance = axios.create({
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  }
});

// 请求是否带上cookie
instance.defaults.withCredentials = false;
// 添加请求拦截器
instance.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    config.headers["Authorization"] = "Bearer " + (sharePinia().token || "");
    return config;
  }
);

// 添加响应拦截器
instance.interceptors.response.use(
  function (response: AxiosResponse) {
    // 对响应数据做点什么
    if (response.data.code === 200) {
      return response.data;
    } else {
      alertErrMsg(response);
      return Promise.reject(response);
    }
  },
  function (error) {
    // 如果是登录过期或没有通过认证
    if (error.response.status == 401) {
      // 删除token
      sharePinia().clearToken();
      // $router.push({
      //   name: "Share",
      //   params: {
      //     // msg: data.msg
      //   }
      // })
      $router.go(0);
    }
    alertErrMsg(error.response);
    return Promise.reject(error.response);
  }
);


/**
 * 根据分享 id 获取分享内容
 * @param id 
 * @param password 
 * @returns Promise
 */
 export const pass = (id: string, password: string, option: any = {}) => {
  if (password == null) {
    option.show = false;
  }
  return instance.post(API("/public/pass"), {id, password}, option).then((res: any) => {
    if (res.code == 200 && res.token) {
      sharePinia().setToken(id, res.token);
    } else {
      return Promise.reject(res);
    }
    return res;
  });
}

/**
 * 根据分享 id 获取分享内容
 * @param id 
 * @returns Promise
 */
export const getShareInfo = (id: string, path: string) => {
  return instance.post(API("/public/shareInfo"), { id, path }).then((res: any) => {
    if (res.code == 200) {
      return res.data;
    }
  });
}

function getLink(id: string, path: string) {
  return instance.post(API(`/public/link`), {
    resourceId: id, path
  }).then(res => res.data);
}

export const download = (id: string, path: string) => {
  return getLink(id, path).then((url) => {
    if (!url.startsWith("http")) {
      url = `${SERVER_DOWNLOAD}${url}`;
    }
    DL(url);
  });
}

export const preview = (id: string, path: string) => {
  return getLink(id, path).then(url => {
    console.log(url);
    if (!url.startsWith("http")) {
      url = `${SERVER_PREVIEW}${url}`;
    }
    return url;
  });
}

export default {
  createShare,
  pass,
  getShareInfo,
  download,
  preview
}