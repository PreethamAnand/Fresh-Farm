import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, LogOut, MessageCircle, Package, Plus, Send, ShoppingCart, Trash2, TrendingUp, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  addSellerProduct,
  getConversations,
  getMessages,
  getSellerOrders,
  getSellerProducts,
  getSellerStats,
  removeSellerProduct,
  sendMessage,
  type Conversation,
  type SellerOrder,
  type SellerProduct,
  type SellerStats,
  updateSellerOrderStatus,
  type ChatMessage,
} from "@/lib/api";
import { clearCurrentUser, getCurrentUser } from "@/lib/session";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [activeTab, setActiveTab] = useState<"inventory" | "orders" | "chat" | "history">("inventory");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("kg");
  const [newItemStock, setNewItemStock] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    if (currentUser.role !== "seller") {
      navigate("/seller/auth");
    }
  }, [currentUser.role, navigate]);

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes, conversationsRes] = await Promise.all([
        getSellerStats(),
        getSellerProducts(),
        getSellerOrders(),
        getConversations(),
      ]);

      setStats(statsRes);
      setProducts(productsRes.products);
      setOrders(ordersRes.orders);
      setConversations(conversationsRes.conversations);
      if (conversationsRes.conversations.length > 0 && !selectedConv) {
        setSelectedConv(conversationsRes.conversations[0].id);
      }
    } catch (error) {
      toast({
        title: "Unable to load seller workspace",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshDashboard();
  }, []);

  useEffect(() => {
    if (!selectedConv) return;

    const loadMessages = async () => {
      try {
        const response = await getMessages(selectedConv);
        setMessages(response.messages);
      } catch (error) {
        toast({
          title: "Unable to load chat",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    };

    void loadMessages();
  }, [selectedConv]);

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    [products]
  );

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "processing" || order.status === "in_transit"),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((order) => order.status === "delivered"),
    [orders]
  );

  const inventoryChartData = useMemo(
    () =>
      products
        .slice(0, 6)
        .map((product) => ({ name: product.name.length > 12 ? `${product.name.slice(0, 12)}...` : product.name, stock: product.stock })),
    [products]
  );

  const orderStatusChartData = useMemo(() => {
    const processing = orders.filter((order) => order.status === "processing").length;
    const inTransit = orders.filter((order) => order.status === "in_transit").length;
    const delivered = orders.filter((order) => order.status === "delivered").length;
    const cancelled = orders.filter((order) => order.status === "cancelled").length;
    return [
      { name: "Processing", value: processing, fill: "#f59e0b" },
      { name: "In Transit", value: inTransit, fill: "#3b82f6" },
      { name: "Delivered", value: delivered, fill: "#22c55e" },
      { name: "Cancelled", value: cancelled, fill: "#ef4444" },
    ].filter((item) => item.value > 0);
  }, [orders]);

  const orderValueTrendData = useMemo(
    () =>
      orders
        .slice()
        .reverse()
        .map((order, index) => ({
          label: `O${index + 1}`,
          value: order.total,
        })),
    [orders]
  );

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingItem(true);
    try {
      const response = await addSellerProduct({
        name: newItemName,
        price: Number(newItemPrice),
        unit: newItemUnit,
        stock: Number(newItemStock),
      });

      setProducts((prev) => [response.product, ...prev]);
      setNewItemName("");
      setNewItemPrice("");
      setNewItemStock("");
      toast({ title: "Item added", description: `${response.product.name} added to inventory.` });
      await refreshDashboard();
    } catch (error) {
      toast({
        title: "Unable to add item",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingItem(false);
    }
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    try {
      await removeSellerProduct(productId);
      setProducts((prev) => prev.filter((item) => item.id !== productId));
      toast({ title: "Item removed", description: `${productName} removed from inventory.` });
      await refreshDashboard();
    } catch (error) {
      toast({
        title: "Unable to remove item",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await updateSellerOrderStatus(orderId, status);
      setOrders((prev) => prev.map((order) => (order.orderId === orderId ? { ...order, status: status as SellerOrder["status"] } : order)));
      toast({ title: "Order updated", description: `Order ${orderId} marked as ${status.replace("_", " ")}.` });
      await refreshDashboard();
    } catch (error) {
      toast({
        title: "Unable to update order",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || !selectedConv) return;

    try {
      const response = await sendMessage(selectedConv, trimmed);
      setMessages((prev) => [...prev, response.message]);
      setChatInput("");
    } catch (error) {
      toast({
        title: "Unable to send message",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const activeConversation = conversations.find((conversation) => conversation.id === selectedConv);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
          <div className="h-24 rounded-2xl bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((key) => (
              <div key={key} className="h-24 rounded-xl bg-muted" />
            ))}
          </div>
          <div className="h-96 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Seller Workspace</h1>
            <p className="text-xs text-muted-foreground">Inventory, orders, tracking, and customer chat</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted" aria-label="Notifications" title="Notifications">
              <Bell className="w-4 h-4 text-foreground" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-muted"
              aria-label="Sign out"
              title="Sign out"
              onClick={() => {
                clearCurrentUser();
                navigate("/seller/auth");
              }}
            >
              <LogOut className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Goods (stock)</p>
              <Package className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{totalStock}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Number of Orders</p>
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{stats?.totalOrders ?? orders.length}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Pending Orders</p>
              <Clock className="w-4 h-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{pendingOrders.length}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{stats?.totalCustomers ?? 0}</p>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Goods Stock Distribution</h3>
            <ChartContainer
              className="h-[220px] w-full"
              config={{
                stock: {
                  label: "Stock",
                  color: "hsl(var(--primary))",
                },
              }}
            >
              <BarChart data={inventoryChartData} margin={{ left: 4, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-20} height={44} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="stock" fill="var(--color-stock)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Orders by Status</h3>
            <ChartContainer
              className="h-[220px] w-full"
              config={{
                processing: { label: "Processing", color: "#f59e0b" },
                inTransit: { label: "In Transit", color: "#3b82f6" },
                delivered: { label: "Delivered", color: "#22c55e" },
                cancelled: { label: "Cancelled", color: "#ef4444" },
              }}
            >
              <PieChart>
                <Pie data={orderStatusChartData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2}>
                  {orderStatusChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Order Value Trend</h3>
            <ChartContainer
              className="h-[220px] w-full"
              config={{
                value: {
                  label: "Order Value",
                  color: "#16a34a",
                },
              }}
            >
              <LineChart data={orderValueTrendData} margin={{ left: 4, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto border-b border-border pb-2">
          {[
            { key: "inventory", label: "Goods Tracking" },
            { key: "orders", label: "Orders" },
            { key: "chat", label: "Chat" },
            { key: "history", label: "Order History" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "inventory" && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 rounded-xl border border-border bg-card p-4">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Item
              </h2>
              <form className="space-y-3" onSubmit={handleAddItem}>
                <input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Item name"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Price"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    required
                  />
                  <input
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="Unit"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <input
                  value={newItemStock}
                  onChange={(e) => setNewItemStock(e.target.value)}
                  type="number"
                  min="0"
                  placeholder="Stock quantity"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={addingItem}
                  className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {addingItem ? "Adding..." : "Add to Inventory"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
              <h2 className="font-semibold text-foreground mb-4">Current Inventory</h2>
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{product.price}/{product.unit} • Stock: {product.stock}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(product.id, product.name)}
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                      title={`Remove ${product.name}`}
                      aria-label={`Remove ${product.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold text-foreground mb-4">Active Orders Tracking</h2>
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div key={order.orderId} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{order.orderId}</p>
                      <p className="text-xs text-muted-foreground">
                        Buyer: {order.buyerName} ({order.buyerEmail || "N/A"})
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                        value={order.status}
                        onChange={(e) => void handleUpdateStatus(order.orderId, e.target.value)}
                        title="Update order status"
                        aria-label={`Update status for ${order.orderId}`}
                      >
                        <option value="processing">Processing</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {pendingOrders.length === 0 && (
                <p className="text-sm text-muted-foreground">No active orders right now.</p>
              )}
            </div>
          </section>
        )}

        {activeTab === "chat" && (
          <section className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4 h-[540px]">
            <div className="rounded-xl border border-border bg-card p-3 overflow-y-auto">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Customer Chats
              </h2>
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConv(conversation.id)}
                    className={`w-full text-left rounded-lg p-3 border transition-colors ${
                      selectedConv === conversation.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{conversation.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card flex flex-col overflow-hidden">
              <div className="border-b border-border p-3">
                <p className="font-medium text-foreground">{activeConversation?.name || "Select a conversation"}</p>
                <p className="text-xs text-muted-foreground">{activeConversation?.farm || "Customer"}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                        msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="mt-1 text-[10px] opacity-70">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-3 flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleSendChat();
                    }
                  }}
                  placeholder="Message customer..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  onClick={() => void handleSendChat()}
                  className="rounded-lg bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
                  title="Send message"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "history" && (
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold text-foreground mb-4">Order History with Buyer Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-3 text-muted-foreground font-medium">Order</th>
                    <th className="py-2 pr-3 text-muted-foreground font-medium">Buyer</th>
                    <th className="py-2 pr-3 text-muted-foreground font-medium">Buyer Email</th>
                    <th className="py-2 pr-3 text-muted-foreground font-medium">Date</th>
                    <th className="py-2 pr-3 text-muted-foreground font-medium">Status</th>
                    <th className="py-2 pr-3 text-muted-foreground font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className="border-b border-border/60">
                      <td className="py-3 pr-3 font-medium text-foreground">{order.orderId}</td>
                      <td className="py-3 pr-3 text-foreground">{order.buyerName}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{order.buyerEmail || "N/A"}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{order.date}</td>
                      <td className="py-3 pr-3 text-foreground capitalize">{order.status.replace("_", " ")}</td>
                      <td className="py-3 pr-3 text-foreground">₹{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Completed Orders: {completedOrders.length} • Total Revenue: ₹{stats?.totalRevenue ?? 0}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
