import AppLayout from "@/components/layout/AppLayout";
import { Minus, Plus, Trash2, ShieldCheck, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { checkout, getCart, removeCartItem, updateCartItemQty, type CartItem } from "@/lib/api";

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await getCart();
        setItems(response.items);
      } catch (error) {
        toast({
          title: "Unable to load cart",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void loadCart();
  }, []);

  const updateQty = async (itemKey: string, delta: number) => {
    try {
      const response = await updateCartItemQty(itemKey, delta);
      setItems(response.items);
    } catch (error) {
      toast({
        title: "Unable to update quantity",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemKey: string) => {
    try {
      const response = await removeCartItem(itemKey);
      setItems(response.items);
    } catch (error) {
      toast({
        title: "Unable to remove item",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal > 500 ? 0 : 40;
  const total = subtotal + delivery;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
        <h1 className="font-display font-bold text-xl lg:text-2xl text-foreground mb-4 lg:mb-6">
          Your Cart ({isLoading ? "..." : items.length})
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart items */}
          <div className="flex-1 space-y-3">
            {isLoading && (
              <div className="p-6 rounded-2xl bg-card border border-border text-sm text-muted-foreground">
                Loading cart...
              </div>
            )}

            {items.map((item) => (
              <motion.div
                key={item.key}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-4 p-4 rounded-2xl bg-card border border-border"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm lg:text-base text-foreground">{item.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-primary" /> {item.farm}
                      </p>
                      {item.isOrganic && <span className="badge-organic mt-1 text-[10px]">Organic</span>}
                    </div>
                    <button
                      onClick={() => void removeItem(item.key)}
                      aria-label="Remove item"
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-muted rounded-xl">
                      <button
                        onClick={() => void updateQty(item.key, -1)}
                        aria-label="Decrease quantity"
                        className="p-2 rounded-l-xl hover:bg-border transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => void updateQty(item.key, 1)}
                        aria-label="Increase quantity"
                        className="p-2 rounded-r-xl hover:bg-border transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-display font-bold text-foreground">
                      ₹{item.price * item.qty}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Your cart is empty</p>
                <Link to="/products" className="text-primary font-medium text-sm mt-2 inline-block hover:underline">
                  Browse Products
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 xl:w-96">
            <div className="lg:sticky lg:top-24 p-5 rounded-2xl bg-card border border-border space-y-4">
              <h2 className="font-display font-semibold text-lg text-foreground">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? "text-primary font-medium" : ""}>
                    {delivery === 0 ? "Free" : `₹${delivery}`}
                  </span>
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹{500 - subtotal} more for free delivery
                  </p>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-base text-foreground">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  if (items.length === 0) {
                    toast({ title: "Your cart is empty", description: "Add products before checkout." });
                    return;
                  }

                  try {
                    const response = await checkout();
                    setItems([]);
                    toast({
                      title: "Order placed",
                      description: `${response.order.orderId} created. Redirecting to orders...`,
                    });
                    navigate("/orders");
                  } catch (error) {
                    toast({
                      title: "Checkout failed",
                      description: error instanceof Error ? error.message : "Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Proceed to Checkout
              </button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="w-4 h-4 text-primary" />
                <span>Estimated delivery: Today, 4-6 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Cart;
