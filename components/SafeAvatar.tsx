import { useState } from "react";
import Image from "next/image";

interface SafeAvatarProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
}

const SafeAvatar: React.FC<SafeAvatarProps> = ({
  src,
  alt,
  width = 40,
  height = 40,
  className = "",
  fallbackSrc = "/images/default-avatar.svg",
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Check if the image URL is problematic (local uploads that won't work in production)
  const isProblematicUrl =
    imgSrc?.startsWith("/uploads/") && process.env.NODE_ENV === "production";

  const finalSrc = isProblematicUrl ? fallbackSrc : imgSrc || fallbackSrc;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-full ${className}`}
      onError={handleError}
    />
  );
};

export default SafeAvatar;
