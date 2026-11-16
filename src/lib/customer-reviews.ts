import { customerImages, type ResponsiveImage } from "@/lib/home-images";

export type CustomerReview = {
  name: string;
  rating: number;
  text: string;
  product?: string;
  handle?: string;
};

export type CustomerPhoto = {
  image: ResponsiveImage;
  alt: string;
  review?: CustomerReview;
};

export const customerPhotos: CustomerPhoto[] = [
  {
    image: customerImages[0],
    alt: "Cliente segurando um anel Vesta dourado com zircônias na palma da mão",
    review: {
      name: "Luciana S.",
      rating: 5,
      text: "O anel é lindíssimo e de excelente qualidade",
    },
  },
  {
    image: customerImages[1],
    alt: "Cliente usando colar com pingente de borboleta e brinco de argola Vesta",
    review: {
      name: "Ana Paula N.",
      rating: 5,
      text: "É lindo!",
      product: "Colar Malha Borboleta Livre",
      handle: "square-pendants-delicate-stainless-steel-chain-pendant-necklace-for-women-necklace-1",
    },
  },
  {
    image: customerImages[2],
    alt: "Cliente usando brinco e colar dourados Vesta",
    review: {
      name: "Mayara N.",
      rating: 5,
      text: "Tudo certinho conforme anúncio, muito obrigada, mega satisfeita, vou comprar mais",
    },
  },
  {
    image: customerImages[3],
    alt: "Colar Vesta com pingente de serpente sobre a mesa",
    review: {
      name: "Edna P.",
      rating: 5,
      text: "Amei meus produtos, comprei e vou comprar mais!!",
      product: "Colar Serpente Pingente",
      handle: "square-pendants-delicate-stainless-steel-chain-pendant-necklace-for-women-necklace-21",
    },
  },
  {
    image: customerImages[4],
    alt: "Dois anéis dourados Vesta sobre a penteadeira",
    review: {
      name: "Elisabete M.",
      rating: 5,
      text: "Amei, muito bonito, igual da foto",
      product: "Anel Aro Triplo Algarismo Romano",
      handle: "personality-round-beads-ring-band-small-clear-crystal-zircon-waterproof-stainless-steel-gold-rings-simple-granular-fine-jewelry-1",
    },
  },
  {
    image: customerImages[5],
    alt: "Cliente usando colar dourado Vesta com medalha",
    review: {
      name: "Andréa M.",
      rating: 5,
      text: "A peça é linda e tem um acabamento impecável!! Amei ❤️",
    },
  },
];
