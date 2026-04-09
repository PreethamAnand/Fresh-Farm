import AppLayout from "@/components/layout/AppLayout";
import { Package, Clock, CheckCircle, Truck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { getOrders, type Order } from "@/lib/api";

const statusConfig: Record<string, { icon: typeof Package; label: string; color: string }> = {
  processing: { icon: Clock, label: "Processing", color: "text-warning" },
  in_transit: { icon: Truck, label: "In Transit", color: "text-primary" },
  delivered: { icon: CheckCircle, label: "Delivered", color: "text-primary" },
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await getOrders();
        setOrders(response.orders);
      } catch (error) {
        toast({
          title: "Unable to load orders",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
        <h1 className="font-display font-bold text-xl lg:text-2xl text-foreground mb-4 lg:mb-6">
          My Orders
        </h1>

        <div className="space-y-4">
          {loading && (
            <div className="p-4 rounded-2xl bg-card border border-border text-sm text-muted-foreground">
              Loading your orders...
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="p-4 rounded-2xl bg-card border border-border text-sm text-muted-foreground">
              No orders yet. Place your first order from the cart.
            </div>
          )}

          {orders.map((order, i) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 lg:p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{order.orderId}</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" /> {status.label}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">Total: ₹{order.total}</p>
                  <button
                    onClick={() =>
                      toast({
                        title: `Order ${order.orderId}`,
                        description: `Status: ${status.label} • Total: ₹${order.total}`,
                      })
                    }
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Orders;
