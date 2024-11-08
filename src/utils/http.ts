import axios from "axios";
import { useUserStore } from "../stores/user";
const userStore = useUserStore();

export const http = axios.create({
  // baseURL: "http://47.100.198.147:7001/api",
  // baseURL: "http://3979c592.r11.cpolar.top/api",
  // baseURL: "http://192.168.31.43:8000",
  // baseURL: "http://192.168.31.43:8000",
  timeout:5000
});
// 添加请求拦截器
http.interceptors.request.use(
  (config) => {
    // 携带token
    // if (userStore.user.token !== "") {
    //   config.headers["Authorization"] = userStore.user.token;
    // }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);
// 添加响应拦截器
http.interceptors.response.use(
  (response) => {
    if (response.data.code === 11401) {
      userStore.logout();
      window.location.href = "/";
    }
    // 2xx 范围内的状态码触发该函数。
    return response.data;
  },
  (error) => {
    // 超出 2xx 范围的状态码触发该函数。
    return Promise.reject(error);
  }
);
