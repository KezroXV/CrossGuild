import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface SafeAvatarProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  userName?: string; // For generating initials fallback
}

const SafeAvatar: React.FC<SafeAvatarProps> = ({
  src,
  alt,
  width = 40,
  height = 40,
  className = "",
  userName,
}) => {
  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("SafeAvatar props:", {
      src,
      alt,
      width,
      height,
      className,
      userName,
    });
  }

  // Get initials from user name for avatar fallback
  const getInitials = (name?: string) => {
    if (!name || name === "Anonymous" || name === "Anonymous User") return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Check if the image URL is problematic (local uploads that won't work in production)
  const isProblematicUrl =
    src?.startsWith("/uploads/") && process.env.NODE_ENV === "production";

  // Don't use problematic URLs in production
  const finalSrc = isProblematicUrl ? null : src;

  // Debug the final src
  if (process.env.NODE_ENV === "development") {
    console.log("SafeAvatar finalSrc:", finalSrc);
  }
  return (
    <Avatar
      className={`${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {finalSrc && <AvatarImage src={finalSrc} alt={alt} />}
      <AvatarFallback className="text-xs">
        {getInitials(userName)}
      </AvatarFallback>
    </Avatar>
  );
};

export default SafeAvatar;
