import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/trocas-e-envios")({
  head: () => ({
    meta: [
      { title: "Trocas e envios — VESTA JOIAS" },
      {
        name: "description",
        content: "Consulte prazos de entrega, rastreamento, trocas, devoluções e reembolsos da VESTA JOIAS.",
      },
      { property: "og:title", content: "Trocas e envios — VESTA JOIAS" },
      {
        property: "og:description",
        content: "Frete grátis para o Brasil, entrega rastreada e suporte para trocas e devoluções.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShippingAndReturnsPage,
});

function ShippingAndReturnsPage() {
  return (
    <main className="privacy-page">
      <p className="eyebrow">ATENDIMENTO VESTA</p>
      <h1>Trocas e envios</h1>

      <section>
        <h2>Frete e entrega</h2>
        <p>
          Oferecemos frete grátis para todo o Brasil. A entrega acontece em 2 a 3 semanas,
          com código de rastreamento para acompanhar o pedido.
        </p>
      </section>

      <section>
        <h2>Arrependimento ou troca</h2>
        <p>
          Você pode solicitar troca ou devolução por arrependimento em até 7 dias após o
          recebimento. Em caso de devolução, o reembolso é integral.
        </p>
      </section>

      <section>
        <h2>Defeito da peça</h2>
        <p>
          Se a joia apresentar defeito, você pode solicitar uma nova peça ou reembolso em até
          90 dias.
        </p>
      </section>

      <section>
        <h2>Fale com a gente</h2>
        <p>
          Para solicitar ajuda, escreva para{" "}
          <a href="mailto:vestajoiasltda@gmail.com">vestajoiasltda@gmail.com</a>. Respondemos em
          até 2 dias úteis.
        </p>
      </section>
    </main>
  );
}
