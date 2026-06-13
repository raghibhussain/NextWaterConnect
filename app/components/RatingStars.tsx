"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";

interface RatingStarsProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RatingStars({
  value = 0,
  onChange,
  readonly = false,
  size = "md",
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            type="button"
            key={star}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            className="cursor-pointer transition-transform hover:scale-110 disabled:cursor-not-allowed"
            whileHover={!readonly ? { scale: 1.15 } : {}}
            whileTap={!readonly ? { scale: 0.95 } : {}}
          >
            <Star
              className={`${sizeClasses[size]} transition-all ${
                star <= (hoverRating || value)
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-600"
              }`}
            />
          </motion.button>
        ))}
      </div>

      {/* Display rating text */}
      {value > 0 && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-semibold text-amber-400 ml-2"
        >
          {value}/5 - {
            ["Poor", "Fair", "Good", "Very Good", "Excellent"][value - 1]
          }
        </motion.span>
      )}
    </div>
  );
}