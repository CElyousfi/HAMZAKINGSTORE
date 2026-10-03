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
| Brand name, WhatsApp number, shipping rules, announcement bar, hero text, brands, category tiles | `app/lib/config.ts` |
| Mega-menu and footer links | `app/lib/navigation.ts` |
| Colours, fonts, spacing (design tokens at the top) | `app/styles/app.css` |
| Size chart | `app/components/SizeGuide.tsx` |

## Shopify setup checklist
1. **Products**: give each sneaker one option named `Pointure` (or `Size`) with EU sizes. Vendor = brand.
2. **Collections** (handles must match): `all` (automated, every product), `homme`, `femme`, `enfant`, `promo`, `running`, `lifestyle`, `basketball`, `outdoor`, and one per brand (`nike`, `adidas`, `new-balance`, …).
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
