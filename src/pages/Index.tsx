import AppLayout from "@/components/layout/AppLayout";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import { ArrowRight, Truck, Shield, Leaf, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMarketplaceProducts, type MarketplaceProduct } from "@/lib/api";

const categories = [
  { name: "Vegetables", icon: "🥬", count: 48, color: "#2E7D32" },
  { name: "Fruits", icon: "🍎", count: 36, color: "#E65100" },
  { name: "Dairy", icon: "🥛", count: 22, color: "#1565C0" },
  { name: "Grains", icon: "🌾", count: 18, color: "#F9A825" },
  { name: "Herbs", icon: "🌿", count: 15, color: "#00695C" },
  { name: "Meat", icon: "🥩", count: 12, color: "#C62828" },
  { name: "Eggs", icon: "🥚", count: 8, color: "#795548" },
  { name: "Honey", icon: "🍯", count: 6, color: "#FF8F00" },
];

const fallbackFeaturedProducts = [
  { name: "Fresh Organic Tomatoes", farm: "Green Valley Farm", price: 60, unit: "kg", rating: 4.8, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop", isOrganic: true, isVerified: true, distance: "2.5 km" },
  { name: "Farm Fresh Eggs", farm: "Happy Hen Farms", price: 90, unit: "dozen", rating: 4.9, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop", isOrganic: true, isVerified: true, distance: "4 km" },
  { name: "Raw Wildflower Honey", farm: "Bee Sweet Apiary", price: 350, unit: "500ml", rating: 4.7, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop", isOrganic: true, distance: "8 km", discount: 15 },
  { name: "Baby Spinach", farm: "Sunrise Organics", price: 45, unit: "250g", rating: 4.6, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop", isOrganic: true, isVerified: true, distance: "3 km" },
  { name: "Basmati Rice", farm: "Punjab Heritage", price: 120, unit: "kg", rating: 4.5, image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop", isVerified: true, distance: "12 km" },
  { name: "Fresh Paneer", farm: "Desi Dairy Co.", price: 280, unit: "kg", rating: 4.8, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=400&fit=crop", isVerified: true, distance: "5 km", discount: 10 },
  { name: "Alphonso Mangoes", farm: "Ratnagiri Farms", price: 450, unit: "dozen", rating: 4.9, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop", isOrganic: true, distance: "25 km" },
  { name: "A2 Cow Milk", farm: "Gir Gaushala", price: 70, unit: "ltr", rating: 4.7, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop", isOrganic: true, isVerified: true, distance: "6 km" },
];

const features = [
  { icon: Truck, title: "Free Delivery", desc: "On orders above ₹500" },
  { icon: Shield, title: "Quality Assured", desc: "100% fresh guarantee" },
  { icon: Leaf, title: "Certified Organic", desc: "FSSAI approved farms" },
  { icon: Clock, title: "Same Day", desc: "Harvest to doorstep" },
];

const fadeInStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<MarketplaceProduct[]>(fallbackFeaturedProducts);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const response = await getMarketplaceProducts();
        if (response.products.length > 0) {
          setFeaturedProducts(response.products.slice(0, 8));
        }
      } catch {
        setFeaturedProducts(fallbackFeaturedProducts);
      }
    };

    void loadFeaturedProducts();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6 space-y-6 lg:space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent p-6 lg:p-10"
        >
          <div className="relative z-10 max-w-lg">
            <span className="badge-organic mb-3 inline-flex">
              <Leaf className="w-3 h-3" /> 100% Fresh & Organic
            </span>
            <h1 className="font-display font-bold text-2xl lg:text-4xl text-foreground leading-tight">
              Farm Fresh,<br />Delivered to Your Door
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground mt-2 lg:mt-3">
              Connect directly with local farmers. No middlemen, just fresh produce.
            </p>
            <div className="flex gap-3 mt-4 lg:mt-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 lg:px-6 lg:py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 lg:px-6 lg:py-3 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors"
              >
                Explore Farms
              </Link>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 lg:w-72 lg:h-72 rounded-full bg-primary/5" />
          <div className="absolute right-20 top-0 w-20 h-20 rounded-full bg-warning/10" />
        </motion.div>

        {/* Features strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex items-center gap-3 p-3 lg:p-4 rounded-xl bg-card border border-border"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <f.icon className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs lg:text-sm font-semibold text-foreground">{f.title}</p>
                <p className="text-[10px] lg:text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg lg:text-xl text-foreground">Shop by Category</h2>
            <Link to="/products" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-8 lg:overflow-visible">
            {categories.map((cat) => (
              <CategoryCard key={cat.name} {...cat} />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg lg:text-xl text-foreground">Fresh Picks for You</h2>
            <Link to="/products" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <motion.div
            variants={fadeInStagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4"
          >
            {featuredProducts.map((product, index) => (
              <motion.div key={`${product.name}-${product.farm}-${index}`} variants={fadeItem}>
                <ProductCard {...product} />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Banner */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl lg:rounded-3xl bg-gradient-to-r from-primary to-primary/80 p-6 lg:p-10 text-primary-foreground"
        >
          <div className="max-w-xl">
            <h2 className="font-display font-bold text-xl lg:text-3xl">Are You a Farmer?</h2>
            <p className="text-sm lg:text-base mt-2 opacity-90">
              Join 2,000+ farmers selling directly to customers. Zero commission for the first 3 months.
            </p>
            <Link
              to="/signup?seller=true"
              className="inline-flex mt-4 px-6 py-3 rounded-xl bg-card text-foreground font-semibold text-sm hover:bg-card/90 transition-colors"
            >
              Register Your Farm
            </Link>
          </div>
        </motion.section>
      </div>
    </AppLayout>
  );
};

export default Index;
