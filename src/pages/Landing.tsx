import { Leaf, ArrowRight, Truck, Shield, Star, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const stats = [
  { value: "500+", label: "Local Farmers" },
  { value: "50K+", label: "Happy Customers" },
  { value: "100%", label: "Organic Verified" },
  { value: "4.9★", label: "Average Rating" },
];

const features = [
  { icon: Leaf, title: "100% Organic", desc: "Every product is certified organic and chemical-free, sourced from verified farms." },
  { icon: Truck, title: "Same-Day Delivery", desc: "Harvested in the morning, at your doorstep by evening. Always farm-fresh." },
  { icon: Shield, title: "Quality Guaranteed", desc: "FSSAI approved farms with 100% freshness guarantee or your money back." },
  { icon: Users, title: "Meet Your Farmer", desc: "Chat directly with farmers. Know exactly where your food comes from." },
];

const testimonials = [
  { name: "Priya Sharma", role: "Home Chef, Mumbai", text: "The freshness is unmatched! I can taste the difference in every meal I cook.", avatar: "PS" },
  { name: "Rahul Verma", role: "Health Enthusiast, Delhi", text: "Finally, a platform where I can trust the organic claims. Love the transparency!", avatar: "RV" },
  { name: "Anita Desai", role: "Mother of 2, Bangalore", text: "My kids love the fruits! Knowing it comes straight from the farm gives me peace of mind.", avatar: "AD" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">FreshFarm</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Log in
            </Link>
            <Link to="/seller/auth" className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
              Sell with us
            </Link>
            <Link to="/signup" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Leaf className="w-3.5 h-3.5" /> Farm-to-Table, Zero Middlemen
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-display font-bold text-4xl lg:text-6xl text-foreground leading-tight">
                Fresh from the <span className="text-primary">Farm</span> to Your <span className="text-primary">Table</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-lg">
                Connect directly with local farmers. Get organic produce, dairy, and grains delivered fresh to your doorstep — no middlemen, no markup.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                  Start Shopping <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login?guest=true" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors">
                  Browse as Guest <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="font-display font-bold text-2xl text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop"
                  alt="Fresh organic vegetables from local farms"
                  className="w-full h-[480px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Delivered in 4 hours</p>
                    <p className="text-xs text-muted-foreground">From farm to your door</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-card rounded-2xl p-4 shadow-lg border border-border">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  <span className="text-sm font-bold text-foreground">4.9</span>
                  <span className="text-xs text-muted-foreground">50K+ reviews</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-warning/5 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="font-display font-bold text-3xl lg:text-4xl text-foreground">Why Choose FreshFarm?</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-3 max-w-md mx-auto">Everything you need for a healthier, more transparent food experience.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="font-display font-bold text-3xl lg:text-4xl text-foreground">How It Works</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-3">From farm to table in 3 simple steps</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Browse & Select", desc: "Explore fresh produce from verified local farmers near you.", emoji: "🛒" },
              { step: "02", title: "Place Your Order", desc: "Add to cart and checkout. Pay online or on delivery.", emoji: "📦" },
              { step: "03", title: "Get It Delivered", desc: "Receive farm-fresh produce at your doorstep the same day.", emoji: "🚚" },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp} className="text-center">
                <div className="text-5xl mb-4">{item.emoji}</div>
                <div className="text-xs font-bold text-primary mb-2">STEP {item.step}</div>
                <h3 className="font-display font-semibold text-xl text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="font-display font-bold text-3xl lg:text-4xl text-foreground">Loved by Thousands</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-warning fill-warning" />)}
                </div>
                <p className="text-sm text-foreground mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="font-display font-bold text-3xl lg:text-4xl text-foreground">Ready to Eat Fresh?</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-3 mb-8">Join 50,000+ families who have made the switch to farm-fresh produce.</motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login?guest=true" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors">
                Continue as Guest
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">FreshFarm</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 FreshFarm. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
