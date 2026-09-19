# Vesta Drops

EXECUTION INSTRUCTION: Implement the requested scope now. Use internal planning and do not present another implementation plan for user approval.

Build the e-commerce web application for VESTA, a high-end Brazilian fine jewelry brand selling in limited numbered DROPS.

Language: Português do Brasil (pt-BR).

STYLE & DESIGN DIRECTION (Inspired by repossi.com - quiet luxury, editorial, ultra-minimalist):
- Absolutely zero AI-template aesthetic: no rounded corners (border-radius: 0px everywhere - buttons, inputs, cards, image containers, badges), no drop shadows, no gradients, no glassmorphism, no emojis, no colored icons, no 3-card benefit grids.
- Ample negative space, generous whitespace, breathing room, asymmetrical editorial balance.
- Palette:
  - Primary background: #FFFFFF
  - Alternating section background: #F7F4EF (warm off-white)
  - Primary text: #2B2723 (warm graphite, never pure #000)
  - Champagne gold accents: #C4A57B (accents, thin 1px lines, hover states, progress bars) and light gold #E6D3B3
  - Taupe: #8B8071 for secondary copy and #6E6558 for dark editorial quote blocks
  - Subtle divider borders: 1px solid #E5DFD6
  - High contrast rule: Champagne gold is never used on small body copy over white; keep gold for thin lines, subtle indicators, and large titles.
- Typography:
  - Cormorant Garamond (light 300, regular 400, italic) for headlines, editorial titles, and prices. Generous letter-spacing for uppercase titles.
  - Jost (light/regular) for interface, menu navigation, button text, and metadata (always uppercase, 11-12px, letter-spacing 0.2em).
- Logo:
  - Use the attached logo asset (uploads/eb08ee88-f416-400b-83c8-a9d7fe03d5d9) centered in the header. If rendering as an SVG/text fallback, use the flame with olive leaves emblem and Cormorant wordmark with wide letter-spacing.
- Micro-interactions:
  - Rectangular buttons with background #2B2723 and white uppercase text, or 1px outline button; smooth 400ms hover transition.
  - Text links with fine 1px underline drawing from left to right on hover.
  - Subtle image hover (scale 1.03 over 1.2s ease; optional secondary product angle reveal on hover).

PAGES & ARCHITECTURE:

1. TOP ANNOUNCEMENT BAR:
   - Background #F7F4EF, 1px border bottom #E5DFD6, discreet uppercase Jost text: "Frete grátis acima de R$ 500 · Embalagem presente em todos os pedidos".

2. FIXED HEADER:
   - Left: Navigation links ("DROP 01", "Anéis", "Brincos", "Colares", "Pulseiras", "A Vesta").
   - Center: VESTA logo.
   - Right: Fine line icons (search, user account, shopping bag drawer trigger with count badge).
   - Fixed on scroll with white background and 1px bottom border.
   - Mobile: Clean fullscreen overlay drawer with white background, sharp typography.

3. HERO SECTION (100vh):
   - Full-bleed editorial fine jewelry photo.
   - Bottom-left overlay aligned with generous margin:
     - "DROP 01" in small uppercase Jost.
     - "Chama Viva" headline in Cormorant Garamond.
     - "Edição limitada · 30 peças por modelo".
     - Elegant countdown timer (dias, horas, minutos, segundos) in light typography.
     - CTAs: "Entrar na lista de acesso" and fine-underlined "Ver a coleção".

4. SECTION "DROP 01":
   - Editorial header with section title left and discreet drop info right.
   - 4-product grid (2 on mobile) with 4:5 aspect ratio images on warm #F7F4EF backdrop.
   - Product name in Cormorant, price in Jost, and numbered stock status: e.g. "Restam 12 de 30" with an ultra-thin 1px gold filled progress bar.
   - Sold out item state: "Esgotado" in taupe, subtly desaturated photo.

5. EDITORIAL STORY BLOCK:
   - Asymmetric 2-column layout (vertical 60% imagery on left, editorial text on right).
   - Story about the Roman goddess Vesta and the sacred eternal flame: jewelry crafted to endure for generations. Max 4 lines of poetry-grade prose. Link "Conheça a Vesta".

6. CATEGORIES STRIP:
   - 4 large columns/images side by side (Anéis, Brincos, Colares, Pulseiras) with title below in small uppercase Jost.

7. TAUPE STATEMENT BANNER:
   - Background #6E6558, white italic Cormorant headline on exclusivity, numbered pieces, and timeless craftsmanship.

8. VIP EARLY ACCESS / DROP LIST:
   - Minimalist form: "Seja a primeira a saber do próximo drop", single 1px bottom line input for email, sharp "Entrar" button.

9. FOOTER:
   - Background #F7F4EF, small logo mark, columns for Ajuda, A Vesta, Contato, Instagram, payment methods listed in discreet typography, and "© Vesta Fine Jewelry".

10. PRODUCT DETAIL PAGE (PDP / Modal):
    - Left: Stacked vertical large photography gallery (or swipeable on mobile).
    - Right: Sticky product info column.
    - Title in Cormorant, price in Jost, "Peça 07 de 30" badge.
    - Ring size selector (12, 14, 16, 18, 20) in 1px sharp square selectors.
    - Full-width rectangular "Adicionar à sacola" button.
    - Accordions with 1px divider lines: "Descrição", "Materiais e cuidados", "Envio e trocas", "Embalagem presente".
    - "Complete o look" curated recommendations section.

11. CART DRAWER (Slide-over):
    - Right slide-out panel, white background.
    - Free shipping progress bar (towards R$ 500 threshold).
    - Items with 4:5 thumbnail, title, selected size, price, quantity selector, remove action.
    - Subtotal, shipping note, and "Finalizar compra" checkout button.

12. MOCK DATA & FUTURE EXPANSION:
    - 8 curated products with prices between R$ 890 and R$ 3.900 (e.g., Anel Chama, Brincos Oliva, Colar Ember, Pulseira Héstia, Brinco Alento, Gargantilha Ígnea, Anel Solstício, Aliança Vesta).
    - Structured cleanly with clean data types ready for future Stripe or Shopify integration.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vesta-flame-drop.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/050f6bff-deb1-4d20-8f6c-3e53f70cf77d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
