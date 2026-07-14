import ProductListingPage from "../../../views/ProductListingPage";

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

async function getCategoryData(slug) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";
  try {
    const catRes = await fetchWithTimeout(`${apiBaseUrl}/categories`);
    if (!catRes.ok) throw new Error("Failed to fetch categories");
    const categoriesData = await catRes.json();
    const categories = categoriesData.data || [];

    let contextId = null;
    let queryParam = "category";

    const parent = categories.find((cat) => cat.slug === slug);
    if (parent) {
      contextId = parent._id;
    } else {
      for (const p of categories) {
        const sub = p.subCategories.find((s) => s.slug === slug);
        if (sub) {
          contextId = sub._id;
          queryParam = "subCategory";
          break;
        }
      }
    }

    let products = [];
    let total = 0;
    let totalPages = 1;

    if (contextId) {
      const prodRes = await fetchWithTimeout(
        `${apiBaseUrl}/products?${queryParam}=${contextId}&sort=newest&page=1&limit=8`
      );
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData && prodData.success) {
          products = prodData.data || [];
          total = prodData.total || 0;
          totalPages = prodData.pages || 1;
        }
      }
    }

    return {
      categories,
      products,
      total,
      totalPages,
    };
  } catch (err) {
    console.error(`[Server] Error fetching category data for slug ${slug}:`, err.message);
  }
  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";
  try {
    const res = await fetchWithTimeout(`${apiBaseUrl}/categories`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        const parent = data.data.find((c) => c.slug === slug);
        if (parent) {
          return {
            title: `${parent.name} Collection | AuraBella`,
            description: `Shop premium ${parent.name.toLowerCase()} collections at AuraBella. Experience absolute luxury.`,
          };
        }
        for (const p of data.data) {
          const sub = p.subCategories.find((s) => s.slug === slug);
          if (sub) {
            return {
              title: `${sub.name} - ${p.name} | AuraBella`,
              description: `Shop premium ${sub.name.toLowerCase()} ${p.name.toLowerCase()} collections at AuraBella.`,
            };
          }
        }
      }
    }
  } catch (err) {
    console.error("[Server] Error generating category metadata:", err.message);
  }
  return {
    title: "Category Collection | AuraBella",
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  const categories = data?.categories || [];
  const parent = categories.find((cat) => cat.slug === slug);
  let parentOfSub = null;
  let subCategoryDoc = null;

  if (!parent) {
    for (const p of categories) {
      const s = p.subCategories?.find((sub) => sub.slug === slug);
      if (s) {
        subCategoryDoc = s;
        parentOfSub = p;
        break;
      }
    }
  }

  // Breadcrumbs JSON-LD
  const breadcrumbItems = [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.aurabellaafroz.com" }
  ];

  if (parent) {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 2,
      "name": parent.name,
      "item": `https://www.aurabellaafroz.com/category/${parent.slug}`
    });
  } else if (subCategoryDoc && parentOfSub) {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 2,
      "name": parentOfSub.name,
      "item": `https://www.aurabellaafroz.com/category/${parentOfSub.slug}`
    }, {
      "@type": "ListItem",
      "position": 3,
      "name": subCategoryDoc.name,
      "item": `https://www.aurabellaafroz.com/category/${subCategoryDoc.slug}`
    });
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  };

  // CollectionPage JSON-LD
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": parent ? `${parent.name} Collection | AuraBella` : subCategoryDoc ? `${subCategoryDoc.name} - ${parentOfSub.name} | AuraBella` : "Collection | AuraBella",
    "description": parent ? `Shop premium ${parent.name.toLowerCase()} collections at AuraBella.` : subCategoryDoc ? `Shop premium ${subCategoryDoc.name.toLowerCase()} ${parentOfSub.name.toLowerCase()} collections at AuraBella.` : "Explore curated items at AuraBella.",
    "url": `https://www.aurabellaafroz.com/category/${slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": data?.products?.length || 0,
      "itemListElement": (data?.products || []).map((prod, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "image": prod.images?.[0],
        "name": prod.name,
        "url": `https://www.aurabellaafroz.com/product/${prod._id}`
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <ProductListingPage
        initialCategories={data?.categories}
        initialProducts={data?.products}
        initialTotal={data?.total}
        initialTotalPages={data?.totalPages}
      />
    </>
  );
}
