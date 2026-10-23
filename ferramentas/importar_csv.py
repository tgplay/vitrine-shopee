"""Importa um CSV do Shopee Afiliados para produtos.js.

Uso (na pasta do projeto):
    python ferramentas/importar_csv.py lote.csv
    python ferramentas/importar_csv.py lote.csv --imagens imagens.txt
    python ferramentas/importar_csv.py lote.csv --imagens imagens.txt --campanha black-friday
    python ferramentas/importar_csv.py lote.csv --simular      (mostra o resultado sem gravar)

- Produto novo entra no fim da lista; produto que já existe (mesmo Item Id) tem preço,
  vendas, loja, nome e link atualizados, mantendo categoria e foto.
- A categoria é sugerida por palavras do nome. Confira o resumo: o que não for reconhecido
  vai para "Outros" e deve ser corrigido à mão em produtos.js.
- imagens.txt: os links das fotos, na mesma ordem das linhas do CSV (pode ter números e
  nomes no meio, como a lista colada no chat; só os links são lidos). Também aceita
  linhas "<Item Id> <link>" em qualquer ordem.
- As colunas de comissão do CSV não entram no site.
"""

import argparse
import csv
import datetime
import json
import re
import sys
import unicodedata
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
PRODUCTS_FILE = PROJECT_DIR / "produtos.js"
HEADER = [
    "// Produtos da vitrine: um por linha, em JSON.",
    "// Atualizado por ferramentas/importar_csv.py; também pode ser editado à mão.",
    "window.VITRINE_PRODUCTS = [",
]

# A primeira categoria que casar vence, então a ordem importa
# (ex.: "comedouro automático para gatos" é Pet antes de qualquer outra).
CATEGORY_KEYWORDS = [
    ("Pet", ["pet", "gato", "gatos", "cao", "caes", "cachorro", "comedouro", "bebedouro", "racao", "coleira"]),
    ("Automotivo", ["automotiv", "carro", "moto ", "pneu", "farol", "calibrador", "compressor", "snow foam", "vonixx", "volante"]),
    ("Saúde & Fitness", ["creatina", "whey", "suplemento", "balanca", "bicicleta", "ergometric", "academia", "fitness",
                         "massageador", "seringa", "halter", "colchonete", "termometro"]),
    ("Beleza & Cuidados", ["cabelo", "barba", "maquiagem", "perfume", "skincare", "secador", "chapinha", "depilador",
                           "esmalte", "batom"]),
    ("Ferramentas", ["parafusadeira", "furadeira", "soprador", "ferramenta", "alicate", "chave de", "serra", "trena"]),
    ("Cozinha", ["panela", "omeleteira", "tigela", "pote", "garrafa", "copo", "caneca", "cozedor", "cozinha", "frigideira",
                 "talher", "xicara", "airfryer", "air fryer", "liquidificador", "faca", "assadeira"]),
    ("Casa & Decoração", ["toalha", "mesa", "cadeira", "natal", "enfeite", "decoracao", "tapete", "cortina", "almofada",
                          "organizador", "pegboard", "balao", "bexiga", "lencol", "travesseiro", "luminaria", "sousplast"]),
    ("Moda & Acessórios", ["bone", "oculos", "bota", "chinelo", "sandalia", "tenis", "camiseta", "camisa", "vestido",
                           "bolsa", "relogio", "cinto", "mochila", "meia"]),
    ("Eletrônicos", ["fone", "power bank", "powerbank", "carregador", "capa de telefone", "capa de celular", "celular",
                     "iphone", "smartwatch", "caixa de som", "cabo usb", "bluetooth"]),
]


def normalize(text):
    text = unicodedata.normalize("NFKD", text)
    return "".join(c for c in text if not unicodedata.combining(c)).lower()


def guess_category(title):
    words = " " + re.sub(r"[^a-z0-9]+", " ", normalize(title)) + " "
    for category, keywords in CATEGORY_KEYWORDS:
        for keyword in keywords:
            # casa no começo de palavra: "gato" casa "gatos", "cao" não casa "protecao"
            if re.search(r"(?<![a-z0-9])" + re.escape(keyword), words):
                return category
    return None


def parse_price(text):
    return round(float(text.strip().replace("R$", "").replace(".", "").replace(",", ".")), 2)


def read_csv(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    required = ["Item Id", "Item Name", "Price", "Sales", "Nome da loja", "Offer Link"]
    missing = [c for c in required if rows and c not in rows[0]]
    if not rows or missing:
        sys.exit(f"CSV sem linhas ou sem as colunas: {', '.join(missing) or 'todas'}")
    return rows


def read_images(path, ids):
    text = Path(path).read_text(encoding="utf-8")
    by_id = dict(re.findall(r"^\s*(\d{6,})\s+(https?://\S+)", text, flags=re.M))
    if by_id:
        return {i: by_id.get(i, "") for i in ids}
    urls = re.findall(r"https?://\S+", text)
    if len(urls) != len(ids):
        sys.exit(f"imagens.txt tem {len(urls)} links, mas o CSV tem {len(ids)} produtos. Confira a lista.")
    return dict(zip(ids, urls))


def load_products():
    text = PRODUCTS_FILE.read_text(encoding="utf-8")
    start = text.index("[", text.index("window.VITRINE_PRODUCTS"))
    end = text.rindex("]")
    return json.loads(text[start:end + 1])


def save_products(products):
    lines = HEADER[:]
    lines += [json.dumps(p, ensure_ascii=False) + ("," if i < len(products) - 1 else "") for i, p in enumerate(products)]
    lines += ["];", ""]
    PRODUCTS_FILE.write_text("\n".join(lines), encoding="utf-8", newline="\n")


def main():
    sys.stdout.reconfigure(encoding="utf-8")  # o console do Windows não usa UTF-8 por padrão
    parser =argparse.ArgumentParser(description="Importa um CSV do Shopee Afiliados para produtos.js")
    parser.add_argument("csv")
    parser.add_argument("--imagens", help="arquivo com os links das fotos")
    parser.add_argument("--campanha", help="chave da campanha em config.js (ex.: black-friday)")
    parser.add_argument("--data", default=datetime.date.today().isoformat(), help="data de entrada (AAAA-MM-DD)")
    parser.add_argument("--simular", action="store_true", help="mostra o resultado sem gravar")
    args = parser.parse_args()

    rows = read_csv(args.csv)
    ids = [r["Item Id"].strip() for r in rows]
    images = read_images(args.imagens, ids) if args.imagens else {}
    products = load_products()
    existing = {p["id"]: p for p in products}
    lote = Path(args.csv).name

    report = []
    for row in rows:
        pid = row["Item Id"].strip()
        title = re.sub(r"\s+", " ", row["Item Name"]).strip()
        data = {
            "title": title,
            "store": row["Nome da loja"].strip(),
            "price": parse_price(row["Price"]),
            "sales": row["Sales"].strip(),
            "link": row["Offer Link"].strip(),
        }
        image = images.get(pid, "")
        if pid in existing:
            p = existing[pid]
            p.update(data)
            if image:
                p["image"] = image
            status, guessed = "atualizado", False
        else:
            category = guess_category(title)
            p = {"id": pid, "title": title, "category": category or "Outros", **{k: data[k] for k in ("store", "price", "sales")},
                 "image": image, "link": data["link"], "added": args.data, "lote": lote}
            products.append(p)
            existing[pid] = p
            status, guessed = "novo", category is None
        if args.campanha:
            campaigns = p.setdefault("campaigns", [])
            if args.campanha not in campaigns:
                campaigns.append(args.campanha)
        report.append((status, p, guessed))

    for status, p, guessed in report:
        flags = []
        if guessed:
            flags.append("CATEGORIA A REVISAR")
        if not p.get("image"):
            flags.append("sem foto")
        print(f"{status:10} {p['id']:12} {p['category']:18} R$ {p['price']:>8.2f}  {p['title'][:55]}"
              + (f"  [{', '.join(flags)}]" if flags else ""))

    new = sum(1 for s, _, _ in report if s == "novo")
    print(f"\n{new} novo(s), {len(report) - new} atualizado(s). Total na vitrine: {len(products)}.")
    if args.simular:
        print("Simulação: produtos.js não foi alterado.")
    else:
        save_products(products)
        print(f"Gravado em {PRODUCTS_FILE.name}. Teste a página e depois faça commit e push.")


if __name__ == "__main__":
    main()
