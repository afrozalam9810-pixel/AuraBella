import ProductDetailPage from "../../../views/ProductDetailPage";

async function fetchWithTimeout(url, options = {}, timeout = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function getProductData(id) {
  const actualId = id && id.length >= 24 ? id.substring(0, 24) : id;
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";
  try {
    const res = await fetchWithTimeout(`${apiBaseUrl}/products/${actualId}`);
    if (!res.ok) throw new Error(`HTTP status: ${res.status}`);
    const data = await res.json();
    if (data && data.success) {
      const product = data.data;
      let relatedProducts = [];
      if (product.category) {
        const catId = product.category._id || product.category;
        const relatedRes = await fetchWithTimeout(`${apiBaseUrl}/products?category=${catId}&limit=5`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          if (relatedData && relatedData.success) {
            relatedProducts = relatedData.data.filter((p) => p._id !== product._id);
          }
        }
      }
      return { product, relatedProducts };
    }
  } catch (err) {
    console.error(`[Server] Error fetching product detail for id ${id}:`, err.message);
  }
  return null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const actualId = id && id.length >= 24 ? id.substring(0, 24) : id;
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";
  try {
    const res = await fetchWithTimeout(`${apiBaseUrl}/products/${actualId}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          title: `${data.data.name} | AuraBella`,
          description: data.data.description
            ? data.data.description.substring(0, 150)
            : "Shop luxury fashion and beauty at AuraBella.",
        };
      }
    }
  } catch (err) {
    console.error("[Server] Error generating product metadata:", err.message);
  }
  return {
    title: "Product Detail | AuraBella",
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const actualId = id && id.length >= 24 ? id.substring(0, 24) : id;
  const data = await getProductData(actualId);
  const product = data?.product;

  let productLd = null;
  let breadcrumbLd = null;

  if (product) {
    // Product Schema
    productLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.images || [],
      "description": product.description || `Shop ${product.name} at AuraBella.`,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "AuraBella"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://www.aurabellaafroz.com/product/${product._id}`,
        "priceCurrency": "INR",
        "price": product.discountPrice !== null && product.discountPrice !== undefined ? product.discountPrice : product.price,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.variants?.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    };

    if (product.avgRating) {
      productLd.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.avgRating,
        "reviewCount": product.numReviews || 1
      };
    }

    // Breadcrumbs Schema
    const categoryName = product.category?.name || "Collection";
    const categorySlug = product.category?.slug || "all";
    breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.aurabellaafroz.com" },
        { "@type": "ListItem", "position": 2, "name": categoryName, "item": `https://www.aurabellaafroz.com/category/${categorySlug}` },
        { "@type": "ListItem", "position": 3, "name": product.name, "item": `https://www.aurabellaafroz.com/product/${product._id}` }
      ]
    };
  }

  return (
    <>
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      {productLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
        />
      )}
      <ProductDetailPage
        initialProduct={product}
        initialRelatedProducts={data?.relatedProducts}
        id={actualId}
      />
    </>
  );
}
