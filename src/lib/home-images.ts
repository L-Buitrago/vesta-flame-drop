import heroPearlsDesktop from "@/assets/home/vesta-hero-pearls-1600.webp.asset.json";
import heroPearlsMobile from "@/assets/home/vesta-hero-pearls-800.webp.asset.json";
import heroCoconutDesktop from "@/assets/home/vesta-hero-coconut-1600.webp.asset.json";
import heroCoconutMobile from "@/assets/home/vesta-hero-coconut-800.webp.asset.json";
import collectionDesktop from "@/assets/home/vesta-collection-1600.webp.asset.json";
import collectionMobile from "@/assets/home/vesta-collection-800.webp.asset.json";
import cliente1Desktop from "@/assets/home/cliente-1-800.webp.asset.json";
import cliente1Mobile from "@/assets/home/cliente-1-480.webp.asset.json";
import cliente2Desktop from "@/assets/home/cliente-2-800.webp.asset.json";
import cliente2Mobile from "@/assets/home/cliente-2-480.webp.asset.json";
import cliente3Desktop from "@/assets/home/cliente-3-800.webp.asset.json";
import cliente3Mobile from "@/assets/home/cliente-3-480.webp.asset.json";
import cliente4Desktop from "@/assets/home/cliente-4-800.webp.asset.json";
import cliente4Mobile from "@/assets/home/cliente-4-480.webp.asset.json";
import cliente5Desktop from "@/assets/home/cliente-5-800.webp.asset.json";
import cliente5Mobile from "@/assets/home/cliente-5-480.webp.asset.json";
import cliente6Desktop from "@/assets/home/cliente-6-800.webp.asset.json";
import cliente6Mobile from "@/assets/home/cliente-6-480.webp.asset.json";

type AssetPointer = { url: string };

export type ResponsiveImage = {
  desktop: AssetPointer;
  mobile: AssetPointer;
  desktopWidth: number;
  mobileWidth: number;
  width: number;
  height: number;
};

export const responsiveSrcSet = (image: ResponsiveImage) =>
  `${image.mobile.url} ${image.mobileWidth}w, ${image.desktop.url} ${image.desktopWidth}w`;

export const heroPearls: ResponsiveImage = {
  desktop: heroPearlsDesktop,
  mobile: heroPearlsMobile,
  desktopWidth: 1600,
  mobileWidth: 800,
  width: 1600,
  height: 900,
};

export const heroCoconut: ResponsiveImage = {
  desktop: heroCoconutDesktop,
  mobile: heroCoconutMobile,
  desktopWidth: 1024,
  mobileWidth: 800,
  width: 1024,
  height: 576,
};

export const collectionImage: ResponsiveImage = {
  desktop: collectionDesktop,
  mobile: collectionMobile,
  desktopWidth: 819,
  mobileWidth: 800,
  width: 819,
  height: 1024,
};

const customerImage = (
  desktop: AssetPointer,
  mobile: AssetPointer,
): ResponsiveImage => ({
  desktop,
  mobile,
  desktopWidth: 800,
  mobileWidth: 480,
  width: 800,
  height: 993,
});

export const customerImages: [
  ResponsiveImage,
  ResponsiveImage,
  ResponsiveImage,
  ResponsiveImage,
  ResponsiveImage,
  ResponsiveImage,
] = [
  customerImage(cliente1Desktop, cliente1Mobile),
  customerImage(cliente2Desktop, cliente2Mobile),
  customerImage(cliente3Desktop, cliente3Mobile),
  customerImage(cliente4Desktop, cliente4Mobile),
  customerImage(cliente5Desktop, cliente5Mobile),
  customerImage(cliente6Desktop, cliente6Mobile),
];
