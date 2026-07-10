import Image from "next/image";

type LogoProps = {
  height?: number;
  className?: string;
};

/**
 * La Couronne logo from /public/pics/logo.png
 * Use this instead of the crown SVG + "La Couronne" text combo.
 *
 * Sizes (height):
 *   16-20px → mobile nav compact (beside text or standalone)
 *   28-32px → desktop nav header
 *   40-48px → footer / page banners / sub-page headers
 *   56px+   → hero / special placement
 */
export function Logo({ height = 32, className = "" }: LogoProps) {
  return (
    <Image
      src="/pics/logo.png"
      alt="La Couronne Cafe"
      width={Math.round(height * 3)}
      height={height}
      className={className}
      priority
    />
  );
}