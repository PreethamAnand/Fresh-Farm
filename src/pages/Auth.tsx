import { Leaf, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { login, signup } from "@/lib/api";
import { setCurrentUser } from "@/lib/session";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = isLogin
        ? await login(email, password)
        : await signup(fullName, email, password);

      setCurrentUser(response.user, response.token);
      toast({
        title: isLogin ? "Signed in" : "Account created",
        description: `Welcome ${response.user.name}.`,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: isLogin ? "Sign-in failed" : "Signup failed",
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
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-accent relative overflow-hidden p-12">
        <div className="relative z-10 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-4xl text-foreground">FreshFarm</h1>
          <p className="text-lg text-muted-foreground mt-3">
            Connecting farmers directly with your table. Fresh, organic, and local.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {["🥬", "🍎", "🥛", "🌾", "🍯", "🥚"].map((emoji, i) => (
              <div key={i} className="p-4 rounded-2xl bg-card/60 backdrop-blur text-3xl text-center">
                {emoji}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-primary/5" />
        <div className="absolute top-20 -left-10 w-40 h-40 rounded-full bg-warning/5" />
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">FreshFarm</span>
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isLogin ? "Sign in to continue shopping" : "Start your farm-to-table journey"}
          </p>

          <form onSubmit={handleAuth} className="mt-6 space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-foreground cursor-pointer">
                  <input type="checkbox" className="rounded border-border text-primary" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      title: "Reset link sent",
                      description: "Please check your email inbox.",
                    })
                  }
                  className="text-primary font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="block w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm text-center hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (isLogin ? "Signing In..." : "Creating Account...") : (isLogin ? "Sign In" : "Create Account")}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-background text-muted-foreground">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toast({ title: "Google sign-in", description: "OAuth integration can be connected here." })}
                className="py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => toast({ title: "Phone sign-in", description: "OTP flow can be connected here." })}
                className="py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Phone
              </button>
            </div>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
