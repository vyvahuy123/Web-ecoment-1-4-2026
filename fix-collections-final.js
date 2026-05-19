const fs = require('fs');

fs.writeFileSync('E:/CleanArchitecture/fe-nextjs/page/Admin/pages/CollectionsPage.jsx', `"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useFetch } from "@/hooks/useFetch";
import api from "../../../api/axiosConfig";
import "../styles/CollectionsPage.css";

const BASE = "/collections";

export default function CollectionsPage() {
  const { data: collections, loading, error, refetch } = useFetch(() =>
    api.get(BASE).then(r => r.data), []);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [form, setForm] = useState({ name: "", discountPercent: 10, startDate: "", endDate: "", description: "", imageUrl: "" });

  const resetForm = () => {
    setForm({ name: "", discountPercent: 10, startDate: "", endDate: "", description: "", imageUrl: "" });
    setEditing(null); setShowForm(false);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form, discountPercent: Number(form.discountPercent) };
      if (editing) await api.put(BASE + "/" + editing.id, payload);
      else await api.post(BASE, payload);
      refetch(); resetForm();
    } catch (e) { alert("Loi: " + (e?.response?.data?.message || e.message)); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Xoa bo suu tap nay?")) return;
    await api.delete(BASE + "/" + id);
    refetch();
    if (selectedCollection?.id === id) setSelectedCollection(null);
  };

  const handleEdit = (col) => {
    setForm({
      name: col.name, discountPercent: col.discountPercent,
      startDate: col.startDate?.slice(0, 10), endDate: col.endDate?.slice(0, 10),
      description: col.description || "", imageUrl: col.imageUrl || ""
    });
    setEditing(col); setShowForm(true);
  };

  const handleViewProducts = async (col) => {
    const res = await api.get(BASE + "/" + col.id);
    setSelectedCollection(res.data);
  };

  const handleRemoveProduct = async (productId) => {
    await api.delete(BASE + "/" + selectedCollection.id + "/products/" + productId);
    handleViewProducts(selectedCollection);
  };

  return (
    <div style={{ padding: 24 }}>
      <div className="collections-header">
        <h2>Bo suu tap / Sale</h2>
        <button className="btn" onClick={() => { resetForm(); setShowForm(true); }}>+ Tao bo suu tap</button>
      </div>

      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      {showForm && (
        <div className="collection-form">
          <h3>{editing ? "Chinh sua" : "Tao moi"} bo suu tap</h3>
          <div className="collection-form-grid">
            <div className="form-field">
              <label>Ten bo suu tap *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Vi du: Mua He 2026" />
            </div>
            <div className="form-field">
              <label>Giam gia (%) *</label>
              <input type="number" min="1" max="100" value={form.discountPercent} onChange={e => setForm(p => ({ ...p, discountPercent: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Ngay bat dau *</label>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div className="form-field">
              <label>Ngay ket thuc *</label>
              <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            </div>
            <div className="form-field full-width">
              <label>Mo ta</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Mo ta ngan..." />
            </div>
            <div className="form-field full-width">
              <label>URL anh</label>
              <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn" onClick={handleSubmit}>{editing ? "Luu" : "Tao"}</button>
            <button className="btn" onClick={resetForm}>Huy</button>
          </div>
        </div>
      )}

      <div className="collections-grid">
        {loading ? <div>Dang tai...</div> : (collections || []).map(col => (
          <div key={col.id} className="collection-card">
            <div className="collection-card-header">
              <div>
                <div className="collection-card-name">{col.name}</div>
                <div className="collection-card-desc">{col.description}</div>
              </div>
              <span className={col.isOnSaleNow ? "badge-sale" : "badge-inactive"}>
                {col.isOnSaleNow ? "DANG SALE" : "CHUA SALE"}
              </span>
            </div>
            <div className="collection-card-info">
              <div>Giam gia: <span className="discount">{col.discountPercent}%</span></div>
              <div>Tu: {new Date(col.startDate).toLocaleDateString("vi-VN")} — {new Date(col.endDate).toLocaleDateString("vi-VN")}</div>
            </div>
            <div className="collection-card-actions">
              <button className="btn btn-sm" onClick={() => handleViewProducts(col)}>San pham</button>
              <button className="btn btn-sm" onClick={() => handleEdit(col)}>Sua</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(col.id)}>Xoa</button>
            </div>
          </div>
        ))}
      </div>

      {selectedCollection && (
        <ProductPanel
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
          onRemove={handleRemoveProduct}
          onRefresh={() => handleViewProducts(selectedCollection)}
        />
      )}
    </div>
  );
}

function ProductPanel({ collection, onClose, onRemove, onRefresh }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await api.get("/products", { params: { search, pageSize: 20 } });
      setSearchResults(res.data?.items || res.data || []);
    } catch {}
  };

  const handleAdd = async (productId) => {
    try {
      await api.post("/collections/" + collection.id + "/products", { productId });
      onRefresh();
    } catch (e) { alert(e?.response?.data?.message || "Loi khi them san pham"); }
  };

  const modal = (
    <div className="product-panel-overlay">
      <div className="product-panel">
        <div className="product-panel-header">
          <div>
            <div className="product-panel-header-title">{collection.name}</div>
            <div className="product-panel-header-sub">Giam {collection.discountPercent}%</div>
          </div>
          <span className="product-panel-close" onClick={onClose}>×</span>
        </div>

        <div className="product-panel-search">
          <input
            placeholder="Tim san pham de them..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button className="btn btn-sm" onClick={handleSearch}>Tim</button>
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            <div className="search-results-label">Ket qua tim kiem:</div>
            {searchResults.map(p => (
              <div key={p.id} className="search-result-item">
                <div>
                  <div className="search-result-name">{p.name}</div>
                  <div className="search-result-price">{p.price?.toLocaleString("vi-VN")}d</div>
                </div>
                <button className="btn btn-sm" onClick={() => handleAdd(p.id)}>Them</button>
              </div>
            ))}
          </div>
        )}

        <div className="product-list">
          <div className="product-list-title">San pham trong bo suu tap ({collection.products?.length || 0})</div>
          {(collection.products || []).length === 0
            ? <div className="product-list-empty">Chua co san pham nao</div>
            : (collection.products || []).map(p => (
              <div key={p.productId} className="product-item">
                <div className="product-item-left">
                  {p.imageUrl && <img src={p.imageUrl} alt="" className="product-item-img" />}
                  <div>
                    <div className="product-item-name">{p.name}</div>
                    <div className="product-item-price">
                      <span className="original">{p.price?.toLocaleString("vi-VN")}d</span>
                      <span className="sale">{p.salePrice?.toLocaleString("vi-VN")}d</span>
                    </div>
                  </div>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => onRemove(p.productId)}>Xoa</button>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
`);

console.log('Done');
