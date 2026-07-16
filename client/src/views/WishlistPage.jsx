import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiTrash2, FiShoppingBag, FiHeart, FiAlertCircle } from "react-icons/fi";
import { addToCart } from "../store/slices/cartSlice";
import { removeFromWishlist, fetchWishlist } from "../store/slices/wishlistSlice";
import { getProductUrl } from "../utils/seo";

export default function WishlistPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const wishlist = useSelector((state) => state.wishlist.items) || [];
  const loading = useSelector((state) => state.wishlist.loading);
  const error = useSelector((state) => state.wishlist.error);

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleMoveToCart = (product) => {
    const firstVariant = product.variants?.[0] || {};
    
    // 1. Dispatch to Redux Cart
    dispatch(
      addToCart({
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice,
          images: product.images,
        },
        variant: {
          size: firstVariant.size || "",
          color: firstVariant.color || "",
        },
        qty: 1,
      })
    );

    // 2. Remove from Wishlist
    dispatch(removeFromWishlist(product._id));
  };

  if (loading && wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <h1 className="font-display font-bold text-3xl md:text-5xl text-white uppercase tracking-wider mb-2 text-center md:text-left">
        My Wishlist
      </h1>
      <p className="font-serif italic text-[#9d8bbb] text-sm mb-10 text-center md:text-left">
        Your curated list of saved luxuries
      </p>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs rounded-xl px-4 py-3 mb-6 flex items-center gap-2 max-w-md mx-auto md:mx-0">
          <FiAlertCircle className="text-sm" /> {error}
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="glass-card p-8 sm:p-16 text-center max-w-xl mx-auto flex flex-col gap-6 items-center">
          <FiHeart className="text-5xl text-white/20" />
          <div>
            <h3 className="font-display font-bold text-xl text-white">Your wishlist is empty</h3>
            <p className="font-serif italic text-xs text-[#9d8bbb] mt-1">
              Tap the heart icon on any product card to save it here.
            </p>
          </div>
          <Link to="/" className="btn-primary">Discover Collections</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {wishlist.map((product) => {
            const displayPrice = product.discountPrice ?? product.price;
            const thumbnail = product.images?.[0] || "https://placehold.co/300x400/1e1830/f0e8ff?text=Product";
            return (
              <div key={product._id} className="glass-card overflow-hidden group flex flex-col h-full border border-white/5 bg-white/5 hover:border-primary-400/30 transition-all duration-300">
                
                {/* Image */}
                <Link to={getProductUrl(product)} className="relative overflow-hidden aspect-[3/4] block">
                  <img
                    src={thumbnail}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.discountPrice && (
                    <span className="absolute top-3 left-3 text-[9px] font-sans font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase">
                      Sale
                    </span>
                  )}
                </Link>
                
                {/* Details */}
                <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between gap-4">
                  <div>
                    <span className="font-sans text-[10px] text-[#9d8bbb] uppercase tracking-wider block mb-1">
                      {product.brand}
                    </span>
                    <Link to={getProductUrl(product)} className="font-sans text-xs md:text-sm text-white/90 font-medium group-hover:text-primary-300 transition-colors line-clamp-1 block">
                      {product.name}
                    </Link>
                    <span className="font-sans font-bold text-xs md:text-sm text-white block mt-1.5">
                      ₹{displayPrice.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-2 min-[420px]:gap-3 pt-3 border-t border-white/5 mt-auto">
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="text-[10px] font-sans font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5"
                    >
                      <FiTrash2 /> Remove
                    </button>
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="text-[10px] font-sans font-bold uppercase tracking-wider text-primary-300 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <FiShoppingBag /> Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
