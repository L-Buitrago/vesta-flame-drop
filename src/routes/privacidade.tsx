import { createFileRoute } from "@tanstack/react-router";
import { openAdsConsentSettings } from "@/components/ads-consent";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade e cookies — VESTA JOIAS" },
      {
        name: "description",
        content: "Entenda como a VESTA JOIAS trata dados, cookies e medição de anúncios da Meta.",
      },
      { property: "og:title", content: "Privacidade e cookies — VESTA JOIAS" },
      {
        property: "og:description",
        content: "Consulte os dados usados para medição de anúncios e gerencie sua escolha.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="privacy-page">
      <p className="eyebrow">PRIVACIDADE</p>
      <h1>Privacidade e cookies</h1>
      <p className="privacy-updated">Atualizado em 9 de novembro de 2026.</p>

      <section>
        <h2>Dados e finalidades</h2>
        <p>
          Quando permitido, a VESTA JOIAS compartilha com a Meta informações sobre navegação,
          produtos visualizados, itens adicionados à sacola e início de checkout. Esses dados são
          usados para medir campanhas, entender resultados e otimizar a veiculação de anúncios.
        </p>
        <p>
          Não usamos esse rastreamento para confirmar uma compra neste site. A compra é concluída
          no ambiente de pagamento da loja, com suas próprias informações e condições.
        </p>
      </section>

      <section>
        <h2>Sua escolha</h2>
        <p>
          Nas regiões que exigem autorização, os cookies e eventos de publicidade ficam bloqueados
          até você aceitar. Recusar impede novos eventos. Você pode mudar sua decisão a qualquer
          momento; a retirada vale imediatamente e também é sincronizada entre abas abertas.
        </p>
        <p>
          Se o seu navegador enviar um sinal de Global Privacy Control, ele prevalecerá sobre uma
          aceitação anterior. Eventos bloqueados não são reenviados depois.
        </p>
        <button type="button" className="privacy-settings-link" onClick={openAdsConsentSettings}>
          Abrir configurações de cookies
        </button>
      </section>

      <section>
        <h2>Registro e compartilhamento</h2>
        <p>
          Guardamos neste navegador um identificador anônimo da escolha, data, região detectada e
          versão deste aviso. Isso permite respeitar sua decisão e comprovar qual texto foi
          apresentado. A Meta é a destinataria dos eventos permitidos para as finalidades acima.
        </p>
        <p>
          Consulte também os{" "}
          <a href="https://www.facebook.com/legal/technology_terms" target="_blank" rel="noreferrer">
            Termos das Ferramentas Comerciais da Meta
          </a>
          . Restrições do conjunto de dados podem ser verificadas no Gerenciador de Eventos da Meta.
        </p>
      </section>

      <section>
        <h2>Contato</h2>
        <p>
          Para dúvidas sobre privacidade ou para solicitar ajuda com suas escolhas, escreva para
          contato@vestajewelry.com.br. A VESTA JOIAS é responsável por manter esta política
          atualizada quando seus dados ou integrações mudarem.
        </p>
      </section>
    </main>
  );
}
