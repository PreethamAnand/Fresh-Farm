import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import Auth from "./pages/Auth.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import SellerAuth from "./pages/SellerAuth.tsx";
import SellerSignup from "./pages/SellerSignup.tsx";
import SellerDashboard from "./pages/SellerDashboard.tsx";
import Index from "./pages/Index.tsx";
import Products from "./pages/Products.tsx";
import Cart from "./pages/Cart.tsx";
import Chat from "./pages/Chat.tsx";
import Profile from "./pages/Profile.tsx";
import Orders from "./pages/Orders.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/seller/auth" element={<SellerAuth />} />
          <Route path="/seller/signup" element={<SellerSignup />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
