// Monta a vitrine a partir de config.js e produtos.js.
// Cada página define window.VITRINE_PAGE = { base, campaign } antes de carregar este arquivo.
(function () {
  "use strict";

  const config = window.VITRINE_CONFIG || {};
  const allProducts = window.VITRINE_PRODUCTS || [];
  const pageOptions = window.VITRINE_PAGE || {};
  const base = pageOptions.base || "";
  const campaignKey = pageOptions.campaign || null;
  const campaigns = config.campaigns || {};
  const campaign = campaignKey ? campaigns[campaignKey] : null;

  const ITEMS_PER_PAGE = 20;

  // Ícone mostrado no lugar da foto quando o produto ainda não tem image.
  // A ordem desta lista é a ordem das abas.
  const categoryIcons = {
    "Moda & Acessórios": "shirt",
    "Casa & Decoração": "home",
    "Cozinha": "chef-hat",
    "Automotivo": "car",
    "Eletrônicos": "smartphone",
    "Ferramentas": "wrench",
    "Saúde & Fitness": "heart-pulse",
    "Beleza & Cuidados": "scissors",
    "Pet": "paw-print",
    "Outros": "shopping-bag"
  };

  const quickFilters = [
    { key: "todos", label: "✨ Destaques", title: "Produtos e lojas em destaque" },
    { key: "mais-vendidos", label: "🔥 Mais vendidos", title: "Mais vendidos" },
    { key: "ate-30", label: "💸 Até R$ 30", title: "Até R$ 30" },
    { key: "novidades", label: "🆕 Novidades", title: "Novidades" }
  ];

  // Na página de campanha, só os produtos marcados com ela. Sem nenhum marcado, mostra todos com aviso.
  const campaignProducts = campaign ? allProducts.filter(p => (p.campaigns || []).includes(campaignKey)) : [];
  const campaignIsEmpty = Boolean(campaign) && campaignProducts.length === 0;
  const pool = campaign && !campaignIsEmpty ? campaignProducts : allProducts;
  const byId = Object.fromEntries(allProducts.map(p => [p.id, p]));
  const categories = ["Todas", ...Object.keys(categoryIcons).filter(cat => pool.some(p => p.category === cat))];

  const state = { category: "Todas", quick: "todos", search: "", page: 1 };

  const formatBRL = value => `R$ ${value.toFixed(2).replace(".", ",")}`;

  // Busca ignora maiúsculas, acentos e letras estilizadas (ex.: 𝙨𝙝𝙤𝙥𝙚 → shope)
  const normalize = text => String(text).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const escapeHtml = text => String(text).replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  // "336" → 336, "5mil+" → 5000, "1,5mil" → 1500
  function salesNumber(sales) {
    const match = String(sales).replace(/\./g, "").match(/([\d,]+)\s*(mil)?/i);
    if (!match) return 0;
    const value = parseFloat(match[1].replace(",", "."));
    return match[2] ? value * 1000 : value;
  }

  function localToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  // ---------- Contador (GoatCounter) ----------

  function loadAnalytics() {
    if (!config.goatcounter) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://gc.zgo.at/count.js";
    script.dataset.goatcounter = `https://${config.goatcounter}.goatcounter.com/count`;
    document.head.appendChild(script);
  }

  function track(path, title) {
    if (window.goatcounter && typeof window.goatcounter.count === "function") {
      window.goatcounter.count({ path, title, event: true });
    }
  }

  // ---------- Estrutura da página ----------

  function renderHeader() {
    return `
      <header class="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div class="relative">
              <img src="${base}avatar.jpg" alt="Mascote dos Achadinhos da Shopee" class="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg object-cover">
              <span class="absolute bottom-0 right-0 bg-emerald-500 border-2 border-white rounded-full p-1 text-white" title="Perfil verificado">
                <i data-lucide="check-circle-2" class="w-4 h-4"></i>
              </span>
            </div>
            <div>
              <div class="flex items-center justify-center md:justify-start gap-2">
                <a href="${base || "./"}" class="text-2xl md:text-3xl font-extrabold tracking-tight">Achadinhos da Shopee</a>
                <span class="bg-orange-700/60 text-xs px-2.5 py-0.5 rounded-full font-medium border border-orange-400/40">Afiliado Oficial</span>
              </div>
              <p class="text-orange-100 text-sm mt-1 max-w-md">Achadinhos selecionados todos os dias para você!</p>
            </div>
          </div>
        </div>
      </header>`;
  }

  // Na página de campanha: faixa com o nome dela. Na inicial: atalhos para as campanhas em andamento.
  function renderCampaignStrip() {
    if (campaign) {
      return `
        <section class="bg-gray-900 text-white">
          <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p class="text-lg font-extrabold">${campaign.emoji || ""} ${escapeHtml(campaign.title)}</p>
              <p class="text-sm text-gray-300">${escapeHtml(campaign.subtitle || "")}</p>
            </div>
            <a href="${base || "./"}" class="self-start sm:self-auto bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-xl hover:bg-orange-100">Ver todos os achadinhos</a>
          </div>
        </section>`;
    }
    const today = localToday();
    const running = Object.entries(campaigns).filter(([, c]) => c.start <= today && today <= c.end);
    if (running.length === 0) return "";
    return `
      <section class="bg-gray-900 text-white">
        <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 text-sm">
          ${running.map(([key, c]) => `
            <a href="${base}${key}/" class="font-bold hover:text-orange-300">${c.emoji || ""} ${escapeHtml(c.title)}: veja as ofertas →</a>
          `).join("")}
        </div>
      </section>`;
  }

  function renderMain() {
    return `
      <main class="flex-grow max-w-7xl w-full mx-auto px-4 py-6">
        <div class="sticky top-2 z-20 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-md mb-6 border border-gray-100">
          <div class="relative flex-grow">
            <i data-lucide="search" class="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" id="search-input" placeholder="Buscar produtos, lojas ou ofertas..." class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition">
          </div>
          <div id="quick-filters" class="flex gap-2 overflow-x-auto no-scrollbar pt-3 mt-1 border-t border-gray-100"></div>
          <div id="categories-container" class="flex gap-2 overflow-x-auto no-scrollbar pt-2"></div>
        </div>

        ${campaignIsEmpty ? `
          <div class="mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-2xl p-4">
            As ofertas de ${escapeHtml(campaign.title)} estão chegando. Enquanto isso, veja todos os achadinhos abaixo.
          </div>` : ""}

        <div class="flex items-center justify-between mb-4 px-1">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i data-lucide="sparkles" class="w-5 h-5 text-orange-500"></i>
            <span id="section-title"></span>
          </h2>
          <span id="product-count" class="text-xs text-gray-500 font-medium whitespace-nowrap"></span>
        </div>

        <div id="products-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"></div>

        <div id="empty-state" class="hidden flex-col items-center justify-center py-16 text-center">
          <div class="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4">
            <i data-lucide="shopping-bag" class="w-8 h-8"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-800">Nenhum item encontrado</h3>
          <p class="text-gray-500 text-sm mt-1 max-w-xs">Tente buscar por outro termo ou selecione outra categoria.</p>
        </div>

        <div id="pagination-container" class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div class="text-xs text-gray-500 font-medium">
            Exibindo <span id="page-start" class="font-bold text-gray-800"></span> a <span id="page-end" class="font-bold text-gray-800"></span> de <span id="page-total-items" class="font-bold text-gray-800"></span> produtos
          </div>
          <div class="flex items-center gap-2">
            <button id="btn-prev-page" class="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-orange-500 hover:text-white disabled:opacity-40 text-gray-700 text-xs font-bold rounded-xl transition">
              <i data-lucide="chevron-left" class="w-4 h-4"></i> Anterior
            </button>
            <div id="pagination-numbers" class="flex items-center gap-1"></div>
            <button id="btn-next-page" class="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-orange-500 hover:text-white disabled:opacity-40 text-gray-700 text-xs font-bold rounded-xl transition">
              Próximo <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </main>`;
  }

  function renderFooter() {
    return `
      <footer class="mt-6 bg-white border-t border-gray-200">
        <div class="max-w-7xl mx-auto px-4 py-6 text-xs text-gray-500 space-y-2">
          <p><b class="text-gray-700">Este site contém links de afiliado.</b> Ao comprar por eles, posso receber uma comissão da Shopee, sem nenhum custo extra para você.</p>
          <p>Preço, estoque e frete podem mudar: vale o que a Shopee mostrar na hora da compra. Este site é de um afiliado independente e não é da Shopee.</p>
        </div>
      </footer>`;
  }

  // ---------- Lista de produtos ----------

  function currentList() {
    let list = pool.map((p, index) => ({ p, index }));
    if (state.category !== "Todas") list = list.filter(({ p }) => p.category === state.category);
    if (state.search) {
      list = list.filter(({ p }) => normalize(p.title).includes(state.search) || normalize(p.store).includes(state.search));
    }
    if (state.quick === "mais-vendidos") {
      list.sort((a, b) => salesNumber(b.p.sales) - salesNumber(a.p.sales));
    } else if (state.quick === "ate-30") {
      list = list.filter(({ p }) => p.price <= 30).sort((a, b) => a.p.price - b.p.price);
    } else if (state.quick === "novidades") {
      list.sort((a, b) => (b.p.added || "").localeCompare(a.p.added || "") || b.index - a.index);
    }
    return list.map(({ p }) => p);
  }

  function renderImage(p) {
    if (p.image) {
      return `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy">`;
    }
    return `
      <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 text-orange-400">
        <i data-lucide="${categoryIcons[p.category] || "shopping-bag"}" class="w-12 h-12"></i>
      </div>`;
  }

  function renderCard(p) {
    return `
      <div class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between group p-3">
        <div class="relative aspect-square overflow-hidden rounded-xl bg-gray-100 mb-2">
          ${renderImage(p)}
          <span class="absolute top-2 left-2 bg-white/90 text-gray-700 font-bold text-[10px] px-2 py-0.5 rounded-full">${escapeHtml(p.sales)} vendidos</span>
        </div>
        <div>
          <h3 class="text-xs font-semibold text-gray-800 line-clamp-2 mb-1" title="${escapeHtml(p.title)}">${escapeHtml(p.title)}</h3>
          <p class="text-[10px] text-gray-500 flex items-center gap-1 mb-2 truncate">
            <i data-lucide="store" class="w-3 h-3 shrink-0"></i> ${escapeHtml(p.store)}
          </p>
          <span class="text-base font-black text-orange-600 block mb-2">${p.price > 0 ? formatBRL(p.price) : "Ver oferta"}</span>
          <div class="flex gap-2">
            <a href="${escapeHtml(p.link)}" target="_blank" rel="noopener" data-action="buy" data-id="${escapeHtml(p.id)}" class="flex-1 min-w-0 whitespace-nowrap bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1">
              <i data-lucide="shopping-cart" class="w-4 h-4 hidden sm:block"></i> Ver na Shopee
            </a>
            <button type="button" data-action="share" data-id="${escapeHtml(p.id)}" title="Compartilhar" aria-label="Compartilhar ${escapeHtml(p.title)}" class="shrink-0 w-9 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600 rounded-xl flex items-center justify-center">
              <i data-lucide="share-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>`;
  }

  function chip(active, attrs, label) {
    return `<button type="button" ${attrs} class="px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ${active ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-orange-100"}">${label}</button>`;
  }

  function renderFilters() {
    document.getElementById("quick-filters").innerHTML =
      quickFilters.map(f => chip(state.quick === f.key, `data-quick="${f.key}"`, f.label)).join("");
    document.getElementById("categories-container").innerHTML =
      categories.map(cat => chip(state.category === cat, `data-category="${escapeHtml(cat)}"`, escapeHtml(cat))).join("");
  }

  function renderProducts() {
    const filtered = currentList();
    const quick = quickFilters.find(f => f.key === state.quick);
    document.getElementById("section-title").textContent =
      campaign && !campaignIsEmpty && state.quick === "todos" ? `Ofertas de ${campaign.title}` : quick.title;
    document.getElementById("product-count").textContent = `${filtered.length} item(ns)`;

    const emptyState = document.getElementById("empty-state");
    emptyState.classList.toggle("hidden", filtered.length > 0);
    emptyState.classList.toggle("flex", filtered.length === 0);
    document.getElementById("pagination-container").classList.toggle("hidden", filtered.length === 0);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    if (state.page > totalPages) state.page = totalPages;
    const startIndex = (state.page - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);

    document.getElementById("products-grid").innerHTML = filtered.slice(startIndex, endIndex).map(renderCard).join("");
    document.getElementById("page-start").textContent = filtered.length > 0 ? startIndex + 1 : 0;
    document.getElementById("page-end").textContent = endIndex;
    document.getElementById("page-total-items").textContent = filtered.length;
    document.getElementById("btn-prev-page").disabled = state.page === 1;
    document.getElementById("btn-next-page").disabled = state.page === totalPages;

    renderPaginationNumbers(totalPages);
    lucide.createIcons();
  }

  function renderPaginationNumbers(totalPages) {
    let html = "";
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= state.page - 1 && i <= state.page + 1)) {
        html += `<button type="button" data-page="${i}" class="w-8 h-8 rounded-xl text-xs font-bold ${state.page === i ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"}">${i}</button>`;
      } else if (i === state.page - 2 || i === state.page + 2) {
        html += `<span class="text-gray-400 text-xs px-1">...</span>`;
      }
    }
    document.getElementById("pagination-numbers").innerHTML = html;
  }

  function goToPage(page) {
    state.page = page;
    renderProducts();
    window.scrollTo({ top: 200, behavior: "smooth" });
  }

  // ---------- Compartilhar ----------

  async function shareProduct(p) {
    const siteUrl = config.siteUrl + (campaignKey ? `${campaignKey}/` : "");
    const text = `🛍️ ${p.title}\n💰 ${formatBRL(p.price)}\n👉 ${p.link}\n\nMais achadinhos: ${siteUrl}`;
    track(`compartilhar/${p.id}`, p.title);
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  // ---------- Início ----------

  document.getElementById("app").innerHTML = renderHeader() + renderCampaignStrip() + renderMain() + renderFooter();

  document.getElementById("search-input").addEventListener("input", e => {
    state.search = normalize(e.target.value.trim());
    state.page = 1;
    renderProducts();
  });

  document.getElementById("quick-filters").addEventListener("click", e => {
    const button = e.target.closest("[data-quick]");
    if (!button) return;
    state.quick = button.dataset.quick;
    state.page = 1;
    renderFilters();
    renderProducts();
  });

  document.getElementById("categories-container").addEventListener("click", e => {
    const button = e.target.closest("[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    state.page = 1;
    renderFilters();
    renderProducts();
  });

  document.getElementById("products-grid").addEventListener("click", e => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const p = byId[target.dataset.id];
    if (!p) return;
    if (target.dataset.action === "buy") track(`clique/${p.id}`, p.title);
    if (target.dataset.action === "share") shareProduct(p);
  });

  document.getElementById("pagination-numbers").addEventListener("click", e => {
    const button = e.target.closest("[data-page]");
    if (button) goToPage(Number(button.dataset.page));
  });
  document.getElementById("btn-prev-page").addEventListener("click", () => goToPage(state.page - 1));
  document.getElementById("btn-next-page").addEventListener("click", () => goToPage(state.page + 1));

  renderFilters();
  renderProducts();
  loadAnalytics();
})();
