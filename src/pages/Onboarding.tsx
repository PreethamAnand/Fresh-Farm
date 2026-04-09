import { useState } from "react";
import { Leaf, ArrowRight, ShoppingBag, Users, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    icon: Leaf,
    title: "Farm Fresh Produce",
    description: "Get vegetables, fruits, and dairy delivered directly from verified local farms.",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop",
    color: "from-primary/20",
  },
  {
    icon: Users,
    title: "Meet Your Farmers",
    description: "Chat directly with farmers, know your food's journey from seed to plate.",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=600&fit=crop",
    color: "from-warning/20",
  },
  {
    icon: Truck,
    title: "Same Day Delivery",
    description: "Harvested in the morning, delivered to your door by evening. Always fresh.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop",
    color: "from-accent",
  },
];

const Onboarding = () => {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop: Left image */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={slide.image}
            alt={slide.title}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-transparent`} />
      </div>

      {/* Right / Full mobile */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">FreshFarm</span>
          </div>

          {/* Mobile image */}
          <div className="lg:hidden aspect-[4/3] rounded-2xl overflow-hidden mb-6">
            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                src={slide.image}
                alt={slide.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                <slide.icon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-display font-bold text-2xl lg:text-3xl text-foreground">
                {slide.title}
              </h2>
              <p className="text-muted-foreground mt-2 lg:text-lg">{slide.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex gap-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-8 bg-primary" : "w-2 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            {current < slides.length - 1 ? (
              <>
                <Link to="/auth" className="px-6 py-3 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
                  Skip
                </Link>
                <button
                  onClick={() => setCurrent(current + 1)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
