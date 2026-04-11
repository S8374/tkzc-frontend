// ItemsCard.tsx
import { ReactNode } from "react";

interface CardItem {
  id: string | number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  extra?: ReactNode;
  onClick?: () => void; // 👈 Added click handler
}

interface CardProps {
  items: CardItem[];
  cardWidth?: {
    base: string;
    sm?: string;
    md?: string;
  };
  cardHeight?: string;
  spaceBetween?: number;
  title?: string;
  icon?: ReactNode;
  className?: string;
  rounded?: boolean;
  loadingItemId?: string | number | null;
}

const ItemsCard = ({
  items,
  cardWidth = { base: "120px", sm: "130px", md: "140px" },
  cardHeight = "140px",
  spaceBetween = 14,
  title,
  icon,
  className = "",
  rounded = true,
  loadingItemId = null,
}: CardProps) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-white font-medium">{title}</h3>
        </div>
      )}

  <div 
  className={`flex flex-wrap ${
    spaceBetween === 4 ? "gap-1" :
    spaceBetween === 8 ? "gap-2" :
    spaceBetween === 12 ? "gap-3" :
    spaceBetween === 16 ? "gap-4" :
    spaceBetween === 20 ? "gap-5" :
    `gap-${Math.round(spaceBetween / 4)}` // fallback
  }`}
>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (loadingItemId === item.id) return;
              item.onClick?.();
            }}
            className={`group flex flex-col border border-black/30 overflow-hidden cursor-pointer bg-black/20 backdrop-blur-sm hover:border-white/30 transition-all ${
              rounded ? "rounded-lg" : ""
            } ${item.onClick ? "hover:scale-[1.02]" : ""} ${loadingItemId === item.id ? "opacity-60 cursor-not-allowed" : ""}`}
            style={{
              width: cardWidth.base,
            }}
          >
            {/* Image */}
            <div
              className="relative w-full overflow-hidden"
              style={{ height: cardHeight }}
            >
              <img
                src={item.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
                alt={item.title}
                className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
              {loadingItemId === item.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                </div>
              )}
            </div>

            {/* Text
            <div className="p-2 text-white">
              <div className="text-sm font-semibold leading-tight truncate">
                {item.title}
              </div>

              {item.subtitle && (
                <div className="text-xs text-gray-400 mt-0.5">
                  {item.subtitle}
                </div>
              )}

              {item.extra && <div className="mt-1">{item.extra}</div>}
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsCard;