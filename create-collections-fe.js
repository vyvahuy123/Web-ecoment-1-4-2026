const fs = require('fs');

// 1. Create CollectionsPage.jsx
fs.writeFileSync('E:/CleanArchitecture/fe-nextjs/page/Admin/pages/CollectionsPage.jsx', `"use client";
import { useState } from "react";
import { useFetch } from "../../../hooks/useFetch";
import api from "../../../api/axiosConfig";

const BASE = "/collections";

export default function CollectionsPage() {
  const { data: collections, loading, error, refetch } = useFetch(() =>
    api.get(BASE).then(r => r.data), []);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [form, setForm] = useState({ name: "", discountPercent: 10, startDate: "", endDate: "", description: "", imageUrl: "" });

  const resetForm = () => { setForm({ name: "", discountPercent: 10, startDate: "", endDate: "", description: "", imageUrl: "" }); setEditing(null); setShowForm(false); };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Bo suu tap / Sale</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Tao bo suu tap</button>
      </div>

      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      {showForm && (
        <div style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>{editing ? "Chinh sua" : "Tao moi"} bo suu tap</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ fontSize: 12, color: "#666" }}>Ten bo suu tap *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Vi du: Mua He 2026" /></div>
            <div><label style={{ fontSize: 12, color: "#666" }}>Giam gia (%) *</label>
              <input className="form-input" type="number" min="1" max="100" value={form.discountPercent} onChange={e => setForm(p => ({ ...p, discountPercent: e.target.value }))} /></div>
            <div><label style={{ fontSize: 12, color: "#666" }}>Ngay bat dau *</label>
              <input className="form-input" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} /></div>
            <div><label style={{ fontSize: 12, color: "#666" }}>Ngay ket thuc *</label>
              <input className="form-input" type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} /></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 12, color: "#666" }}>Mo ta</label>
              <input className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Mo ta ngan..." /></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 12, color: "#666" }}>URL anh</label>
              <input className="form-input" value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." /></div>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={handleSubmit}>{editing ? "Luu" : "Tao"}</button>
            <button className="btn" onClick={resetForm}>Huy</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {loading ? <div>Dang tai...</div> : (collections || []).map(col => (
          <div key={col.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{col.name}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{col.description}</div>
              </div>
              <span style={{ background: col.isOnSaleNow ? "#22c55e" : "#e5e7eb", color: col.isOnSaleNow ? "#fff" : "#666", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>
                {col.isOnSaleNow ? "DANG SALE" : "CHUA SALE"}
              </span>
            </div>
            <div style={{ marginTop: 10, fontSize: 13, color: "#333" }}>
              <div>Giam gia: <strong style={{ color: "#ef4444" }}>{col.discountPercent}%</strong></div>
              <div>Tu: {new Date(col.startDate).toLocaleDateString("vi-VN")} — {new Date(col.endDate).toLocaleDateString("vi-VN")}</div>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button className="btn btn-sm" onClick={() => handleViewProducts(col)}>San pham</button>
              <button className="btn btn-sm" onClick={() => handleEdit(col)}>Sua</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(col.id)}>Xoa</button>
            </div>
          </div>
        ))}
      </div>

      {selectedCollection && (
        <ProductPanel collection={selectedCollection} onClose={() => setSelectedCollection(null)} onRemove={handleRemoveProduct} onRefresh={() => handleViewProducts(selectedCollection)} />
      )}
    </div>
  );
}

function ProductPanel({ collection, onClose, onRemove, onRefresh }) {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await api.get("/products", { params: { search, pageSize: 20 } });
      setSearchResults(res.data?.items || res.data || []);
    } catch {}
    setSearching(false);
  };

  const handleAdd = async (productId) => {
    try {
      await api.post("/collections/" + collection.id + "/products", { productId });
      onRefresh();
    } catch (e) { alert(e?.response?.data?.message || "Loi khi them san pham"); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 680, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{collection.name}</div>
            <div style={{ fontSize: 12, color: "#ef4444" }}>Giam {collection.discountPercent}%</div>
          </div>
          <span style={{ cursor: "pointer", fontSize: 18 }} onClick={onClose}>×</span>
        </div>

        <div style={{ padding: "12px 20px", borderBottom: "1px solid #eee", display: "flex", gap: 8 }}>
          <input className="form-input" style={{ flex: 1 }} placeholder="Tim san pham de them..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
          <button className="btn btn-primary btn-sm" onClick={handleSearch}>Tim</button>
        </div>

        {searchResults.length > 0 && (
          <div style={{ padding: "8px 20px", borderBottom: "1px solid #eee", maxHeight: 180, overflowY: "auto" }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Ket qua tim kiem:</div>
            {searchResults.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{p.price?.toLocaleString("vi-VN")}d</div>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => handleAdd(p.id)}>Them</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>San pham trong bo suu tap ({collection.products?.length || 0})</div>
          {(collection.products || []).length === 0
            ? <div style={{ color: "#999", textAlign: "center", padding: 30 }}>Chua co san pham nao</div>
            : (collection.products || []).map(p => (
              <div key={p.productId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} />}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 12 }}>
                      <span style={{ textDecoration: "line-through", color: "#999" }}>{p.price?.toLocaleString("vi-VN")}d</span>
                      <span style={{ color: "#ef4444", marginLeft: 8, fontWeight: 600 }}>{p.salePrice?.toLocaleString("vi-VN")}d</span>
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
}
`);

// 2. Update AdminDashboard
let dashboard = fs.readFileSync('E:/CleanArchitecture/fe-nextjs/page/Admin/AdminDashboard.jsx', 'utf8');
dashboard = dashboard.replace(
  `import NewsAdminPage    from "./pages/NewsAdminPage";`,
  `import NewsAdminPage    from "./pages/NewsAdminPage";\nimport CollectionsPage  from "./pages/CollectionsPage";`
);
dashboard = dashboard.replace(
  `  banners: BannersPage,`,
  `  banners: BannersPage,\n  collections: CollectionsPage,`
);
fs.writeFileSync('E:/CleanArchitecture/fe-nextjs/page/Admin/AdminDashboard.jsx', dashboard, 'utf8');

// 3. Update Sidebar
let sidebar = fs.readFileSync('E:/CleanArchitecture/fe-nextjs/page/Admin/components/Sidebar.jsx', 'utf8');
sidebar = sidebar.replace(
  `      { id: "banners", icon: "🖼", label: "Banner" },`,
  `      { id: "banners", icon: "🖼", label: "Banner" },\n      { id: "collections", icon: "🏷", label: "Bo suu tap" },`
);
fs.writeFileSync('E:/CleanArchitecture/fe-nextjs/page/Admin/components/Sidebar.jsx', sidebar, 'utf8');

console.log('Done');
