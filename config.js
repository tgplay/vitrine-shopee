// Configuração da vitrine. O resto do código lê daqui.
window.VITRINE_CONFIG = {
  siteUrl: "https://tgplay.github.io/vitrine-shopee/",

  // Contador de visitas e cliques (GoatCounter, gratuito e sem cookies).
  // Crie a conta em https://www.goatcounter.com e cole aqui o código escolhido:
  // "achadinhos" para https://achadinhos.goatcounter.com. Vazio = sem contador.
  goatcounter: "achadinhos",

  // Campanhas: cada uma tem uma página em <chave>/index.html.
  // Um produto entra na campanha com "campaigns": ["<chave>"] em produtos.js.
  // Entre start e end (inclusive), a página inicial mostra um atalho para a campanha.
  campaigns: {
    "11-11": {
      title: "11.11 da Shopee",
      subtitle: "Achadinhos selecionados para o 11.11, o dia de ofertas da Shopee",
      emoji: "🛒",
      start: "2026-11-04",
      end: "2026-11-11"
    },
    "black-friday": {
      title: "Black Friday",
      subtitle: "Achadinhos selecionados para a Black Friday de 27/11",
      emoji: "🖤",
      start: "2026-11-18",
      end: "2026-11-30"
    }
  }
};
