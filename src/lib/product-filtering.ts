/**
 * Utilitários de filtragem de imagens e variações de produtos.
 */

export function filterGalleryByMetal<T extends { url: string; altText?: string | null }>(
  images: T[],
  selectedVariantTitle?: string,
  variants?: Array<{ title: string }>,
  productHandle?: string
): T[] {
  if (!images || images.length === 0) return [];
  if (!variants || variants.length === 0) return images;

  const variantTitles = variants.map((v) => v.title.toLowerCase());
  const hasGoldVariant = variantTitles.some((t) => t.includes("gold") || t.includes("ouro") || t.includes("dourad"));
  const hasSilverVariant = variantTitles.some((t) => t.includes("silver") || t.includes("prat"));

  // Apenas para os produtos que há prata e ouro
  if (!hasGoldVariant || !hasSilverVariant) {
    return images;
  }

  const selectedTitle = (selectedVariantTitle || "").toLowerCase();
  const isSilver = selectedTitle.includes("silver") || selectedTitle.includes("prat");
  const isGold = selectedTitle.includes("gold") || selectedTitle.includes("ouro") || selectedTitle.includes("dourad");

  if (!isSilver && !isGold) {
    return images;
  }

  const isSilverImage = (img: T): boolean => {
    const raw = `${decodeURIComponent(img.url)} ${img.altText || ""}`.toLowerCase();
    if (raw.includes("prat") || raw.includes("silver")) return true;
    if (productHandle && productHandle.includes("necklace-17") && raw.includes("imagemdochatgpt")) return true;
    if (productHandle && productHandle.includes("ring-for-women-luxury") && raw.includes("anelmodernocomtresgemas")) return true;
    if (productHandle && productHandle.includes("necklace-for-women-necklace-4") && raw.includes("retratoelegantecomjoiasdelicadas")) return true;
    return false;
  };

  const isGoldImage = (img: T): boolean => {
    if (isSilverImage(img)) return false;
    const raw = `${decodeURIComponent(img.url)} ${img.altText || ""}`.toLowerCase();
    if (raw.includes("dourad") || raw.includes("ouro") || raw.includes("gold")) return true;
    if (productHandle && productHandle.includes("bracelet-bangle-2") && raw.includes("retratoelegantecomjoiasdecoracao")) return true;
    if (productHandle && raw.includes("maoselegantescomaneldediamantes")) return true;
    return false;
  };

  const silverList = images.filter(isSilverImage);
  const goldList = images.filter(isGoldImage);

  // Se o usuário selecionou prata e há fotos de prata
  if (isSilver && silverList.length > 0) {
    return silverList;
  }

  // Se o usuário selecionou ouro e há fotos de ouro
  if (isGold && goldList.length > 0) {
    return goldList;
  }

  // Se a variação selecionada não possuir fotos específicas no catálogo do fornecedor, mantém a galeria disponível
  return images;
}
