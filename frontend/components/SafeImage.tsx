"use client";

export default function SafeImage({ src, alt, className }: any) {
  return (
    <img
      src={src || "/placeholder.png"}
      alt={alt || "image"}
      className={className}
      onError={(e) => (e.currentTarget.src = "/placeholder.png")}
    />
  );
}
