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
      src={variant === "light" ? "/logo-admin-light.png" : "/logo-admin-dark.png"}
      alt="Deerva"
      className={className}
    />
  );
}
