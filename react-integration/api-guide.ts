// ============================================================
// REACT INTEGRATION GUIDE
// Cách gọi API từ React với Axios + JWT + Refresh Token
// ============================================================

// 1. CÀI ĐẶT
// npm install axios

// ─────────────────────────────────────────────────────────────
// src/lib/apiClient.ts  - Axios instance với auto-refresh token
// ─────────────────────────────────────────────────────────────
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Lưu accessToken trong memory (KHÔNG dùng localStorage - dễ bị XSS)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => { accessToken = token; };
export const getAccessToken = () => accessToken;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Quan trọng: gửi httpOnly cookie (refreshToken) theo mỗi request
});

// Interceptor: tự động đính kèm accessToken vào header
apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Interceptor: tự động refresh khi nhận 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Đang refresh - queue request lại
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi refresh endpoint - refreshToken được gửi tự động qua cookie
        const { data } = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          { accessToken },
          { withCredentials: true }
        );

        accessToken = data.accessToken;
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh thất bại → logout
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


// ─────────────────────────────────────────────────────────────
// src/services/authService.ts
// ─────────────────────────────────────────────────────────────
import { apiClient, setAccessToken } from '@/lib/apiClient';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  roles: string[];
}

export interface LoginResponse {
  accessToken: string;
  accessTokenExpiry: string;
  user: UserInfo;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async register(username: string, email: string, password: string, fullName?: string) {
    const { data } = await apiClient.post<LoginResponse>('/api/auth/register', {
      username, email, password, fullName,
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async logout() {
    try {
      await apiClient.post('/api/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },
};


// ─────────────────────────────────────────────────────────────
// src/services/productService.ts
// ─────────────────────────────────────────────────────────────
import { apiClient } from '@/lib/apiClient';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  categoryId: string;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const productService = {
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
  }): Promise<PagedResult<Product>> {
    const { data } = await apiClient.get('/api/products', { params });
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await apiClient.get(`/api/products/${id}`);
    return data;
  },

  async create(payload: {
    name: string;
    price: number;
    stock: number;
    categoryId: string;
    description?: string;
    imageUrl?: string;
  }): Promise<Product> {
    const { data } = await apiClient.post('/api/products', payload);
    return data;
  },

  async update(id: string, payload: {
    name: string;
    price: number;
    description?: string;
    imageUrl?: string;
  }): Promise<Product> {
    const { data } = await apiClient.put(`/api/products/${id}`, payload);
    return data;
  },

  async adjustStock(id: string, delta: number, reason: string): Promise<Product> {
    const { data } = await apiClient.patch(`/api/products/${id}/stock`, { delta, reason });
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/products/${id}`);
  },
};


// ─────────────────────────────────────────────────────────────
// src/hooks/useAuth.ts  - React hook cho authentication
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand'; // npm install zustand
import { authService, UserInfo } from '@/services/authService';

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserInfo | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    const data = await authService.login(email, password);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));


// ─────────────────────────────────────────────────────────────
// Xử lý lỗi từ API (validation errors, 404, 409, v.v.)
// ─────────────────────────────────────────────────────────────
//
// Backend trả về format chuẩn:
// {
//   "status": 400,
//   "title": "Validation Error",
//   "errors": {
//     "email": ["Email không hợp lệ."],
//     "password": ["Password tối thiểu 8 ký tự.", "Password cần ít nhất 1 chữ hoa."]
//   }
// }

export function getApiErrors(error: unknown): Record<string, string[]> {
  if (axios.isAxiosError(error) && error.response?.data?.errors) {
    return error.response.data.errors;
  }
  return {};
}

export function getApiMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.title
      || error.response?.data?.message
      || 'Đã có lỗi xảy ra.';
  }
  return 'Đã có lỗi xảy ra.';
}

// Ví dụ dùng trong component:
//
// try {
//   await authService.login(email, password);
// } catch (err) {
//   const msg = getApiMessage(err);        // "Email hoặc mật khẩu không đúng."
//   const errs = getApiErrors(err);        // { email: ["..."], password: ["..."] }
//   setError('root', { message: msg });
// }
