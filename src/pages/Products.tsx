import AppLayout from "@/components/layout/AppLayout";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getFavorites, getMarketplaceProducts, type MarketplaceProduct } from "@/lib/api";

const fallbackProducts = [
  { name: "Fresh Organic Tomatoes", farm: "Green Valley Farm", price: 60, unit: "kg", rating: 4.8, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop", isOrganic: true, isVerified: true, distance: "2.5 km" },
  { name: "Farm Fresh Eggs", farm: "Happy Hen Farms", price: 90, unit: "dozen", rating: 4.9, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop", isOrganic: true, isVerified: true, distance: "4 km" },
  { name: "Raw Wildflower Honey", farm: "Bee Sweet Apiary", price: 350, unit: "500ml", rating: 4.7, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop", isOrganic: true, distance: "8 km", discount: 15 },
  { name: "Baby Spinach", farm: "Sunrise Organics", price: 45, unit: "250g", rating: 4.6, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop", isOrganic: true, isVerified: true, distance: "3 km" },
  { name: "Basmati Rice", farm: "Punjab Heritage", price: 120, unit: "kg", rating: 4.5, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop", isVerified: true, distance: "12 km" },
  { name: "Fresh Paneer", farm: "Desi Dairy Co.", price: 280, unit: "kg", rating: 4.8, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop", isVerified: true, distance: "5 km", discount: 10 },
  { name: "Alphonso Mangoes", farm: "Ratnagiri Farms", price: 450, unit: "dozen", rating: 4.9, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop", isOrganic: true, distance: "25 km" },
  { name: "A2 Cow Milk", farm: "Gir Gaushala", price: 70, unit: "ltr", rating: 4.7, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop", isOrganic: true, isVerified: true, distance: "6 km" },
  { name: "Red Onions", farm: "Nashik Farms", price: 35, unit: "kg", rating: 4.3, image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=400&fit=crop", isVerified: true, distance: "15 km" },
  { name: "Green Chillies", farm: "Spice Garden", price: 25, unit: "250g", rating: 4.4, image: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&h=400&fit=crop", isOrganic: true, distance: "7 km" },
  { name: "Fresh Coriander", farm: "Herb Haven", price: 20, unit: "bunch", rating: 4.6, image: "https://images.unsplash.com/photo-1592420022813-26d668e00e4b?w=400&h=400&fit=crop", isOrganic: true, isVerified: true, distance: "2 km" },
  { name: "Potatoes", farm: "Hill Station Farms", price: 40, unit: "kg", rating: 4.2, image: "https://images.unsplash.com/photo-1518977676601-b53f82ber633?w=400&h=400&fit=crop", distance: "10 km" },
];

const filters = ["All", "Organic", "Vegetables", "Fruits", "Dairy", "Grains"];
const sortOptions = ["Relevance", "Price: Low to High", "Price: High to Low", "Rating", "Distance"];

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter")?.toLowerCase() ?? "all";
  const [activeFilter, setActiveFilter] = useState(
    filters.find((f) => f.toLowerCase() === initialFilter) ??
      (initialFilter === "trending" ? "Trending" : initialFilter === "favorites" ? "Favorites" : "All")
  );
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("Relevance");
  const [favoriteKeys, setFavoriteKeys] = useState<string[]>([]);
  const [liveProducts, setLiveProducts] = useState<MarketplaceProduct[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await getFavorites();
        setFavoriteKeys(response.productKeys);
      } catch {
        setFavoriteKeys([]);
      }
    };

    void loadFavorites();
  }, []);

  useEffect(() => {
    const loadMarketplaceProducts = async () => {
      try {
        const response = await getMarketplaceProducts();
        setLiveProducts(response.products);
      } catch {
        setLiveProducts([]);
      }
    };

    void loadMarketplaceProducts();
  }, []);

  const displayedProducts = useMemo(() => {
    const sourceProducts = liveProducts.length > 0 ? liveProducts : fallbackProducts;
    const active = activeFilter.toLowerCase();

    const filtered = sourceProducts.filter((product) => {
      if (active === "all") return true;
      if (active === "organic") return Boolean(product.isOrganic);
      if (active === "trending") return product.rating >= 4.8 || Boolean(product.discount);
      if (active === "favorites") return favoriteKeys.includes(`${product.name}::${product.farm}`);
      if (active === "vegetables") {
        if (product.category) return product.category === "vegetables";
        return /tomato|spinach|onion|chillies|coriander|potato|carrot|pumpkin/i.test(product.name);
      }
      if (active === "fruits") {
        if (product.category) return product.category === "fruits";
        return /mango|banana|apple|orange|grape|papaya|guava/i.test(product.name);
      }
      if (active === "dairy") {
        if (product.category) return product.category === "dairy";
        return /eggs|milk|paneer|curd|cheese|butter|yogurt/i.test(product.name);
      }
      if (active === "grains") {
        if (product.category) return product.category === "grains";
        return /rice|wheat|grain|millet|barley|oat/i.test(product.name);
      }
      return true;
    });

    const parseDistance = (value?: string) => Number.parseFloat(value?.replace(" km", "") ?? "999");

    return [...filtered].sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Rating") return b.rating - a.rating;
      if (sortBy === "Distance") return parseDistance(a.distance) - parseDistance(b.distance);
      return b.rating - a.rating;
    });
  }, [activeFilter, favoriteKeys, sortBy]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display font-bold text-xl lg:text-2xl text-foreground">All Products</h1>
          <p className="text-sm text-muted-foreground">{displayedProducts.length} products</p>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0 space-y-6">
            <div className="p-4 rounded-2xl bg-card border border-border">
              <h3 className="font-semibold text-sm text-foreground mb-3">Categories</h3>
              <div className="space-y-2">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeFilter === f
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border">
              <h3 className="font-semibold text-sm text-foreground mb-3">Price Range</h3>
              <div className="space-y-2">
                {["Under ₹50", "₹50 - ₹100", "₹100 - ₹300", "Above ₹300"].map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" className="rounded border-border text-primary" />
                    {r}
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border">
              <h3 className="font-semibold text-sm text-foreground mb-3">Distance</h3>
              <div className="space-y-2">
                {["Within 5 km", "Within 10 km", "Within 25 km", "Any distance"].map((d) => (
                  <label key={d} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="radio" name="distance" className="text-primary" />
                    {d}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Mobile filter bar */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-sm font-medium shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {showFilters && (
              <div className="lg:hidden mb-4 p-3 rounded-xl bg-card border border-border">
                <p className="text-sm font-medium text-foreground">Sort</p>
                <button
                  onClick={() => {
                    const currentIndex = sortOptions.indexOf(sortBy);
                    setSortBy(sortOptions[(currentIndex + 1) % sortOptions.length]);
                  }}
                  className="mt-2 px-3 py-2 rounded-lg border border-border text-sm text-foreground"
                >
                  {sortBy}
                </button>
              </div>
            )}

            {/* Desktop sort bar */}
            <div className="hidden lg:flex items-center justify-between mb-4 p-3 rounded-xl bg-card border border-border">
              <div className="flex gap-2">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === f
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  const currentIndex = sortOptions.indexOf(sortBy);
                  setSortBy(sortOptions[(currentIndex + 1) % sortOptions.length]);
                }}
                className="flex items-center gap-1.5 text-sm text-foreground font-medium"
              >
                Sort by: {sortBy} <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Product grid */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4"
            >
              {displayedProducts.map((product, index) => (
                <motion.div
                  key={`${product.name}-${product.farm}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                  }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Products;
