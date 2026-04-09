import { Search, ShoppingCart, Bell, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { getCart } from "@/lib/api";

interface TopBarProps {
  onMenuToggle?: () => void;
  cartCount?: number;
}

const TopBar = ({ onMenuToggle, cartCount = 3 }: TopBarProps) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [liveCartCount, setLiveCartCount] = useState(cartCount);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCount = async () => {
      try {
        const response = await getCart();
        const nextCount = response.items.reduce((sum, item) => sum + item.qty, 0);
        setLiveCartCount(nextCount);
      } catch {
        setLiveCartCount(cartCount);
      }
    };

    void loadCount();
  }, [cartCount]);

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-6 h-14 lg:h-16">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">F</span>
            </div>
            <span className="hidden sm:block font-display font-semibold text-lg text-foreground">
              FreshFarm
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <div
            className={`relative flex items-center rounded-xl border transition-all duration-200 ${
              searchFocused
                ? "border-primary shadow-sm shadow-primary/10"
                : "border-border bg-muted/50"
            }`}
          >
            <Search className="w-4 h-4 ml-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search fresh produce, farms..."
              className="w-full py-2.5 px-3 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => navigate("/products")}
            aria-label="Search products"
            className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Search className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() =>
              toast({
                title: "Notifications",
                description: "You have 1 new update from FreshFarm.",
              })
            }
            aria-label="View notifications"
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
          </button>
          <button
            onClick={() => navigate("/cart")}
            aria-label="Open cart"
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-foreground" />
            {liveCartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {liveCartCount}
              </span>
            )}
          </button>
          <Link
            to="/profile"
            className="hidden lg:flex w-9 h-9 rounded-xl bg-primary/10 items-center justify-center ml-1 hover:bg-primary/20 transition-colors"
          >
            <span className="text-primary font-semibold text-sm">A</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
