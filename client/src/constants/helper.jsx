import { Star, StarHalf } from "lucide-react";
import { Colors } from "./colors";

export const starsGenerator = (
  rating,
  size = 12,                // 👈 SMALL DEFAULT
  fill = Colors.customYellow,
  stroke = "0"
) => {
  return Array.from({ length: 5 }, (_, index) => {
    const half = index + 0.5;

    if (rating >= index + 1) {
      return (
        <Star
          key={index}
          size={size}
          fill={fill}
          stroke={stroke}
        />
      );
    }

    if (rating >= half) {
      return (
        <StarHalf
          key={index}
          size={size}
          fill={fill}
          stroke={stroke}
        />
      );
    }

    return (
      <Star
        key={index}
        size={size}
        stroke={fill}
        fill="none"
      />
    );
  });
};
