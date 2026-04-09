import AppLayout from "@/components/layout/AppLayout";
import {
  User, MapPin, CreditCard, Bell, Shield, HelpCircle, LogOut,
  ChevronRight, Heart, ClipboardList, Star, Settings
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { clearCurrentUser, getCurrentUser } from "@/lib/session";

const menuItems = [
  { icon: User, label: "Personal Info", id: "personal" },
  { icon: MapPin, label: "Addresses", id: "addresses" },
  { icon: ClipboardList, label: "Order History", id: "orders" },
  { icon: Heart, label: "Favorites", id: "favorites" },
  { icon: CreditCard, label: "Payment Methods", id: "payments" },
  { icon: Bell, label: "Notifications", id: "notifications" },
  { icon: Shield, label: "Privacy & Security", id: "privacy" },
  { icon: Settings, label: "Settings", id: "settings" },
  { icon: HelpCircle, label: "Help & Support", id: "help" },
];

const Profile = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [activeSection, setActiveSection] = useState("personal");
  const [addresses, setAddresses] = useState([
    { type: "Home", address: "42, Green Park, Sector 15, Gurgaon, Haryana 122001" },
    { type: "Office", address: "WeWork, Cyber Hub, DLF Phase 2, Gurgaon 122002" },
  ]);

  const renderContent = () => {
    switch (activeSection) {
      case "personal":
        return (
          <div className="space-y-6">
            <h2 className="font-display font-bold text-lg text-foreground">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Full Name", value: "Arjun Mehta" },
                { label: "Email", value: "arjun@email.com" },
                { label: "Phone", value: "+91 98765 43210" },
                { label: "Date of Birth", value: "15 Mar 1995" },
              ].map((field) => (
                <div key={field.label}>
                  <label htmlFor={field.label} className="text-xs font-medium text-muted-foreground">{field.label}</label>
                  <input
                    id={field.label}
                    type="text"
                    defaultValue={field.value}
                    className="mt-1 w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => toast({ title: "Profile updated", description: "Your personal details were saved." })}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        );
      case "addresses":
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground">Saved Addresses</h2>
            {addresses.map((addr) => (
              <div key={addr.type} className="p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary uppercase">{addr.type}</span>
                  <button
                    onClick={() =>
                      toast({
                        title: `Edit ${addr.type} address`,
                        description: "Address edit modal can be connected here.",
                      })
                    }
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-sm text-foreground mt-1">{addr.address}</p>
              </div>
            ))}
            <button
              onClick={() => {
                setAddresses((prev) => [
                  ...prev,
                  {
                    type: `Other ${prev.length - 1}`,
                    address: "Add your new delivery address here.",
                  },
                ]);
                toast({ title: "Address added", description: "A new address slot has been created." });
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              + Add New Address
            </button>
          </div>
        );
      case "orders":
        return (
          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-foreground">Order History</h2>
            <p className="text-sm text-muted-foreground">View all your placed orders and tracking details.</p>
            <button
              onClick={() => navigate("/orders")}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
            >
              Open Orders Page
            </button>
          </div>
        );
      default:
        return (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">This section is coming soon</p>
          </div>
        );
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-6 p-4 lg:p-6 rounded-2xl bg-card border border-border">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="text-2xl lg:text-3xl font-display font-bold text-primary">A</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg lg:text-xl text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-warning text-warning" /> 4.9 rating
              </span>
              <span className="text-xs text-muted-foreground">• 23 orders</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu */}
          <div className="lg:w-64 shrink-0 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
            <button
              onClick={() => {
                clearCurrentUser();
                toast({ title: "Logged out", description: "You have been signed out." });
                navigate("/login");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors mt-4"
            >
              <LogOut className="w-[18px] h-[18px]" /> Logout
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 lg:p-6 rounded-2xl bg-card border border-border">
            {renderContent()}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
