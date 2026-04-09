import { Star, Heart, ShoppingCart, Leaf, ShieldCheck, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { addToCart, getFavorites, toggleFavorite } from "@/lib/api";

interface ProductCardProps {
  name: string;
  farm: string;
  price: number;
  unit: string;
  rating: number;
  image: string;
  isOrganic?: boolean;
  isVerified?: boolean;
  distance?: string;
  discount?: number;
}

const ProductCard = ({
  name,
  farm,
  price,
  unit,
  rating,
  image,
  isOrganic,
  isVerified,
  distance,
  discount,
}: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const productKey = useMemo(() => `${name}::${farm}`, [name, farm]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await getFavorites();
        setIsFavorite(response.productKeys.includes(productKey));
      } catch {
        setIsFavorite(false);
      }
    };

    void loadFavorites();
  }, [productKey]);

  const handleToggleFavorite = async () => {
    try {
      const response = await toggleFavorite(productKey);
      const nowFavorite = response.isFavorite;
      setIsFavorite(nowFavorite);

      toast({
        title: nowFavorite ? "Added to favorites" : "Removed from favorites",
        description: `${name} ${nowFavorite ? "saved" : "removed"} successfully.`,
      });
    } catch {
      toast({
        title: "Could not update favorites",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart({ key: productKey, name, farm, price, unit, image, isOrganic });
      toast({
        title: "Added to cart",
        description: `${name} is now in your cart.`,
      });
    } catch {
      toast({
        title: "Could not add to cart",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOrganic && (
            <span className="badge-organic">
              <Leaf className="w-3 h-3" /> Organic
            </span>
          )}
          {discount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
              -{discount}%
            </span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={() => void handleToggleFavorite()}
          className="absolute top-2 right-2 p-2 rounded-full bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-card"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "text-destructive fill-destructive" : "text-foreground"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 lg:p-4">
        <div className="flex items-center gap-1 mb-1">
          {isVerified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
          <p className="text-xs text-muted-foreground truncate">{farm}</p>
          {distance && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground ml-auto">
              <MapPin className="w-3 h-3" />{distance}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-sm lg:text-base text-foreground truncate">{name}</h3>

        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
          <span className="text-xs font-medium text-foreground">{rating}</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="font-display font-bold text-base lg:text-lg text-foreground">
              ₹{price}
            </span>
            <span className="text-xs text-muted-foreground">/{unit}</span>
          </div>
          <button
            onClick={() => void handleAddToCart()}
            className="p-2 lg:p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
