import React, { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/* ─── tiny helpers ─── */
const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [toast]);
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 28,
        right: 28,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: toast.type === "error" ? "#1a0a0a" : "#0a1a12",
        border: `1px solid ${toast.type === "error" ? "#7f2020" : "#1d6640"}`,
        color: toast.type === "error" ? "#f87171" : "#4ade80",
        padding: "14px 20px",
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        animation: "slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <span style={{ fontSize: 18 }}>{toast.type === "error" ? "✕" : "✓"}</span>
      {toast.msg}
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          marginLeft: 8,
          fontSize: 16,
          opacity: 0.6,
        }}
      >
        ×
      </button>
    </div>
  );
};

const SkeletonCard = () => (
  <div
    style={{
      background: "#111111",
      border: "1px solid #1e1e1e",
      borderRadius: 20,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        height: 280,
        background: "linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%)",
        backgroundSize: "400% 100%",
        animation: "shimmer 1.6s infinite",
      }}
    />
    <div style={{ padding: "20px 22px" }}>
      {[80, 50, 100, 60].map((w, i) => (
        <div
          key={i}
          style={{
            height: 12,
            borderRadius: 6,
            margin: "10px 0",
            width: `${w}%`,
            background:
              "linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%)",
            backgroundSize: "400% 100%",
            animation: "shimmer 1.6s infinite",
          }}
        />
      ))}
    </div>
  </div>
);

/* ─── Edit overlay ─── */
const EditOverlay = ({ item, onSave, onCancel }) => {
  const [form, setForm] = useState({
    productName: item.name,
    price: item.price,
    description: item.description,
    category: item.category,
    image: item.image,
  });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#0e0e0e",
          border: "1px solid #2a2a2a",
          borderRadius: 24,
          width: "100%",
          maxWidth: 540,
          overflow: "hidden",
          boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
          animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Preview image */}
        <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
          <img
            src={preview || `${API}/uploads/${form.image}`}
            alt="product"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, #0e0e0e 0%, transparent 60%)",
            }}
          />
          <label
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Change Photo
            <input type="file" accept="image/*" hidden onChange={handleFile} />
          </label>
        </div>

        <div style={{ padding: "20px 28px 28px" }}>
          <h3
            style={{
              margin: "0 0 20px",
              color: "#fff",
              fontSize: 20,
            }}
          >
            Edit Product
          </h3>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            {[
              { label: "Product Name", key: "productName", span: 2 },
              { label: "Price (₹)", key: "price" },
              { label: "Category", key: "category" },
            ].map(({ label, key, span }) => (
              <div
                key={key}
                style={{ gridColumn: span ? `span ${span}` : undefined }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    color: "#666",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {label}
                </label>
                <input
                  value={form[key] || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "#1a1a1a",
                    border: "1px solid #2e2e2e",
                    borderRadius: 10,
                    color: "#fff",
                    padding: "11px 14px",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            ))}
            <div style={{ gridColumn: "span 2" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  color: "#666",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Description
              </label>
              <textarea
                rows={3}
                value={form.description || ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "none",
                  background: "#1a1a1a",
                  border: "1px solid #2e2e2e",
                  borderRadius: 10,
                  color: "#fff",
                  padding: "11px 14px",
                  fontSize: 14,
                  outline: "none",
                  lineHeight: 1.6,
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={() => onSave(form, file)}
              style={{
                flex: 1,
                padding: "13px",
                border: "none",
                borderRadius: 12,
                background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              Save Changes
            </button>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "13px",
                border: "1px solid #2a2a2a",
                borderRadius: 12,
                background: "transparent",
                color: "#888",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete confirmation ─── */
const DeleteConfirm = ({ item, onConfirm, onCancel }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 999,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}
  >
    <div
      style={{
        background: "#0e0e0e",
        border: "1px solid #2a1a1a",
        borderRadius: 24,
        padding: "36px 32px",
        maxWidth: 380,
        width: "100%",
        textAlign: "center",
        animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#1a0a0a",
          border: "1px solid #4a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          fontSize: 24,
        }}
      >
        🗑
      </div>
      <h3
        style={{
          color: "#fff",
          fontSize: 22,
          margin: "0 0 10px",
        }}
      >
        Delete Product?
      </h3>
      <p
        style={{
          color: "#666",
          fontSize: 14,
          margin: "0 0 28px",
          lineHeight: 1.6,
        }}
      >
        "<span style={{ color: "#aaa" }}>{item?.name}</span>" will be
        permanently removed.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #2a2a2a",
            borderRadius: 12,
            background: "transparent",
            color: "#888",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: "12px",
            border: "none",
            borderRadius: 12,
            background: "linear-gradient(135deg,#dc2626,#991b1b)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

/* ─── Product Card ─── */
const ProductCard = ({ item, onEdit, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0e0e0e",
        border: `1px solid ${hovered ? "#0f172a" : "#1b2846"}`,
        borderRadius: 20,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition:
          "transform 0.35s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.35s ease, border-color 0.3s",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 24px 60px rgba(120,70,200,0.18)"
          : "0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
        <img
          src={`${API}/uploads/${item.image}`}
          alt={item.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />

        {/* Category badge */}
        <span
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            background: "rgba(167,139,250,0.15)",
            border: "1px solid rgba(167,139,250,0.3)",
            color: "#c4b5fd",
            padding: "5px 12px",
            borderRadius: 50,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            backdropFilter: "blur(8px)",
          }}
        >
          {item.category}
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "18px 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flexGrow: 1,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: "#f0ece8",
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.name}
          </h3>
        </div>

        <p
          style={{
            margin: 0,
            color: "#555",
            fontSize: 13,
            lineHeight: 1.65,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flexGrow: 1,
          }}
        >
          {item.description}
        </p>

        {/* Price + Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 10,
                color: "#555",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Price
            </span>
            <p
              style={{
                margin: 0,
                color: "#fff",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              ₹{Number(item.price).toLocaleString("en-IN")}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onEdit(item)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "1px solid #2a2a2a",
                background: "#141414",
                color: "#a78bfa",
                cursor: "pointer",
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1e1430";
                e.currentTarget.style.borderColor = "#5b3fc8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#141414";
                e.currentTarget.style.borderColor = "#2a2a2a";
              }}
            >
              ✎
            </button>
            <button
              onClick={() => onDelete(item)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "1px solid #2a2a2a",
                background: "#141414",
                color: "#f87171",
                cursor: "pointer",
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1f1010";
                e.currentTarget.style.borderColor = "#7f2020";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#141414";
                e.currentTarget.style.borderColor = "#2a2a2a";
              }}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */
const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const getProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/product/get-product`, {
        withCredentials: true,
      });
      setProducts(res.data.data || []);
    } catch {
      showToast("Failed to load products", "error");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleUpdate = async (form, file) => {
    try {
      const fd = new FormData();
      fd.append("productName", form.productName);
      fd.append("price", form.price);
      fd.append("description", form.description);
      fd.append("category", form.category);
      if (file) fd.append("image", file);

      await axios.put(`${API}/product/update-product/${editItem._id}`, fd, {
        withCredentials: true,
      });
      showToast("Product updated successfully");
      setEditItem(null);
      getProducts();
    } catch {
      showToast("Update failed", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/product/delete-product/${deleteItem._id}`, {
        withCredentials: true,
      });
      showToast("Product deleted");
      setDeleteItem(null);
      getProducts();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div
        style={{
          background: "#080808",
          minHeight: "100vh",
          marginLeft: "220px",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            borderBottom: "1px solid #151515",
            padding: "28px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            background: "#0a0a0a",
            position: "sticky",
            top: 0,
            zIndex: 100,
            backdropFilter: "blur(12px)",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#555",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Management
            </p>
            <h1
              style={{
                margin: 0,
                color: "#f0ece8",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              Product Catalogue
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 13,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#444",
                  fontSize: 15,
                }}
              >
                ⌕
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                style={{
                  background: "#111",
                  border: "1px solid #1e1e1e",
                  borderRadius: 12,
                  padding: "10px 14px 10px 36px",
                  color: "#ccc",
                  fontSize: 14,
                  width: 220,
                  outline: "none",
                }}
              />
            </div>

            {/* Count pill */}
            <div
              style={{
                background: "#1a1230",
                border: "1px solid #3a2a5a",
                borderRadius: 10,
                padding: "8px 16px",
                color: "#a78bfa",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {loading ? "—" : filtered.length} Items
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        <div style={{ padding: "36px 40px" }}>
          {/* Loading */}
          {loading && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 24,
              }}
            >
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                animation: "fadeUp 0.5s ease both",
              }}
            >
              <div style={{ fontSize: 52, marginBottom: 20 }}>📦</div>
              <h2
                style={{
                  color: "#333",
                  fontSize: 26,
                  margin: "0 0 10px",
                }}
              >
                {search ? "No results found" : "No Products Yet"}
              </h2>
              <p style={{ color: "#3a3a3a", fontSize: 15 }}>
                {search
                  ? `Nothing matches "${search}"`
                  : "Add products to see them here"}
              </p>
            </div>
          )}

          {/* Cards */}
          {!loading && filtered.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 24,
              }}
            >
              {filtered.map((item, i) => (
                <div
                  key={item._id}
                  style={{
                    animation: `fadeUp 0.4s ease both`,
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  <ProductCard
                    item={item}
                    onEdit={setEditItem}
                    onDelete={setDeleteItem}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            borderTop: "1px solid #111",
            padding: "20px 40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#2e2e2e",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Product Management System
          </p>
          <p style={{ margin: 0, color: "#2a2a2a", fontSize: 12 }}>
            {products.length} total products
          </p>
        </div>
      </div>

      {/* ── Overlays ── */}
      {editItem && (
        <EditOverlay
          item={editItem}
          onSave={handleUpdate}
          onCancel={() => setEditItem(null)}
        />
      )}
      {deleteItem && (
        <DeleteConfirm
          item={deleteItem}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
        />
      )}

      {/* ── Toast ── */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
};

export default ListProduct;
