import { Home, ShoppingBag, ClipboardList, MessageCircle, User, Leaf, TrendingUp, Heart } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: ShoppingBag, label: "Products", path: "/products" },
  { icon: ClipboardList, label: "Orders", path: "/orders" },
  { icon: MessageCircle, label: "Chat", path: "/chat" },
  { icon: User, label: "Profile", path: "/profile" },
];

const quickLinks = [
  { icon: Leaf, label: "Organic", path: "/products?filter=organic" },
  { icon: TrendingUp, label: "Trending", path: "/products?filter=trending" },
  { icon: Heart, label: "Favorites", path: "/products?filter=favorites" },
];

const DesktopSidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 border-r border-border bg-card h-screen sticky top-0 shrink-0">
      {/* Top space for logo alignment */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-foreground leading-tight">FreshFarm</h1>
            <p className="text-[11px] text-muted-foreground">Farm to Table</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-muted"
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-4">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Quick Links
          </p>
          {quickLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-muted transition-colors"
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom card */}
      <div className="p-4">
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="font-display font-semibold text-sm text-foreground">Become a Seller</p>
          <p className="text-xs text-muted-foreground mt-1">Start selling your produce today</p>
          <button
            onClick={() => navigate("/signup?seller=true")}
            className="mt-3 w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
