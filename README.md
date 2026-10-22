# Vitrine de achadinhos da Shopee

Página única com produtos selecionados da Shopee. Cada produto aponta para um link de afiliado: a pessoa
vê a foto, o preço, a loja e as vendas, clica em **Ver na Shopee** e compra no site ou no app da Shopee.

**Site:** https://tgplay.github.io/vitrine-shopee/

![Arte de divulgação](preview.jpg)

## Sumário

- [Como funciona](#como-funciona)
- [Arquivos do projeto](#arquivos-do-projeto)
- [Os produtos](#os-produtos)
- [Como adicionar um lote novo de produtos](#como-adicionar-um-lote-novo-de-produtos)
- [Como publicar](#como-publicar)
- [Prévia do link no WhatsApp e no Instagram](#prévia-do-link-no-whatsapp-e-no-instagram)
- [Divulgação](#divulgação)
- [Decisões tomadas](#decisões-tomadas)
- [Limitações conhecidas](#limitações-conhecidas)
- [Histórico](#histórico)

## Como funciona

- A página é um único `index.html`, sem servidor e sem banco de dados. A lista de produtos fica
  escrita dentro do próprio arquivo.
- O visual usa [Tailwind CSS](https://tailwindcss.com/) e os ícones usam [Lucide](https://lucide.dev/),
  os dois carregados por CDN.
- A hospedagem é gratuita no **GitHub Pages**. Cada envio para a branch `main` republica o site em
  1 ou 2 minutos.

O que o visitante pode fazer:

| recurso | como funciona |
|---|---|
| Busca | procura no nome do produto e da loja, sem diferenciar maiúsculas, acentos ou letras estilizadas (𝙨𝙝𝙤𝙥𝙚 = shope) |
| Categorias | abas no topo, geradas a partir dos produtos: só aparece categoria que tem produto |
| Paginação | 20 produtos por página (4 linhas de 5 no computador, 2 colunas no celular) |
| Cartão do produto | foto, selo de vendidos, nome, loja, preço e botão **Ver na Shopee** (abre em outra aba) |

## Arquivos do projeto

| arquivo | o que é |
|---|---|
| `index.html` | a vitrine inteira: layout, lista de produtos e código da página |
| `avatar.jpg` | mascote do topo da página (recorte de 256 × 256 px da arte original, ~17 KB) |
| `preview.jpg` | arte de divulgação usada na prévia do link (WhatsApp, Instagram) |
| `README.md` | este documento |

## Os produtos

### Onde ficam

No `index.html`, dentro do `<script>`, na lista `const products = [ ... ]`. Cada produto é uma linha:

```js
{"id": "58269809706", "title": "Boné Brasil Bordado Alto Relevo Qualidade Premium", "category": "Moda & Acessórios", "store": "Bella Chic Store", "price": 69.90, "sales": "336", "image": "https://down-bs-br.img.susercontent.com/....webp", "link": "https://s.shopee.com.br/4fxBwWD7XY"},
```

### Campos

| campo | de onde vem (CSV da Shopee) | observação |
|---|---|---|
| `id` | `Item Id` | identifica o produto e é usado para casar a foto |
| `title` | `Item Name` | espaços duplos viram simples |
| `category` | (não vem no CSV) | escolhida à mão, entre as categorias abaixo |
| `store` | `Nome da loja` | |
| `price` | `Price` | número com ponto: `"69,90"` vira `69.90` |
| `sales` | `Sales` | texto, como veio: `"336"`, `"5mil+"` |
| `image` | (não vem no CSV) | link da foto na Shopee; vazio mostra o ícone da categoria |
| `link` | `Offer Link` | **link de afiliado**, é ele que gera a comissão |

> Use sempre o `Offer Link` (`https://s.shopee.com.br/...`), nunca o `Product Link`. Só o primeiro leva o
> seu ID de afiliado e garante a comissão.

### Categorias

Cada categoria tem um ícone (lista `categoryIcons`), mostrado no lugar da foto quando o produto ainda não
tem imagem. A ordem da lista é a ordem das abas.

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

Para criar uma categoria nova, acrescente uma linha em `categoryIcons` com um ícone do
[Lucide](https://lucide.dev/icons/).

## Como adicionar um lote novo de produtos

1. **Gerar o CSV:** no painel do Shopee Afiliados, gere os links em lote. O CSV vem com as colunas
   `Item Id, Item Name, Price, Sales, Nome da loja, Commission Rate, Commission, Product Link, Offer Link`.
2. **Converter cada linha num produto:** siga a tabela de [campos](#campos), escolha a categoria e
   acrescente a linha no fim da lista `products`. Deixe um comentário com o nome do lote, como
   `// Lote a3.csv (22/10/2026)`.
3. **Pegar as fotos:** o CSV não traz imagem. Abra cada produto na Shopee, clique com o botão direito na
   foto e escolha **Copiar endereço da imagem**. O link tem a forma
   `https://down-bs-br.img.susercontent.com/<código>.webp`. Cole no campo `image` do produto certo,
   conferindo pelo `id`.
4. **Testar localmente** antes de publicar. Abrir o arquivo com duplo clique também funciona, mas um
   servidor local se comporta igual ao site:

   ```bash
   python -m http.server 8765
   # abrir http://127.0.0.1:8765/
   ```

   Confira se a contagem de itens bate, se as abas fazem sentido, se as fotos carregam e se a
   paginação funciona.
5. **Publicar** (próxima seção).

> As colunas de comissão do CSV **não** entram na página (veja [Decisões tomadas](#decisões-tomadas)).
> Elas continuam no CSV e no painel do Shopee Afiliados.

## Como publicar

```bash
cd C:\Users\tiago.malmeida\vitrine-shopee
git add index.html
git commit -m "Lote <nome> com N produtos"
git push
```

Em 1 ou 2 minutos o site está atualizado. Para conferir o andamento: aba **Actions** do repositório no
GitHub, ou **Settings > Pages**.

Se o navegador ou o celular mostrar a versão antiga, recarregue a página. No celular, feche a aba e
abra de novo.

## Prévia do link no WhatsApp e no Instagram

Ao colar o link, as redes mostram uma prévia com imagem, título e descrição. Isso vem das tags `og:*` no
`<head>` do `index.html`:

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
   `meta name="description"`.
4. Publique.

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

A arte atual foi gerada no Gemini, com um prompt que descreve o site, as cores (`#EA580C` → `#F59E0B`),
os textos exatos e os formatos 4:5 (feed) e 9:16 (stories). Ao gerar uma arte nova:

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
| **A comissão não aparece na página** | o repositório é público e a página é para o comprador. A comissão continua sendo gerada, porque ela depende só do link de afiliado (`Offer Link`), e não do que a página mostra. |
| **Sem painel admin** | o painel antigo mostrava as comissões e só apagava produtos no navegador de quem clicava. Agora, adicionar, trocar ou remover produto é editar a lista `products` e publicar. |
| **Sem `localStorage`** | a versão antiga guardava a lista no navegador, e quem já tinha aberto a página continuava vendo os produtos velhos. Agora o arquivo é a única fonte. |
| **Fotos direto do servidor da Shopee** | o CSV não traz imagem, e a Shopee bloqueia a leitura automática do produto. As fotos são coladas à mão; a Shopee permite exibi-las fora do site dela (testado com as 40). |
| **Ícone da categoria quando falta foto** | a versão antiga usava a mesma foto genérica em todos os produtos, o que confundia o comprador. |
| **Categorias geradas a partir dos produtos** | nenhuma aba fica vazia. |
| **GitHub Pages** | hospedagem gratuita, com HTTPS, atualizada a cada envio. |
| **Commits com o e-mail privado do GitHub** | o repositório é público, e o e-mail de cada commit fica visível. |

## Limitações conhecidas

- **Login da Shopee no computador:** ao abrir um link de afiliado num navegador sem conta logada, a
  Shopee pode pedir login antes de mostrar o produto (tela «Login Necessário»). É uma checagem da Shopee
  que a vitrine não controla. No celular, o link abre o app da Shopee ou o produto no navegador.
- **Preço e vendas podem desatualizar:** os valores são os do CSV no dia da geração. O preço que vale é
  o da Shopee na hora da compra.
- **Tailwind por CDN:** o console mostra o aviso «cdn.tailwindcss.com should not be used in production».
  Funciona; só fica mais lento que um CSS compilado.
- **Lucide em `@latest`:** uma versão nova dos ícones pode mudar algum desenho. Se quebrar, fixe uma
  versão no `<script src="https://unpkg.com/lucide@<versão>">`.
- **Repositório público:** tudo o que está no `index.html` é visível a qualquer pessoa.

## Histórico

| data | o que mudou |
|---|---|
| 22/10/2026 | Primeira versão com 20 produtos (lote `BatchProductLinks20261022121314`): categorias refeitas, loja e vendas nos cartões, fotos reais, busca sem acento. |
| 22/10/2026 | Segundo lote, com mais 20 produtos (`a3.csv`), e as categorias novas Cozinha e Beleza & Cuidados. |
| 22/10/2026 | Publicação no GitHub Pages, sem comissão e sem painel admin. |
| 22/10/2026 | Prévia do link com a arte de divulgação (`preview.jpg`) e ícone 🛍️ na aba. |
| 22/10/2026 | README do projeto. |
| 22/10/2026 | Avatar do topo trocado pelo mascote (`avatar.jpg`), no lugar da foto genérica. |
