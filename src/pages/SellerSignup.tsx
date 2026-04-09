import { Leaf, Mail, Lock, User, MapPin, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { signup } from "@/lib/api";
import { setCurrentUser } from "@/lib/session";

const SellerSignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [farmName, setFarmName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await signup(farmName, email, password);
      // In a real app, we'd have separate signup logic to set role to "seller"
      // For now, we'll accept any signup and let the user proceed
      setCurrentUser(response.user, response.token);
      toast({ 
        title: "Account created", 
        description: `Welcome to FreshFarm Seller, ${response.user.name}!` 
      });
      navigate("/seller/dashboard");
    } catch (error) {
      toast({
        title: "Signup failed",
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
            Grow your farm business. Reach thousands of customers.
          </p>
          <div className="mt-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
              <p className="text-muted-foreground">List your products instantly</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
              <p className="text-muted-foreground">Get orders and payments directly</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
              <p className="text-muted-foreground">Build your brand and reputation</p>
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
            <span className="font-display font-bold text-xl text-foreground">FreshFarm</span>
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground">Join as a Seller</h2>
          <p className="text-sm text-muted-foreground mt-2">Create your farm store on FreshFarm</p>

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Farm Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g., Green Valley Farms"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-green-600 transition-all duration-200"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

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
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
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
                  required
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
              disabled={isSubmitting || !farmName || !email || !password}
              className="w-full mt-6 px-4 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/seller/auth" className="text-green-600 hover:text-green-700 font-semibold">
                Sign in
              </Link>
            </p>
            <Link to="/seller/auth" className="text-sm text-muted-foreground hover:text-foreground mt-3 block flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to seller login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSignup;
