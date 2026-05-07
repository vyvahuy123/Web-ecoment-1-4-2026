import api from "../api/axiosConfig";

export const NEWS_CATEGORIES = [
  { value: 'new-arrival', label: 'Sản phẩm mới' },
  { value: 'sale',        label: 'Khuyến mãi' },
  { value: 'event',       label: 'Sự kiện' },
  { value: 'tips',        label: 'Mẹo thời trang' },
];

// PUBLIC
export const getNewsList = ({ category, page = 1, pageSize = 9 } = {}) =>
  api.get("/news", { params: { category: category || undefined, page, pageSize } }).then(r => r.data);

export const getNewsDetail = (id) =>
  api.get(`/news/${id}`).then(r => r.data);

// ADMIN
export const getNewsListAdmin = ({ category, isPublished, page = 1, pageSize = 10 } = {}) =>
  api.get("/news/admin", { params: { category, isPublished, page, pageSize } }).then(r => r.data);

export const createNews = (dto) =>
  api.post("/news", dto).then(r => r.data);

export const updateNews = (id, dto) =>
  api.put(`/news/${id}`, dto).then(r => r.data);

export const deleteNews = (id) =>
  api.delete(`/news/${id}`).then(r => r.data);

export const uploadNewsImage = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/news/upload-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data.imageUrl);
};