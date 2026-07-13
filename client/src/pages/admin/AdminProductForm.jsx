import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2, FiUpload, FiCheck, FiAlertCircle } from "react-icons/fi";
import api from "../../api/axios";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // Data States
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Product Fields State
  const [productData, setProductData] = useState({
    productId: "",
    name: "",
    brand: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    subCategory: "",
    images: [],
  });

  // Variants State
  const [variants, setVariants] = useState([{ size: "Standard", color: "Default", stock: 50 }]);

  // Image Upload helper (converts to base64)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result], // Save base64 string
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (index) => {
    setProductData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  // Fetch product if editing + fetch categories
  useEffect(() => {
    // 1. Fetch categories
    api.get("/categories")
      .then((res) => {
        if (res.data && res.data.success) {
          setCategories(res.data.data || []);
        }
      })
      .catch((err) => console.error("Error loading categories", err));

    // 2. Fetch product details
    if (isEdit) {
      setLoading(true);
      api.get(`/products/${id}`)
        .then((res) => {
          if (res.data && res.data.success) {
            const p = res.data.data;
            setProductData({
              productId: p.productId || "",
              name: p.name,
              brand: p.brand,
              description: p.description,
              price: p.price,
              discountPrice: p.discountPrice || "",
              category: p.category?._id || p.category || "",
              subCategory: p.subCategory?._id || p.subCategory || "",
              images: p.images || [],
            });
            if (p.variants && p.variants.length > 0) {
              setVariants(p.variants.map((v) => ({ size: v.size, color: v.color, stock: v.stock })));
            }
          }
        })
        .catch((err) => setErrorMsg("Failed to load product details."))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  // Variant Rows Handlers
  const handleAddVariantRow = () => {
    setVariants((prev) => [...prev, { size: "", color: "", stock: 0 }]);
  };

  const handleRemoveVariantRow = (index) => {
    if (variants.length <= 1) {
      alert("At least one variant row is required.");
      return;
    }
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: field === "stock" ? Number(value) : value };
      return next;
    });
  };

  const handleTextChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const { productId: _productId, ...productFields } = productData;
    const payload = {
      ...productFields,
      price: Number(productData.price),
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
      category: productData.category || undefined,
      subCategory: productData.subCategory || undefined,
      variants,
    };

    try {
      if (isEdit) {
        // Update product
        const { data } = await api.put(`/products/${id}`, payload);
        if (data && data.success) {
          setSuccessMsg("Product updated successfully!");
          setTimeout(() => navigate("/admin/products"), 1500);
        }
      } else {
        // Create product
        const { data } = await api.post("/products", payload);
        if (data && data.success) {
          setSuccessMsg("Product created successfully!");
          setTimeout(() => navigate("/admin/products"), 1500);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to save product details.");
    }
  };

  // Find subcategories for selected parent category
  const activeSubCategories = productData.category
    ? categories.find((c) => c._id === productData.category)?.subCategories || []
    : [];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 font-sans text-xs">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-5">
        <Link to="/admin/products" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#9d8bbb] hover:text-white transition-colors">
          <FiArrowLeft className="text-base" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-white tracking-wide">
            {isEdit ? "Edit Product" : "Create Product"}
          </h1>
          <p className="font-serif italic text-[#9d8bbb] text-xs mt-1">
            {isEdit ? "Modify catalog item configurations." : "Publish a new luxury design item."}
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3.5 flex items-center gap-2">
          <FiCheck /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl px-4 py-3.5 flex items-center gap-2">
          <FiAlertCircle /> {errorMsg}
        </div>
      )}

      {/* Main product form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-semibold text-white/50">Product Name</label>
            <input
              type="text"
              name="name"
              required
              value={productData.name}
              onChange={handleTextChange}
              placeholder="Velvet Glow Serum"
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-semibold text-white/50">Brand</label>
            <input
              type="text"
              name="brand"
              required
              value={productData.brand}
              onChange={handleTextChange}
              placeholder="AuraBella"
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-semibold text-white/50">Product ID</label>
            <input
              type="text"
              readOnly
              value={productData.productId || "Generated automatically when published"}
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-white/60 focus:outline-none cursor-not-allowed"
              aria-label="Product ID"
            />
            <p className="text-[9px] text-white/35">A unique ID is generated and locked by the server.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-semibold text-white/50">Base Price (₹)</label>
            <input
              type="number"
              name="price"
              required
              value={productData.price}
              onChange={handleTextChange}
              placeholder="1999"
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-semibold text-white/50">Discount Price (₹, Optional)</label>
            <input
              type="number"
              name="discountPrice"
              value={productData.discountPrice}
              onChange={handleTextChange}
              placeholder="1599"
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-semibold text-white/50">Category</label>
            <select
              name="category"
              required
              value={productData.category}
              onChange={(e) => setProductData({ ...productData, category: e.target.value, subCategory: "" })}
              className="bg-dark-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase font-semibold text-white/50">Subcategory</label>
            <select
              name="subCategory"
              value={productData.subCategory}
              onChange={handleTextChange}
              className="bg-dark-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400"
            >
              <option value="">None</option>
              {activeSubCategories.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2 md:col-span-3">
            <label className="text-[9px] uppercase font-semibold text-white/50">Description</label>
            <textarea
              name="description"
              required
              rows={4}
              value={productData.description}
              onChange={handleTextChange}
              placeholder="Enter comprehensive product story..."
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary-400 resize-none"
            />
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Dynamic Image Uploads */}
        <div className="flex flex-col gap-3">
          <h3 className="font-sans font-bold text-xs uppercase tracking-wide">Product Images</h3>
          
          <div className="flex flex-wrap gap-4 items-center">
            {productData.images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-24 rounded-xl overflow-hidden border border-white/10 bg-dark-900">
                <img src={img} alt="upload preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeUploadedImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white/80 hover:text-white text-[10px]"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* Upload Trigger Box */}
            <label className="w-20 h-24 rounded-xl border border-dashed border-white/20 hover:border-primary-400 flex flex-col items-center justify-center text-[#9d8bbb] hover:text-white cursor-pointer transition-colors bg-white/0">
              <FiUpload className="text-lg mb-1" />
              <span className="text-[8px] uppercase font-bold tracking-wider">Upload</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Dynamic variants list */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wide">Product Variants</h3>
            <button
              type="button"
              onClick={handleAddVariantRow}
              className="text-[10px] font-sans font-bold text-primary-300 hover:text-white uppercase tracking-wider flex items-center gap-1"
            >
              <FiPlus /> Add Variant
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {variants.map((v, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-4 animate-slide-up">
                <div className="grid grid-cols-3 gap-3 flex-grow">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] uppercase font-semibold text-white/40">Size</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. M, L or 38"
                      value={v.size}
                      onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary-400 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] uppercase font-semibold text-white/40">Color</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Crimson Red"
                      value={v.color}
                      onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary-400 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] uppercase font-semibold text-white/40">Stock Count</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50"
                      value={v.stock}
                      onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-primary-400 text-xs"
                    />
                  </div>
                </div>

                {/* Remove row */}
                <button
                  type="button"
                  onClick={() => handleRemoveVariantRow(idx)}
                  className="text-rose-400 hover:text-rose-300 p-2 hover:bg-rose-500/10 rounded-xl self-end mb-0.5 transition-colors"
                >
                  <FiTrash2 className="text-base" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/5 pt-5">
          <Link
            to="/admin/products"
            className="px-6 py-3 border border-white/10 text-white/60 hover:text-white rounded-full transition-colors text-xs font-semibold uppercase tracking-wider"
          >
            Cancel
          </Link>
          <button type="submit" className="px-8 py-3 btn-primary text-xs font-semibold uppercase tracking-wider">
            {isEdit ? "Update Catalog Item" : "Publish Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
