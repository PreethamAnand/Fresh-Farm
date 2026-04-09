import { Leaf, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { guestLogin, signup } from "@/lib/api";
import { setCurrentUser } from "@/lib/session";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await signup(name, email, password);
      setCurrentUser(response.user, response.token);
      toast({ title: "Account created", description: `Welcome, ${response.user.name}.` });
      navigate("/dashboard");
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

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    try {
      const response = await guestLogin();
      setCurrentUser(response.user, response.token);
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Guest sign-in failed",
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
            Join thousands of families eating fresh, organic produce from local farms.
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
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">FreshFarm</span>
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground">Create account</h2>
          <p className="text-sm text-muted-foreground mt-1">Start your farm-to-table journey</p>

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="block w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm text-center hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGuestLogin}
              className="block w-full py-3 rounded-xl border-2 border-dashed border-border text-foreground font-medium text-sm text-center hover:bg-muted transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              🌿 Continue as Guest
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
                onClick={() => toast({ title: "Google sign-up", description: "OAuth flow can be added here." })}
                className="py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => toast({ title: "Phone sign-up", description: "OTP flow can be added here." })}
                className="py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Phone
              </button>
            </div>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
