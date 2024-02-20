import { axios } from "./Axios"
import API, { SERVER_BASE } from "./API"

const instance = axios.create({
  baseURL: SERVER_BASE,
});

type FileType = {
  id: number,
  createTime: string,
  propKey: string,
  propValue: string,
  type: "FILE_TYPE"
}

/**
 * 获取文件类型配置
 * @returns Promise
 */
export const filetype = () => {
  return instance.get(`/api/props/filetype`).then(res => {
    const type: Record<string, string> = {};
    (res.data.data as Array<FileType>).forEach(el => {
      const key = el.propKey.replaceAll("filetype_", "");
      type[key] = el.propValue;
    });
    return type;
  });
}

export default {
  filetype,
}
