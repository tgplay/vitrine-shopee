# Vitrine de achadinhos da Shopee

Página com produtos selecionados da Shopee. Cada produto aponta para um link de afiliado: a pessoa vê a
foto, o preço, a loja e as vendas, clica em **Ver na Shopee** e compra no site ou no app da Shopee.

**Site:** https://tgplay.github.io/vitrine-shopee/

![Arte de divulgação](preview.jpg)

## Sumário

- [Como funciona](#como-funciona)
- [Arquivos do projeto](#arquivos-do-projeto)
- [Os produtos](#os-produtos)
- [Como adicionar um lote novo de produtos](#como-adicionar-um-lote-novo-de-produtos)
- [Campanhas (11.11, Black Friday…)](#campanhas-1111-black-friday)
- [Contador de visitas e cliques](#contador-de-visitas-e-cliques)
- [Como publicar](#como-publicar)
- [Prévia do link no WhatsApp e no Instagram](#prévia-do-link-no-whatsapp-e-no-instagram)
- [Divulgação](#divulgação)
- [Decisões tomadas](#decisões-tomadas)
- [Limitações conhecidas](#limitações-conhecidas)
- [Histórico](#histórico)

## Como funciona

- Site estático, sem servidor e sem banco de dados. Os produtos ficam em `produtos.js`, e o `app.js`
  monta a página a partir deles.
- O visual usa [Tailwind CSS](https://tailwindcss.com/) e os ícones usam [Lucide](https://lucide.dev/),
  os dois carregados por CDN.
- A hospedagem é gratuita no **GitHub Pages**. Cada envio para a branch `main` republica o site em
  1 ou 2 minutos.

O que o visitante pode fazer:

| recurso | como funciona |
|---|---|
| Busca | procura no nome do produto e da loja, sem diferenciar maiúsculas, acentos ou letras estilizadas (𝙨𝙝𝙤𝙥𝙚 = shope) |
| Filtros rápidos | ✨ Destaques (ordem da lista), 🔥 Mais vendidos, 💸 Até R$ 30 (do mais barato ao mais caro), 🆕 Novidades (entrada mais recente primeiro) |
| Categorias | abas geradas a partir dos produtos: só aparece categoria que tem produto. Combinam com os filtros rápidos |
| Paginação | 20 produtos por página (4 linhas de 5 no computador, 2 colunas no celular) |
| Ver na Shopee | abre o link de afiliado em outra aba |
| Compartilhar | no celular, abre o menu de compartilhar do aparelho; no computador, abre o WhatsApp com a mensagem pronta: nome, preço, link de afiliado e o link da vitrine |
| Campanhas | página própria para cada data (ver [Campanhas](#campanhas-1111-black-friday)) |

No rodapé de todas as páginas há o aviso de que o site contém links de afiliado e não é da Shopee.

## Arquivos do projeto

| arquivo | o que é | quando mexer |
|---|---|---|
| `produtos.js` | a lista de produtos, um por linha | a cada lote (o importador faz isso) |
| `config.js` | endereço do site, contador de visitas e campanhas | ao ligar o contador ou criar campanha |
| `app.js` | o código que monta a página | só para mudar o funcionamento |
| `index.html` | a página inicial: título, prévia do link e chamada dos scripts | ao mudar o texto da prévia |
| `11-11/index.html`, `black-friday/index.html` | as páginas de campanha | ao criar campanha nova |
| `ferramentas/importar_csv.py` | importa o CSV do Shopee Afiliados para `produtos.js` | — |
| `avatar.jpg` | mascote do topo (256 × 256 px, ~17 KB) | ao trocar o avatar |
| `preview.jpg` | arte da prévia do link (928 × 1152 px, ~172 KB) | ao trocar a arte |

Os CSVs e as listas de imagens (`*.csv`, `imagens*.txt`) não vão para o repositório (`.gitignore`): o CSV
traz as comissões, e o repositório é público.

## Os produtos

Cada produto é uma linha de `produtos.js`:

```js
{"id": "58269809706", "title": "Boné Brasil Bordado Alto Relevo Qualidade Premium", "category": "Moda & Acessórios", "store": "Bella Chic Store", "price": 69.9, "sales": "336", "image": "https://down-bs-br.img.susercontent.com/....webp", "link": "https://s.shopee.com.br/4fxBwWD7XY", "added": "2026-10-22", "lote": "BatchProductLinks20261022121314.csv"},
```

| campo | de onde vem (CSV da Shopee) | observação |
|---|---|---|
| `id` | `Item Id` | identifica o produto; o importador usa para atualizar e para casar a foto |
| `title` | `Item Name` | espaços duplos viram simples |
| `category` | (não vem no CSV) | sugerida pelo importador a partir do nome |
| `store` | `Nome da loja` | |
| `price` | `Price` | `"1.249,90"` vira `1249.9` |
| `sales` | `Sales` | texto, como veio: `"336"`, `"5mil+"`; o filtro Mais vendidos entende os dois |
| `image` | (não vem no CSV) | link da foto na Shopee; vazio mostra o ícone da categoria |
| `link` | `Offer Link` | **link de afiliado**, é ele que gera a comissão |
| `added` | data da importação | usada pelo filtro Novidades |
| `lote` | nome do arquivo CSV | só para saber de onde veio |
| `campaigns` | opção `--campanha` do importador | opcional; ex.: `["black-friday"]` |

> Use sempre o `Offer Link` (`https://s.shopee.com.br/...`), nunca o `Product Link`. Só o primeiro leva o
> seu ID de afiliado e garante a comissão.

### Categorias

A lista fica em `categoryIcons`, no `app.js`. A ordem dela é a ordem das abas, e o ícone aparece no lugar
da foto quando o produto não tem imagem.

| categoria | ícone | exemplos |
|---|---|---|
| Moda & Acessórios | `shirt` | boné, óculos, bota, chinelo |
| Casa & Decoração | `home` | pegboard, toalha, mesa, enfeites de Natal, balões |
| Cozinha | `chef-hat` | omeleteira, panelas, garrafas e copos térmicos |
| Automotivo | `car` | kit de estética, revitalizador de farol, compressor de ar |
| Eletrônicos | `smartphone` | fones, power bank, capa de celular |
| Ferramentas | `wrench` | parafusadeira, soprador térmico |
| Saúde & Fitness | `heart-pulse` | creatina, balança, bicicleta, massageador |
| Beleza & Cuidados | `scissors` | máquina de cortar cabelo |
| Pet | `paw-print` | comedouro automático |
| Outros | `shopping-bag` | o que o importador não reconheceu (corrija à mão) |

Para uma categoria nova: acrescente em `categoryIcons` (`app.js`) com um ícone do
[Lucide](https://lucide.dev/icons/) e, se quiser que o importador a sugira, as palavras-chave em
`CATEGORY_KEYWORDS` (`ferramentas/importar_csv.py`).

## Como adicionar um lote novo de produtos

1. **Gerar o CSV** no painel do Shopee Afiliados (links em lote). Para medir os canais, gere os links com
   um **Sub ID**, como `vitrine` (ver [Contador](#contador-de-visitas-e-cliques)).
2. **Juntar as fotos** num arquivo `imagens.txt`, na mesma ordem do CSV: abra cada produto na Shopee,
   clique com o botão direito na foto, escolha **Copiar endereço da imagem** e cole. Pode manter números e
   nomes entre os links; só os links são lidos. Também vale uma linha por produto no formato
   `<Item Id> <link>`, em qualquer ordem.
3. **Simular** a importação, para conferir sem gravar:

   ```bash
   cd C:\Users\tiago.malmeida\vitrine-shopee
   python ferramentas/importar_csv.py C:\caminho\lote.csv --imagens C:\caminho\imagens.txt --simular
   ```

   O resumo mostra, para cada produto, se ele é novo ou atualizado, a categoria, o preço e os alertas
   `[CATEGORIA A REVISAR]` e `[sem foto]`.
4. **Importar** (o mesmo comando sem `--simular`). Para pôr o lote numa campanha, acrescente
   `--campanha black-friday`.
5. **Corrigir** em `produtos.js` o que ficou em «Outros» ou na categoria errada.
6. **Testar localmente**:

   ```bash
   python -m http.server 8765
   # abrir http://127.0.0.1:8765/
   ```

7. **Publicar** (ver [Como publicar](#como-publicar)).

Como o importador trata os produtos:
- produto novo entra no fim da lista;
- produto que já existe (mesmo `Item Id`) tem preço, vendas, loja, nome e link atualizados e mantém a
  categoria e a foto;
- importar o mesmo CSV duas vezes não duplica nada;
- se a lista de fotos tiver quantidade diferente da do CSV, ele recusa e não grava.

## Campanhas (11.11, Black Friday…)

Cada campanha tem uma página com link e prévia próprios:

| campanha | página | atalho na inicial |
|---|---|---|
| 11.11 da Shopee | https://tgplay.github.io/vitrine-shopee/11-11/ | de 04/11 a 11/11 |
| Black Friday | https://tgplay.github.io/vitrine-shopee/black-friday/ | de 18/11 a 30/11 |

- **Que produtos aparecem:** a página mostra os produtos marcados com a campanha (`"campaigns":
  ["black-friday"]`). Para marcar, importe o lote com `--campanha black-friday` ou acrescente o campo à
  mão. Enquanto nenhum produto estiver marcado, a página mostra todos os produtos com o aviso «As ofertas
  de … estão chegando».
- **Atalho na página inicial:** entre `start` e `end` da campanha (em `config.js`), a página inicial
  mostra uma faixa «🖤 Black Friday: veja as ofertas →».
- **Compartilhar:** dentro da campanha, o botão de compartilhar manda o link da página da campanha.

**Para criar uma campanha nova** (ex.: `natal`):

1. Em `config.js`, acrescente em `campaigns` a chave `"natal"` com `title`, `subtitle`, `emoji`, `start`
   e `end`.
2. Copie a pasta `black-friday/` para `natal/` e, no `natal/index.html`, troque o título, a descrição, o
   `og:url` e `campaign: "black-friday"` por `campaign: "natal"`.
3. Importe ou marque os produtos com `--campanha natal`.

## Contador de visitas e cliques

O site usa o [GoatCounter](https://www.goatcounter.com), que é gratuito para site pessoal ou pequeno
negócio, não usa cookies e não exige aviso de privacidade.

**Ligado desde 23/10/2026**, com o painel em https://tiago-martins.goatcounter.com (`goatcounter:
"tiago-martins"` em `config.js`). Se o campo ficar vazio, nada é carregado nem contado.

**Para não contar as suas próprias visitas:** abra uma vez, em cada navegador e celular que você usa,
`https://tgplay.github.io/vitrine-shopee/#toggle-goatcounter`. O GoatCounter passa a ignorar aquele
navegador (abrir de novo o mesmo endereço volta a contar).

**O que aparece no painel do GoatCounter:**

| registro | significado |
|---|---|
| `/vitrine-shopee/`, `/vitrine-shopee/black-friday/`… | visitas em cada página, com a origem (WhatsApp, Instagram…) |
| `clique/<Item Id>` | cliques em **Ver na Shopee** |
| `compartilhar/<Item Id>` | cliques em **Compartilhar** |

O GoatCounter mostra quem **clica**. Quem **compra** só aparece no painel do Shopee Afiliados. Para saber
qual canal vende, gere os links com um **Sub ID** diferente por canal (ex.: `vitrine` para os links do
site, `whatsapp` para os que você posta direto no canal). O painel de afiliado separa pedidos e comissões
por Sub ID.

## Como publicar

```bash
cd C:\Users\tiago.malmeida\vitrine-shopee
git add -A
git commit -m "Lote <nome> com N produtos"
git push
```

Em 1 ou 2 minutos o site está atualizado. O andamento aparece na aba **Actions** do repositório no GitHub.
O GitHub Pages guarda os arquivos em cache por até 10 minutos: se o navegador ou o celular mostrar a
versão antiga, recarregue a página ou espere alguns minutos.

## Prévia do link no WhatsApp e no Instagram

Ao colar o link, as redes mostram uma prévia com imagem, título e descrição. Isso vem das tags `og:*` no
`<head>` de cada página (`index.html` e as páginas de campanha). Na inicial:

| tag | valor atual |
|---|---|
| `og:title` | Achadinhos da Shopee \| 40 ofertas selecionadas |
| `og:description` | Ofertas selecionadas em um só lugar, a partir de R$ 16. Clique e veja todas! |
| `og:image` | `https://tgplay.github.io/vitrine-shopee/preview.jpg` (928 × 1152 px, ~172 KB) |

**Para trocar a arte da prévia:**

1. Substitua o `preview.jpg`, mantendo o arquivo **abaixo de 300 KB**. Acima disso o WhatsApp pode não
   mostrar a imagem. Para reduzir no Windows sem instalar nada:

   ```powershell
   Add-Type -AssemblyName System.Drawing
   $img = [System.Drawing.Image]::FromFile("C:\caminho\arte-original.jpg")
   $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
   $p = New-Object System.Drawing.Imaging.EncoderParameters 1
   $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]85)
   $img.Save("C:\Users\tiago.malmeida\vitrine-shopee\preview.jpg", $codec, $p)
   $img.Dispose()
   ```

2. Se as dimensões mudarem, atualize `og:image:width` e `og:image:height`.
3. Se o número de produtos ou o menor preço mudar, atualize `og:title`, `og:description` e
   `meta name="description"` no `index.html`.
4. Uma campanha pode ter arte própria: salve, por exemplo, `black-friday/preview.jpg` e aponte o
   `og:image` da página dela para esse arquivo.

O WhatsApp guarda a prévia de um link já compartilhado. Para forçar a nova, compartilhe com um parâmetro
no fim: `https://tgplay.github.io/vitrine-shopee/?v=2`.

## Divulgação

**Imagem não é clicável** em nenhuma rede. O clique vem de onde a arte é postada:

| onde | como pôr o link |
|---|---|
| WhatsApp (conversa e grupos) | arte + link na legenda; o link fica clicável e mostra a prévia |
| Status do WhatsApp | link no texto do status |
| Stories do Instagram | adesivo **Link** |
| Feed do Instagram | link na bio; na legenda, escreva «link na bio» |

Ao gerar arte com IA (Gemini, por exemplo):
- confira se **cada produto e preço da arte existe na vitrine**: a IA inventa produtos;
- confira a grafia do endereço `tgplay.github.io/vitrine-shopee`;
- não use o logotipo oficial da Shopee.

**Legendas de exemplo:**

```
🛍️ Achadinhos da Shopee! Separei 40 ofertas em um só lugar: cozinha, eletrônicos, moda, casa, fitness e mais, a partir de R$ 16.
👉 https://tgplay.github.io/vitrine-shopee/
```

```
🛍️ ACHADINHOS DA SHOPEE 🧡
Separei 40 ofertas em um só lugar: omeleteira, fone Bluetooth, garrafa térmica, ferramentas, itens de casa e muito mais, a partir de R$ 16!
🔗 Link na bio
#achadinhos #achadinhosdashopee #shopee #ofertas #promoção #comprasonline
```

## Decisões tomadas

| decisão | por quê |
|---|---|
| **A comissão não aparece na página** | o repositório é público e a página é para o comprador. A comissão continua sendo gerada: ela depende só do link de afiliado (`Offer Link`), e não do que a página mostra. |
| **CSV fora do repositório** | ele traz as colunas de comissão. |
| **Aviso de afiliado no rodapé** | publicidade identificada, como pedem as diretrizes do CONAR, e deixa claro que o site não é da Shopee. |
| **Produtos em `produtos.js`, código em `app.js`** | as páginas de campanha reaproveitam os mesmos produtos e o mesmo código, e o importador mexe só nos dados. |
| **Uma página HTML por campanha** | o WhatsApp e o Instagram não rodam JavaScript ao montar a prévia; cada campanha só tem título e arte próprios se tiver um HTML próprio. |
| **Compartilhar manda o link de afiliado** | quem recebe vai direto ao produto, e a comissão continua sendo sua; o link da vitrine vai junto para quem quiser ver mais. |
| **GoatCounter como contador** | gratuito, sem cookies e sem aviso de privacidade; também registra cliques. |
| **Sem painel admin e sem `localStorage`** | o painel antigo expunha as comissões e só valia no navegador de quem clicava; com o `localStorage`, visitantes antigos viam produtos velhos. |
| **Fotos direto do servidor da Shopee** | o CSV não traz imagem, e a Shopee bloqueia a leitura automática do produto; as fotos são coladas à mão e a Shopee permite exibi-las fora do site dela. |
| **GitHub Pages** | hospedagem gratuita, com HTTPS, atualizada a cada envio. |
| **Commits com o e-mail privado do GitHub** | o repositório é público, e o e-mail de cada commit fica visível. |

## Limitações conhecidas

- **Uso comercial no GitHub Pages:** a regra do GitHub diz que o Pages não é para sites «primariamente
  voltados a facilitar transações comerciais». A vitrine não vende nada, mas fica numa zona cinzenta. Se
  o projeto crescer, o Cloudflare Pages ou o Netlify são alternativas gratuitas.
- **Login da Shopee no computador:** ao abrir um link de afiliado num navegador sem conta logada, a Shopee
  pode pedir login antes de mostrar o produto. É uma checagem da Shopee que a vitrine não controla. No
  celular, o link abre o app da Shopee ou o produto no navegador.
- **Preço e vendas podem desatualizar:** os valores são os do CSV no dia da importação. Reimportar um CSV
  novo atualiza os produtos que já existem.
- **Marca da Shopee:** o avatar tem o logo da Shopee na caixa. Confira as regras do programa de afiliados
  sobre uso da marca.
- **Tailwind por CDN:** o console mostra o aviso «cdn.tailwindcss.com should not be used in production».
  Funciona; só fica mais lento que um CSS compilado.
- **Lucide em `@latest`:** uma versão nova dos ícones pode mudar algum desenho. Se quebrar, fixe uma
  versão em `<script src="https://unpkg.com/lucide@<versão>">`.
- **Repositório público:** tudo o que está nos arquivos do site é visível a qualquer pessoa.

## Histórico

| data | o que mudou |
|---|---|
| 22/10/2026 | Primeira versão com 20 produtos (lote `BatchProductLinks20261022121314`): categorias refeitas, loja e vendas nos cartões, fotos reais, busca sem acento. |
| 22/10/2026 | Segundo lote, com mais 20 produtos (`a3.csv`), e as categorias novas Cozinha e Beleza & Cuidados. |
| 22/10/2026 | Publicação no GitHub Pages, sem comissão e sem painel admin. |
| 22/10/2026 | Prévia do link com a arte de divulgação (`preview.jpg`) e ícone 🛍️ na aba. |
| 22/10/2026 | README do projeto e avatar trocado pelo mascote (`avatar.jpg`). |
| 23/10/2026 | Reorganização em `produtos.js`, `config.js` e `app.js`; aviso de afiliado; filtros Mais vendidos, Até R$ 30 e Novidades; botão Compartilhar; páginas de campanha (11.11 e Black Friday); contador GoatCounter; importador de CSV. |
| 23/10/2026 | Contador GoatCounter ligado (`tiago-martins`). |
