import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const PORT = Number.parseInt(process.env.API_PORT ?? "3001", 10);
const DB_NAME = process.env.MONGODB_DB ?? "farmFreshConnect";
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) || true,
  })
);
app.use(express.json());

let db;

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function signToken(user) {
  return jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function getAuthHeaderToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice(7).trim();
}

function requireAuth(req, res, next) {
  const token = getAuthHeaderToken(req);

  if (!token) {
    res.status(401).json({ error: "Missing authorization token." });
    return;
  }

  if (token === "guest-token") {
    req.auth = { userId: "guest_local", email: "guest@freshfarm.local", role: "guest" };
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session token." });
  }
}

function enforceUserAccess(req, res) {
  const requestedUserId = req.params.userId ?? req.body?.userId;
  if (!requestedUserId) {
    return true;
  }

  if (requestedUserId === "me") {
    return true;
  }

  // Backward compatibility: old guest sessions used guest_* ids before JWT migration.
  if (req.auth.role === "guest" && req.auth.userId === "guest_local" && String(requestedUserId).startsWith("guest_")) {
    return true;
  }

  if (requestedUserId !== req.auth.userId) {
    res.status(403).json({ error: "You are not allowed to access this user data." });
    return false;
  }

  return true;
}

const defaultConversations = [
  {
    name: "Rajesh Kumar",
    farm: "Green Valley Farm",
    avatar: "🧑‍🌾",
    isVerified: true,
    online: true,
    unread: 2,
    updatedAt: new Date(),
    lastMessage: "Your tomatoes are ready for pickup!",
  },
  {
    name: "Priya Sharma",
    farm: "Happy Hen Farms",
    avatar: "👩‍🌾",
    isVerified: true,
    online: true,
    unread: 0,
    updatedAt: new Date(Date.now() - 15 * 60_000),
    lastMessage: "We have fresh eggs available",
  },
  {
    name: "Amit Patel",
    farm: "Bee Sweet Apiary",
    avatar: "🧔",
    isVerified: false,
    online: false,
    unread: 1,
    updatedAt: new Date(Date.now() - 60 * 60_000),
    lastMessage: "Honey harvest will be ready next week",
  },
];

const defaultMessages = [
  [
    { sender: "user", text: "Hi! I wanted to ask about your organic tomatoes" },
    { sender: "farmer", text: "Hello! Yes, we have fresh cherry and Roma tomatoes available today 🍅" },
    { sender: "farmer", text: "They were harvested this morning. Would you like to place an order?" },
  ],
  [{ sender: "farmer", text: "We have fresh eggs available today." }],
  [{ sender: "farmer", text: "Honey harvest will be ready next week." }],
];

function getCollections() {
  return {
    users: db.collection("users"),
    carts: db.collection("carts"),
    orders: db.collection("orders"),
    sellerOrders: db.collection("sellerOrders"),
    sellerProducts: db.collection("sellerProducts"),
    favorites: db.collection("favorites"),
    conversations: db.collection("conversations"),
    messages: db.collection("messages"),
  };
}

function getTimeLabel(dateValue) {
  const date = new Date(dateValue);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function ensureChatSeed(userId) {
  const { conversations, messages } = getCollections();
  const existing = await conversations.countDocuments({ userId });
  if (existing > 0) return;

  const now = Date.now();
  const seededConversations = defaultConversations.map((conversation, index) => ({
    ...conversation,
    _id: `${userId}-conv-${index + 1}`,
    userId,
    updatedAt: new Date(now - index * 15 * 60_000),
  }));

  await conversations.insertMany(seededConversations);

  const seedMessageDocs = seededConversations.flatMap((conversation, index) =>
    (defaultMessages[index] ?? []).map((message, messageIndex) => ({
      userId,
      conversationId: conversation._id,
      sender: message.sender,
      text: message.text,
      createdAt: new Date(now - ((defaultMessages[index]?.length ?? 1) - messageIndex) * 60_000),
    }))
  );

  if (seedMessageDocs.length > 0) {
    await messages.insertMany(seedMessageDocs);
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "farm-fresh-connect-api" });
});

app.use("/api", (req, res, next) => {
  if (req.path === "/health" || req.path.startsWith("/auth/")) {
    next();
    return;
  }

  requireAuth(req, res, next);
});

function detectCategoryFromName(name) {
  const value = String(name).toLowerCase();
  if (/(tomato|spinach|onion|chilli|coriander|potato|carrot|cabbage|pumpkin)/i.test(value)) return "vegetables";
  if (/(mango|banana|apple|orange|grape|papaya|guava)/i.test(value)) return "fruits";
  if (/(egg|milk|paneer|curd|cheese|butter|yogurt)/i.test(value)) return "dairy";
  if (/(rice|wheat|grain|millet|barley|oat)/i.test(value)) return "grains";
  return "vegetables";
}

function getCategorySeedProducts() {
  return [
    {
      id: "seed-veg-1",
      name: "Fresh Organic Tomatoes",
      farm: "Green Valley Farm",
      price: 60,
      unit: "kg",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop",
      isOrganic: true,
      isVerified: true,
      distance: "Nearby",
      stock: 120,
      category: "vegetables",
    },
    {
      id: "seed-veg-2",
      name: "Baby Spinach",
      farm: "Sunrise Organics",
      price: 45,
      unit: "250g",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop",
      isOrganic: true,
      isVerified: true,
      distance: "Nearby",
      stock: 90,
      category: "vegetables",
    },
    {
      id: "seed-fruit-1",
      name: "Alphonso Mangoes",
      farm: "Ratnagiri Farms",
      price: 450,
      unit: "dozen",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop",
      isOrganic: true,
      isVerified: true,
      distance: "Nearby",
      stock: 40,
      category: "fruits",
    },
    {
      id: "seed-fruit-2",
      name: "Farm Bananas",
      farm: "Coastal Fruits",
      price: 70,
      unit: "dozen",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1574226516831-e1dff420e37f?w=400&h=400&fit=crop",
      isOrganic: true,
      isVerified: true,
      distance: "Nearby",
      stock: 65,
      category: "fruits",
    },
    {
      id: "seed-dairy-1",
      name: "Farm Fresh Eggs",
      farm: "Happy Hen Farms",
      price: 90,
      unit: "dozen",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
      isOrganic: true,
      isVerified: true,
      distance: "Nearby",
      stock: 180,
      category: "dairy",
    },
    {
      id: "seed-dairy-2",
      name: "A2 Cow Milk",
      farm: "Gir Gaushala",
      price: 70,
      unit: "ltr",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
      isOrganic: true,
      isVerified: true,
      distance: "Nearby",
      stock: 110,
      category: "dairy",
    },
    {
      id: "seed-grain-1",
      name: "Basmati Rice",
      farm: "Punjab Heritage",
      price: 120,
      unit: "kg",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
      isOrganic: false,
      isVerified: true,
      distance: "Nearby",
      stock: 200,
      category: "grains",
    },
    {
      id: "seed-grain-2",
      name: "Whole Wheat",
      farm: "Harvest Collective",
      price: 55,
      unit: "kg",
      rating: 4.4,
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop",
      isOrganic: false,
      isVerified: true,
      distance: "Nearby",
      stock: 140,
      category: "grains",
    },
  ];
}

app.get("/api/products", async (_req, res) => {
  try {
    const { sellerProducts } = getCollections();
    const docs = await sellerProducts
      .find({ status: "active", stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    const mapped = docs.map((product) => ({
      id: product.productId,
      name: product.name,
      farm: product.farm,
      price: Number(product.price),
      unit: product.unit,
      rating: Number(product.rating ?? 4.5),
      image: product.image,
      isOrganic: Boolean(product.isOrganic),
      isVerified: Boolean(product.isVerified),
      distance: "Nearby",
      stock: Number(product.stock ?? 0),
      category: detectCategoryFromName(product.name),
    }));

    // Remove repeated products from multiple demo seller sessions.
    const dedupeMap = new Map();
    for (const product of mapped) {
      const key = `${String(product.name).trim().toLowerCase()}`;
      if (!dedupeMap.has(key)) {
        dedupeMap.set(key, product);
      }
    }

    const products = Array.from(dedupeMap.values());

    // Guarantee at least 2 products per visible category.
    const requiredCategories = ["vegetables", "fruits", "dairy", "grains"];
    const seedProducts = getCategorySeedProducts();

    for (const category of requiredCategories) {
      let currentCount = products.filter((product) => product.category === category).length;
      if (currentCount >= 2) continue;

      const candidates = seedProducts.filter((product) => product.category === category);
      for (const candidate of candidates) {
        if (currentCount >= 2) break;
        const key = `${String(candidate.name).trim().toLowerCase()}`;
        if (!dedupeMap.has(key)) {
          dedupeMap.set(key, candidate);
          products.push(candidate);
          currentCount += 1;
        }
      }
    }

    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to fetch marketplace products" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const { users } = getCollections();
    const normalizedEmail = normalizeEmail(email);
    const user = await users.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    if (!user.passwordHash) {
      // One-time migration for accounts created before password hashing existed.
      const migratedHash = await bcrypt.hash(String(password), 12);
      await users.updateOne({ userId: user.userId }, { $set: { passwordHash: migratedHash } });
      user.passwordHash = migratedHash;
    }

    const passwordMatches = await bcrypt.compare(String(password), user.passwordHash);
    if (!passwordMatches) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    await ensureChatSeed(user.userId);
    const safeUser = { userId: user.userId, name: user.name, email: user.email, role: user.role ?? "buyer" };
    res.json({ user: safeUser, token: signToken(safeUser) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Login failed" });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    if (!name || !email || !password) {
      res.status(400).json({ error: "Name, email and password are required." });
      return;
    }

    const { users } = getCollections();
    const normalizedEmail = normalizeEmail(email);
    const existing = await users.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409).json({ error: "Account already exists for this email." });
      return;
    }

    const passwordHash = await bcrypt.hash(String(password), 12);

    const user = {
      userId: `user_${Date.now()}`,
      name,
      email: normalizedEmail,
      passwordHash,
      role: "buyer",
      createdAt: new Date(),
    };
    await users.insertOne(user);

    await ensureChatSeed(user.userId);
    const safeUser = { userId: user.userId, name: user.name, email: user.email, role: user.role };
    res.status(201).json({ user: safeUser, token: signToken(safeUser) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Signup failed" });
  }
});

app.post("/api/auth/guest", async (_req, res) => {
  try {
    const user = {
      userId: `guest_${Date.now()}`,
      name: "Guest User",
      email: "guest@freshfarm.local",
      role: "guest",
    };

    await ensureChatSeed(user.userId);
    res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Guest login failed" });
  }
});

app.post("/api/auth/seller-guest", async (_req, res) => {
  try {
    const user = {
      userId: `seller_guest_${Date.now()}`,
      name: "Demo Seller",
      email: "seller@freshfarm.local",
      role: "seller",
      farmName: "Fresh Valley Farm",
    };

    await ensureChatSeed(user.userId);
    res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Seller guest login failed" });
  }
});

app.get("/api/cart/:userId", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    const { carts } = getCollections();
    const cart = await carts.findOne({ userId: req.auth.userId });
    res.json({ items: cart?.items ?? [] });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to fetch cart" });
  }
});

app.post("/api/cart/:userId/items", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    const { carts } = getCollections();
    const userId = req.auth.userId;
    const { product } = req.body ?? {};

    if (!product?.key || !product?.name || !product?.price) {
      res.status(400).json({ error: "Invalid product payload." });
      return;
    }

    const cart = (await carts.findOne({ userId })) ?? { userId, items: [] };
    const existing = cart.items.find((item) => item.key === product.key);
    const nextItems = existing
      ? cart.items.map((item) => (item.key === product.key ? { ...item, qty: item.qty + 1 } : item))
      : [...cart.items, { ...product, qty: 1 }];

    await carts.updateOne(
      { userId },
      { $set: { items: nextItems, updatedAt: new Date() } },
      { upsert: true }
    );

    res.status(201).json({ items: nextItems });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to add cart item" });
  }
});

app.patch("/api/cart/:userId/items/:itemKey", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    const { carts } = getCollections();
    const userId = req.auth.userId;
    const itemKey = decodeURIComponent(req.params.itemKey);
    const { delta, qty } = req.body ?? {};

    const cart = await carts.findOne({ userId });
    if (!cart) {
      res.status(404).json({ error: "Cart not found." });
      return;
    }

    const nextItems = cart.items
      .map((item) => {
        if (item.key !== itemKey) return item;
        const nextQty = typeof qty === "number" ? qty : item.qty + (Number(delta) || 0);
        return { ...item, qty: Math.max(0, nextQty) };
      })
      .filter((item) => item.qty > 0);

    await carts.updateOne({ userId }, { $set: { items: nextItems, updatedAt: new Date() } });
    res.json({ items: nextItems });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to update cart item" });
  }
});

app.delete("/api/cart/:userId/items/:itemKey", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    const { carts } = getCollections();
    const userId = req.auth.userId;
    const itemKey = decodeURIComponent(req.params.itemKey);
    const cart = await carts.findOne({ userId });

    const nextItems = (cart?.items ?? []).filter((item) => item.key !== itemKey);
    await carts.updateOne(
      { userId },
      { $set: { items: nextItems, updatedAt: new Date() } },
      { upsert: true }
    );

    res.json({ items: nextItems });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to remove cart item" });
  }
});

app.post("/api/cart/:userId/checkout", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    const { carts, orders } = getCollections();
    const userId = req.auth.userId;

    const cart = await carts.findOne({ userId });
    const items = cart?.items ?? [];
    if (items.length === 0) {
      res.status(400).json({ error: "Cart is empty." });
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const delivery = subtotal > 500 ? 0 : 40;
    const total = subtotal + delivery;
    const status = "processing";

    const order = {
      userId,
      orderId: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      status,
      total,
      date: new Date(),
      items,
      createdAt: new Date(),
    };

    await orders.insertOne(order);
    await carts.updateOne({ userId }, { $set: { items: [], updatedAt: new Date() } }, { upsert: true });

    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Checkout failed" });
  }
});

app.get("/api/orders/:userId", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    const { orders } = getCollections();
    const result = await orders.find({ userId: req.auth.userId }).sort({ createdAt: -1 }).toArray();

    const mapped = result.map((order) => ({
      orderId: order.orderId,
      status: order.status,
      total: order.total,
      date: new Date(order.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      items: order.items,
    }));

    res.json({ orders: mapped });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to fetch orders" });
  }
});

app.get("/api/favorites/:userId", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    const { favorites } = getCollections();
    const doc = await favorites.findOne({ userId: req.auth.userId });
    res.json({ productKeys: doc?.productKeys ?? [] });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to fetch favorites" });
  }
});

app.post("/api/favorites/:userId/toggle", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    const { favorites } = getCollections();
    const userId = req.auth.userId;
    const { productKey } = req.body ?? {};

    if (!productKey) {
      res.status(400).json({ error: "productKey is required." });
      return;
    }

    const doc = (await favorites.findOne({ userId })) ?? { userId, productKeys: [] };
    const exists = doc.productKeys.includes(productKey);
    const productKeys = exists
      ? doc.productKeys.filter((key) => key !== productKey)
      : [...doc.productKeys, productKey];

    await favorites.updateOne({ userId }, { $set: { productKeys, updatedAt: new Date() } }, { upsert: true });
    res.json({ productKeys, isFavorite: !exists });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to update favorites" });
  }
});

app.get("/api/chat/conversations/:userId", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    const userId = req.auth.userId;
    await ensureChatSeed(userId);

    const { conversations } = getCollections();
    const docs = await conversations.find({ userId }).sort({ updatedAt: -1 }).toArray();

    const mapped = docs.map((conversation) => ({
      id: conversation._id,
      name: conversation.name,
      farm: conversation.farm,
      avatar: conversation.avatar,
      isVerified: conversation.isVerified,
      online: conversation.online,
      unread: conversation.unread,
      lastMessage: conversation.lastMessage,
      time: getTimeLabel(conversation.updatedAt),
    }));

    res.json({ conversations: mapped });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to fetch conversations" });
  }
});

app.get("/api/chat/messages/:conversationId", async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { messages } = getCollections();
    const docs = await messages.find({ conversationId: req.params.conversationId, userId }).sort({ createdAt: 1 }).toArray();

    const mapped = docs.map((message, index) => ({
      id: `${req.params.conversationId}-${index + 1}`,
      sender: message.sender,
      text: message.text,
      time: getTimeLabel(message.createdAt),
    }));

    res.json({ messages: mapped });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to fetch messages" });
  }
});

app.post("/api/chat/messages", async (req, res) => {
  try {
    const { conversationId, sender, text } = req.body ?? {};
    if (!conversationId || !sender || !text) {
      res.status(400).json({ error: "conversationId, sender, and text are required." });
      return;
    }

    const userId = req.auth.userId;

    const { messages, conversations } = getCollections();
    const messageDoc = {
      conversationId,
      userId,
      sender,
      text,
      createdAt: new Date(),
    };

    await messages.insertOne(messageDoc);
    await conversations.updateOne(
      { _id: conversationId, userId },
      {
        $set: {
          lastMessage: text,
          updatedAt: new Date(),
          unread: sender === "user" ? 0 : 1,
        },
      }
    );

    res.status(201).json({
      message: {
        id: `${conversationId}-${Date.now()}`,
        sender,
        text,
        time: getTimeLabel(messageDoc.createdAt),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to send message" });
  }
});

// ===== SELLER ENDPOINTS =====
async function ensureSellerSeed(userId) {
  const { sellerProducts, sellerOrders } = getCollections();
  const productCount = await sellerProducts.countDocuments({ userId });
  if (productCount === 0) {
    await sellerProducts.insertMany([
      {
        productId: `${userId}-prod-1`,
        userId,
        name: "Fresh Organic Tomatoes",
        farm: "Fresh Valley Farm",
        price: 60,
        unit: "kg",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop",
        isOrganic: true,
        isVerified: true,
        stock: 145,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productId: `${userId}-prod-2`,
        userId,
        name: "Farm Fresh Eggs",
        farm: "Fresh Valley Farm",
        price: 90,
        unit: "dozen",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
        isOrganic: true,
        isVerified: true,
        stock: 250,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  }

  const orderCount = await sellerOrders.countDocuments({ sellerId: userId });
  if (orderCount === 0) {
    await sellerOrders.insertMany([
      {
        sellerId: userId,
        orderId: `SORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        buyer: { userId: "buyer_raj_001", name: "Rajesh Patel", email: "rajesh@example.com" },
        items: [{ name: "Fresh Organic Tomatoes", qty: 2, price: 60 }],
        total: 120,
        status: "processing",
        createdAt: new Date(Date.now() - 2 * 60 * 60_000),
      },
      {
        sellerId: userId,
        orderId: `SORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
        buyer: { userId: "buyer_priya_002", name: "Priya Singh", email: "priya@example.com" },
        items: [{ name: "Farm Fresh Eggs", qty: 3, price: 90 }],
        total: 270,
        status: "in_transit",
        createdAt: new Date(Date.now() - 24 * 60 * 60_000),
      },
    ]);
  }
}

app.get("/api/seller/:userId/products", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    if (req.auth.role !== "seller") {
      res.status(403).json({ error: "Seller access required." });
      return;
    }

    const userId = req.auth.userId;
    const { sellerProducts } = getCollections();
    await ensureSellerSeed(userId);

    const docs = await sellerProducts.find({ userId }).sort({ createdAt: -1 }).toArray();
    const products = docs.map((product) => ({
      id: product.productId,
      name: product.name,
      farm: product.farm,
      price: product.price,
      unit: product.unit,
      rating: product.rating,
      image: product.image,
      isOrganic: product.isOrganic,
      isVerified: product.isVerified,
      stock: product.stock,
      status: product.status,
    }));

    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to fetch products" });
  }
});

app.post("/api/seller/:userId/products", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    if (req.auth.role !== "seller") {
      res.status(403).json({ error: "Seller access required." });
      return;
    }

    const userId = req.auth.userId;
    const { name, price, unit, stock, image } = req.body ?? {};
    if (!name || !price || !unit || Number(stock) < 0) {
      res.status(400).json({ error: "name, price, unit and non-negative stock are required." });
      return;
    }

    const { sellerProducts } = getCollections();
    const product = {
      productId: `${userId}-prod-${Date.now()}`,
      userId,
      name: String(name),
      farm: "Fresh Valley Farm",
      price: Number(price),
      unit: String(unit),
      rating: 4.7,
      image:
        image ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop",
      isOrganic: true,
      isVerified: true,
      stock: Number(stock),
      status: Number(stock) > 0 ? "active" : "out_of_stock",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await sellerProducts.insertOne(product);
    res.status(201).json({
      product: {
        id: product.productId,
        name: product.name,
        farm: product.farm,
        price: product.price,
        unit: product.unit,
        rating: product.rating,
        image: product.image,
        isOrganic: product.isOrganic,
        isVerified: product.isVerified,
        stock: product.stock,
        status: product.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to add product" });
  }
});

app.delete("/api/seller/:userId/products/:productId", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    if (req.auth.role !== "seller") {
      res.status(403).json({ error: "Seller access required." });
      return;
    }

    const { sellerProducts } = getCollections();
    const userId = req.auth.userId;
    const productId = decodeURIComponent(req.params.productId);
    const result = await sellerProducts.deleteOne({ userId, productId });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to remove product" });
  }
});

app.get("/api/seller/:userId/orders", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    if (req.auth.role !== "seller") {
      res.status(403).json({ error: "Seller access required." });
      return;
    }

    const userId = req.auth.userId;
    const { sellerOrders } = getCollections();
    await ensureSellerSeed(userId);
    const docs = await sellerOrders.find({ sellerId: userId }).sort({ createdAt: -1 }).toArray();

    const orders = docs.map((order) => ({
      orderId: order.orderId,
      buyerName: order.buyer?.name ?? "Unknown Buyer",
      buyerEmail: order.buyer?.email ?? "",
      buyerUserId: order.buyer?.userId ?? "",
      date: new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: order.status,
      total: order.total,
      items: order.items,
    }));

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to fetch orders" });
  }
});

app.patch("/api/seller/:userId/orders/:orderId", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    if (req.auth.role !== "seller") {
      res.status(403).json({ error: "Seller access required." });
      return;
    }

    const { status } = req.body ?? {};
    if (!["processing", "in_transit", "delivered", "cancelled"].includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const { sellerOrders } = getCollections();
    const result = await sellerOrders.updateOne(
      { sellerId: req.auth.userId, orderId: req.params.orderId },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      res.status(404).json({ error: "Order not found." });
      return;
    }

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to update order" });
  }
});

app.get("/api/seller/:userId/stats", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    if (req.auth.role !== "seller") {
      res.status(403).json({ error: "Seller access required." });
      return;
    }

    const userId = req.auth.userId;
    const { sellerOrders, sellerProducts } = getCollections();
    await ensureSellerSeed(userId);

    const [orders, products] = await Promise.all([
      sellerOrders.find({ sellerId: userId }).toArray(),
      sellerProducts.find({ userId }).toArray(),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pendingOrders = orders.filter((order) => order.status === "processing").length;
    const completedOrders = orders.filter((order) => order.status === "delivered").length;
    const customerSet = new Set(orders.map((order) => order.buyer?.userId).filter(Boolean));

    res.json({
      totalOrders: orders.length,
      totalRevenue,
      activeProducts: products.filter((product) => product.status === "active").length,
      rating: 4.8,
      pendingOrders,
      completedOrders,
      totalCustomers: customerSet.size,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to fetch stats" });
  }
});

// Get seller profile
app.get("/api/seller/:userId/profile", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    
    const profile = {
      userId: req.auth.userId,
      name: "Fresh Valley Farm",
      email: "seller@freshfarm.local",
      phone: "+91 9876543210",
      farmName: "Fresh Valley Farm",
      location: "Pune, Maharashtra",
      bio: "We grow certified organic vegetables and dairy products with love and care.",
      since: "2020",
      isVerified: true,
      avatar: "🧑‍🌾",
    };
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to fetch profile" });
  }
});

// Get seller messages (from customers)
app.get("/api/seller/:userId/messages", async (req, res) => {
  try {
    if (!enforceUserAccess(req, res)) return;
    if (req.auth.role !== "seller") {
      res.status(403).json({ error: "Seller access required." });
      return;
    }

    const userId = req.auth.userId;
    const { conversations } = getCollections();
    await ensureChatSeed(userId);
    const docs = await conversations.find({ userId }).sort({ updatedAt: -1 }).toArray();
    const messages = docs.map((conversation) => ({
      customerId: conversation._id,
      customerName: conversation.name,
      lastMessage: conversation.lastMessage,
      unread: conversation.unread ?? 0,
      time: getTimeLabel(conversation.updatedAt),
    }));

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Unable to fetch messages" });
  }
});

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Set it in your environment or .env file.");
  }

  if (!JWT_SECRET || JWT_SECRET.length < 16) {
    throw new Error("JWT_SECRET is missing or too short. Set a strong value in your environment.");
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
  await client.connect();
  db = client.db(DB_NAME);

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start API server:", error);
  process.exit(1);
});
