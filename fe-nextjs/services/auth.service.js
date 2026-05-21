"use client";
import api from "../api/axiosConfig";

const AuthService = {
  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).setItem("token", data.accessToken);
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).setItem("user", JSON.stringify(data.user));
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).setItem("userId", data.user?.id ?? "");
    if (typeof document !== "undefined") { document.cookie = `token=${data.accessToken};path=/;max-age=${7*24*3600};SameSite=Lax`; }
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
    if (typeof document !== "undefined") { document.cookie = "token=;path=/;max-age=0"; }
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).removeItem("token");
    (typeof window !== "undefined" ? localStorage : {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}).removeItem("user");
  },
};

export default AuthService;
