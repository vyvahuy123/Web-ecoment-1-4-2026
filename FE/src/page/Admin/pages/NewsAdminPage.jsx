import { useState, useEffect } from "react";
import {
  getNewsListAdmin,
  createNews,
  updateNews,
  deleteNews,
  uploadNewsImage,
  NEWS_CATEGORIES,
} from "@/services/newsService";

const BASE_URL = "http://localhost:5000";

function getImageUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("vi-VN");
}

const EMPTY_FORM = {
  title: "",
  description: "",
  content: "",
  imageUrl: "",
  category: "new-arrival",
  isPublished: false,
};

export default function NewsAdminPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data = await getNewsListAdmin({
        category: filterCat || undefined,
        page,
        pageSize: 10,
      });
      setNews(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [filterCat, page]);

  const f = (key) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErr("");
    setModalOpen(true);
    setTimeout(() => document.querySelector(".modal-box")?.scrollTo(0, 0), 50);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setForm({
      title: item.title,
      description: item.description,
      content: item.content,
      imageUrl: item.imageUrl ?? "",
      category: item.category,
      isPublished: item.isPublished,
    });
    setFormErr("");
    setModalOpen(true);
    setTimeout(() => document.querySelector(".modal-box")?.scrollTo(0, 0), 50);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadNewsImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch {
      setFormErr("Lỗi upload ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormErr("Vui lòng nhập tiêu đề.");
      return;
    }
    if (!form.description.trim()) {
      setFormErr("Vui lòng nhập mô tả.");
      return;
    }
    if (!form.content.trim()) {
      setFormErr("Vui lòng nhập nội dung.");
      return;
    }
    setSaving(true);
    setFormErr("");
    try {
      if (editTarget) await updateNews(editTarget.id, form);
      else await createNews(form);
      setModalOpen(false);
      fetchNews();
    } catch (e) {
      setFormErr(e?.response?.data?.message ?? "Lỗi khi lưu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNews(deleteTarget.id);
      setDeleteTarget(null);
      fetchNews();
    } catch {}
  };

  const catLabel = (val) =>
    NEWS_CATEGORIES.find((c) => c.value === val)?.label ?? val;

  return (
    <div className="page-content">
      {/* Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 className="page-title">Tin tức</h1>
          <p className="page-sub">Quản lý bài viết và tin tức</p>
        </div>
        <button className="btn btn-dark" onClick={openCreate}>
          + Tạo tin tức
        </button>
      </div>

      {/* Filter */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        {[{ value: "", label: "Tất cả" }, ...NEWS_CATEGORIES].map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setFilterCat(cat.value);
              setPage(1);
            }}
            className={`btn btn-sm ${filterCat === cat.value ? "btn-dark" : ""}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "var(--g4)" }}
          >
            Đang tải...
          </div>
        ) : news.length === 0 ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "var(--g4)" }}
          >
            Chưa có tin tức nào
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div
                      style={{
                        width: 56,
                        height: 40,
                        borderRadius: 4,
                        overflow: "hidden",
                        background: "#f5f5f5",
                      }}
                    >
                      {getImageUrl(item.imageUrl) ? (
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            fontSize: 18,
                            color: "#ccc",
                          }}
                        >
                          ✦
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: 13,
                        maxWidth: 280,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--g4)",
                        marginTop: 2,
                        maxWidth: 280,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.description}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-inactive">
                      {catLabel(item.category)}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--g4)" }}>
                    {formatDate(item.createdAt)}
                  </td>
                  <td>
                    <span
                      className={`badge ${item.isPublished ? "badge-active" : "badge-pending"}`}
                    >
                      {item.isPublished ? "Đã đăng" : "Nháp"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => openEdit(item)}
                      >
                        ✎
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ color: "var(--red)" }}
                        onClick={() => setDeleteTarget(item)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              padding: "16px",
            }}
          >
            <button
              className="btn btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Trước
            </button>
            <span style={{ padding: "4px 12px", fontSize: 13 }}>
              {page} / {totalPages}
            </span>
            <button
              className="btn btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="modal-head">
              <span className="modal-title">
                {editTarget ? "Sửa tin tức" : "Tạo tin tức mới"}
              </span>
              <button
                className="modal-close"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div
              className="modal-body"
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {formErr && <div className="modal-err">{formErr}</div>}

              <div>
                <label>Tiêu đề *</label>
                <input
                  className="modal-input"
                  value={form.title}
                  onChange={f("title")}
                  placeholder="Tiêu đề bài viết..."
                />
              </div>

              <div>
                <label>Mô tả ngắn *</label>
                <textarea
                  className="modal-input modal-textarea"
                  value={form.description}
                  onChange={f("description")}
                  placeholder="Mô tả ngắn hiển thị ngoài danh sách..."
                  rows={2}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label>Danh mục</label>
                  <select
                    className="modal-input"
                    value={form.category}
                    onChange={f("category")}
                  >
                    {NEWS_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    paddingBottom: 4,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={f("isPublished")}
                    />
                    Đăng ngay
                  </label>
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label>Ảnh bìa</label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "32px",
                    background: "#f8f7f5",
                    border: "2px dashed #ddd",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#999",
                  }}
                >
                  {uploading
                    ? "Đang tải ảnh..."
                    : form.imageUrl
                      ? "📷 Thay ảnh khác"
                      : "📷 Chọn ảnh từ máy tính"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
                {getImageUrl(form.imageUrl) && (
                  <div
                    style={{
                      marginTop: 8,
                      height: 120,
                      borderRadius: 6,
                      overflow: "hidden",
                      background: "#f5f5f5",
                    }}
                  >
                    <img
                      src={getImageUrl(form.imageUrl)}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label>Nội dung *</label>
                <textarea
                  className="modal-input modal-textarea"
                  value={form.content}
                  onChange={f("content")}
                  placeholder="Nội dung bài viết..."
                  rows={8}
                  style={{ fontFamily: "monospace", fontSize: 13 }}
                />
              </div>
            </div>
            <div className="modal-foot">
              <button
                className="btn btn-sm"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Hủy
              </button>
              <button
                className="btn btn-sm btn-dark"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Đang lưu..."
                  : editTarget
                    ? "Cập nhật"
                    : "Tạo tin tức"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 400 }}
          >
            <div className="modal-head">
              <span className="modal-title">Xóa tin tức</span>
              <button
                className="modal-close"
                onClick={() => setDeleteTarget(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: "var(--g4)" }}>
                Bạn có chắc muốn xóa bài viết{" "}
                <strong>"{deleteTarget.title}"</strong>?
              </p>
            </div>
            <div className="modal-foot">
              <button
                className="btn btn-sm"
                onClick={() => setDeleteTarget(null)}
              >
                Hủy
              </button>
              <button
                className="btn btn-sm"
                style={{ background: "var(--red)", color: "#fff" }}
                onClick={handleDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
