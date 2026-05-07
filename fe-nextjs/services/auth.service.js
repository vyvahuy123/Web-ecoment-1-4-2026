"use client";
import api from "../api/axiosConfig";

const AuthService = {
  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).setItem("token", data.accessToken);
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).setItem("user", JSON.stringify(data.user));
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).setItem("userId", data.user?.id ?? "");
    return data;
  },
  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).setItem("token", data.accessToken);
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).setItem("user", JSON.stringify(data.user));
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).setItem("userId", data.user?.id ?? "");
    return data;
  },
  refresh: async (accessToken) => {
    const { data } = await api.post("/auth/refresh", { accessToken });
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).setItem("token", data.accessToken);
    return data;
  },
  logout: async () => {
    await api.post("/auth/logout");
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).removeItem("token");
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).removeItem("user");
  },
};

export default AuthService;
