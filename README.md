# HAMZAKINGSTORE

Premium sneaker storefront for Morocco, built with **Shopify Hydrogen** (React + React Router) and deployed on **Oxygen**.

Warm monochrome design, French copy, prices in DH, cash-on-delivery messaging, WhatsApp ordering and Meta Pixel tracking built in.

## Pages
- **Home**: animated hero (uses your newest product, or your own image/video), brand ticker, "Nouveautés" and "Best-sellers" carousels, 4 category tiles, authenticity section, brand index, service strip.
- **Collection**: sticky toolbar, sort, filter sidebar (size grid, brand, colour, availability, price) driven by Shopify Search & Discovery, quick-add sizes on hover, mobile filter drawer.
- **Product**: editorial gallery with zoom (swipe carousel on mobile), EU size grid with sold-out sizes crossed out, size guide, add to cart, "Commander sur WhatsApp", delivery/returns/authenticity info, recommendations, sticky mobile buy bar.
- **Cart drawer**: free-delivery progress bar, quantity steppers, promo codes, COD reassurance.
- Mega-menu, mobile menu, predictive search, floating WhatsApp button.

## Where to edit things
| What | File |
|---|---|
| Brand name, WhatsApp number, shipping rules, announcement bar, brands & logos, category tiles | `app/lib/config.ts` |
| Campaign hero, story blocks, editorial band, icon models, guides, popular categories, delivery table, FAQ, built-in pages (à propos, authenticité, contact, guide des tailles) | `app/lib/content.ts` |
| Mega-menu and footer links | `app/lib/navigation.ts` |
| Colours, fonts, spacing (design tokens at the top) | `app/styles/app.css` |
| Size chart | `app/components/SizeGuide.tsx` |

## Product page extras (optional metafields, namespace `custom`)
| Metafield key | Type | Shown as |
|---|---|---|
| `fit` | text | Fit note under the size grid ("Taille un peu petit…") |
| `story` | text | Bold intro line in the description |
| `weight`, `drop` | text | Rows in "Caractéristiques" |
| `benefits` | JSON `[{"icon":"cushion","title":"…","copy":"…"}]` | The 3 benefit cards (icons: cushion, grip, feather, drop, bolt, shield) |
| `specs` | JSON `[{"label":"…","value":"…"}]` | Extra rows in "Caractéristiques" |

Without metafields the page falls back to sensible defaults based on the category tag.
Tag a product `icone` to feature it in the "Les icônes" rail on the home page.

## Built-in features
Wishlist (saved on the device), recently viewed, cookie consent (gates the Meta Pixel), toasts,
grid density toggle, colour swatches with variant photos, low-stock messages, share button,
JSON-LD structured data, WhatsApp ordering everywhere, FR account & cart, fallback pages so no footer link 404s.

## Shopify setup checklist
1. **Products**: give each sneaker one option named `Pointure` (or `Size`) with EU sizes. Vendor = brand.
2. **Collections**: already created as smart collections, so products sort themselves. Just set the **vendor** to the brand and add **tags**:

| Tag | Puts the product in |
|---|---|
| `homme` / `femme` / `enfant` / `bebe` / `junior` | Homme, Femme, Enfant, Bébé, Junior |
| `running` / `lifestyle` / `basketball` / `outdoor` | the category (and e.g. `homme` + `running` → Homme Running) |
| `plateforme` (with `femme`) | Femme Plateformes |
| `new` | "Nouveau" badge |
| `restock` / `limited` | Retour en stock / Éditions limitées |

   A "compare-at" price puts it in **Promo** automatically. Vendor `Nike`, `Jordan`, `Adidas`, `New Balance`, `Asics`, `Puma`, `On`, `Hoka`, `Converse` or `Vans` puts it in that brand's collection.
3. **Filters**: install *Shopify Search & Discovery* and enable Availability, Price, Vendor, and the `Pointure` / `Couleur` options.
4. **Markets**: enable Morocco with MAD currency.
5. **Payments**: enable *Cash on Delivery (COD)* under manual payment methods.
6. **Deploy**: install the **Hydrogen** sales channel → *Create storefront* → connect this GitHub repo. Every push to `main` deploys.
7. **Meta Pixel**: set `PUBLIC_META_PIXEL_ID` in the storefront's environment variables. Install the *Facebook & Instagram* app for catalog sync and purchase tracking.

## Local development
```bash
npm install
npx shopify hydrogen link   # connect to your store
npm run dev
```
Without linking, the dev server uses Shopify's demo data (mock.shop).
