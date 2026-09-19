import anelChama from "@/assets/anel-chama.jpg";
import brincosOliva from "@/assets/brincos-oliva.jpg";
import colarEmber from "@/assets/colar-ember.jpg";
import pulseiraHestia from "@/assets/pulseira-hestia.jpg";

export type Product = {
  id: string;
  name: string;
  category: "Anéis" | "Brincos" | "Colares" | "Pulseiras";
  price: number;
  stock: number;
  number: number;
  image: string;
  description: string;
  sizes?: number[];
};

export const products: Product[] = [
  { id: "anel-chama", name: "Anel Chama", category: "Anéis", price: 1890, stock: 12, number: 7, image: anelChama, sizes: [12, 14, 16, 18, 20], description: "Uma chama esculpida em ouro 18k, polida à mão para capturar e devolver a luz." },
  { id: "brincos-oliva", name: "Brincos Oliva", category: "Brincos", price: 1490, stock: 8, number: 12, image: brincosOliva, description: "Folhas de oliveira em ouro 18k, símbolo de permanência e serenidade." },
  { id: "colar-ember", name: "Colar Ember", category: "Colares", price: 2190, stock: 17, number: 3, image: colarEmber, description: "Uma centelha delicada suspensa por corrente fina em ouro 18k." },
  { id: "pulseira-hestia", name: "Pulseira Héstia", category: "Pulseiras", price: 3900, stock: 0, number: 30, image: pulseiraHestia, description: "Bracelete em ouro 18k gravado com o movimento contínuo do fogo." },
  { id: "brinco-alento", name: "Brinco Alento", category: "Brincos", price: 890, stock: 21, number: 9, image: brincosOliva, description: "Um traço de ouro leve como o primeiro sopro que acende a chama." },
  { id: "gargantilha-ignea", name: "Gargantilha Ígnea", category: "Colares", price: 2890, stock: 6, number: 18, image: colarEmber, description: "O calor do ouro desenhado rente à pele em uma linha essencial." },
  { id: "anel-solsticio", name: "Anel Solstício", category: "Anéis", price: 2490, stock: 4, number: 26, image: anelChama, sizes: [12, 14, 16, 18, 20], description: "Volumes luminosos celebram o instante em que a luz muda de direção." },
  { id: "alianca-vesta", name: "Aliança Vesta", category: "Anéis", price: 1290, stock: 14, number: 16, image: pulseiraHestia, sizes: [12, 14, 16, 18, 20], description: "Um círculo contínuo, lapidado para atravessar gerações." },
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);