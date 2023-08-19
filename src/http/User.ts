import { user } from "@/store/user"
import http, { API } from "@/http/Axios"

const store = user();

export const login = (username: string, password: string) => {
  return store.login({ username, password });
}

export function info() {
  return store.info();
}

export function updatePassowrd(newPassword: string) {
  return http.post(API("/user/password"), {
    newPassword
  }).then(res => {
    if (res.code == 200) {
      window.$message.success(res.msg);
      return res.data;
    }
  });
}