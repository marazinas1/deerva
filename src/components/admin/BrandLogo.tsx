/**
 * The Deerva wordmark. The stored asset is off-white, so on light surfaces it
 * is knocked down to ink rather than shipping a second file.
 */
export default function BrandLogo({
  variant = "light",
  className,
}: {
  /** "light" = the mark sits on a light surface; "dark" = on ink. */
  variant?: "light" | "dark";
  className?: string;
}) {
  return (
    <img
      src="/logo.png?v=5"
      alt="Deerva"
      className={className}
      style={variant === "light" ? { filter: "brightness(0)" } : undefined}
    />
  );
}
