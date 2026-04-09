import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface CategoryCardProps {
  name: string;
  icon: string;
  count: number;
  color: string;
}

const iconBgMap: Record<string, string> = {
  "#2E7D32": "bg-emerald-100",
  "#E65100": "bg-orange-100",
  "#1565C0": "bg-blue-100",
  "#F9A825": "bg-amber-100",
  "#00695C": "bg-teal-100",
  "#C62828": "bg-rose-100",
  "#795548": "bg-stone-200",
  "#FF8F00": "bg-yellow-100",
};

const CategoryCard = ({ name, icon, count, color }: CategoryCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(`/products?filter=${encodeURIComponent(name.toLowerCase())}`)}
      className="flex flex-col items-center gap-2 p-3 lg:p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow min-w-[80px] lg:min-w-[100px]"
    >
      <div
        className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-2xl ${iconBgMap[color] ?? "bg-muted"}`}
      >
        {icon}
      </div>
      <div className="text-center">
        <p className="text-xs lg:text-sm font-medium text-foreground">{name}</p>
        <p className="text-[10px] text-muted-foreground">{count} items</p>
      </div>
    </motion.button>
  );
};

export default CategoryCard;
