import HomePage from "../views/HomePage";

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

async function getProducts(sort) {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";
  try {
    const res = await fetchWithTimeout(`${apiBaseUrl}/products?sort=${sort}&limit=8`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error(`[Server] Error fetching ${sort} products:`, err.message);
    return null;
  }
}

export default async function Page() {
  const trending = await getProducts("popular");
  const newArrivals = await getProducts("newest");

  return (
    <HomePage
      initialTrending={trending}
      initialNewArrivals={newArrivals}
    />
  );
}
