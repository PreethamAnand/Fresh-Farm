import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Users, Barcode } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { login, signup, sellerGuestLogin } from "@/lib/api";
import { setCurrentUser } from "@/lib/session";

const SellerAuth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await login(email, password);
      // Check if user role is seller
      if (response.user.role !== "seller") {
        toast({
          title: "Sign-in failed",
          description: "This account is not registered as a seller. Please use a seller account.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      setCurrentUser(response.user, response.token);
      toast({ title: "Signed in", description: `Welcome back, ${response.user.name}.` });
      navigate("/seller/dashboard");
    } catch (error) {
      toast({
        title: "Sign-in failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSellerGuestLogin = async () => {
    setIsSubmitting(true);
    try {
      const response = await sellerGuestLogin();
      setCurrentUser(response.user, response.token);
      toast({
        title: "Welcome!",
        description: "You are now logged in as a demo seller.",
      });
      navigate("/seller/dashboard");
    } catch (error) {
      toast({
        title: "Sign-in failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left: Branding (desktop only) */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-green-600/10 via-green-500/5 to-emerald-600 relative overflow-hidden p-12">
        <div className="relative z-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-4xl text-foreground">FreshFarm</h1>
          <p className="text-lg text-muted-foreground mt-3">
            Sell directly to customers. Build your farm business with FreshFarm.
          </p>
          
          <div className="mt-10 space-y-4">
            <div className="flex items-start gap-3">
              <Barcode className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-semibold text-foreground">Easy Listings</p>
                <p className="text-sm text-muted-foreground">Add your products in seconds</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-semibold text-foreground">Direct Customers</p>
                <p className="text-sm text-muted-foreground">Connect with buyers nearby</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="font-semibold text-foreground">Real-time Orders</p>
                <p className="text-sm text-muted-foreground">Manage orders instantly</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-green-500/10" />
        <div className="absolute top-20 -left-10 w-40 h-40 rounded-full bg-emerald-500/10" />
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">FreshFarm Seller</span>
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground">Welcome Farmer</h2>
          <p className="text-sm text-muted-foreground mt-2">Manage your farm, reach more customers</p>

          {/* Guest Login Button - Prominent */}
          <button
            onClick={handleSellerGuestLogin}
            disabled={isSubmitting}
            className="w-full mt-6 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
          >
            <Zap className="w-4 h-4" />
            {isSubmitting ? "Connecting..." : "Demo Seller Login"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue with your account</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@farm.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-green-600 transition-all duration-200"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-green-600 transition-all duration-200"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full mt-6 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Don't have a seller account?{" "}
              <Link to="/seller/signup" className="text-green-600 hover:text-green-700 font-semibold">
                Register here
              </Link>
            </p>
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground mt-3 block">
              ← Back to buyer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAuth;
