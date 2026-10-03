/**
 * HAMZAKINGSTORE — central store configuration.
 * Edit this file to change brand copy, contact details, shipping rules
 * and homepage merchandising without touching component code.
 */

export const BRAND = {
  name: 'HAMZA KING',
  legalName: 'HAMZAKINGSTORE',
  tagline: 'Sneakers authentiques. Livrées partout au Maroc.',
  instagram: 'https://instagram.com/',
  tiktok: 'https://tiktok.com/',
  email: 'contact@hamzakingstore.ma',
};

/** WhatsApp number in international format, digits only (e.g. 2126XXXXXXXX). */
export const WHATSAPP_NUMBER = '212600000000';

export const SHIPPING = {
  /** Free delivery threshold, in MAD. */
  freeShippingThreshold: 800,
  /** Shown on product pages and in the cart. */
  deliveryCasablanca: '24h',
  deliveryMorocco: '48h – 72h',
  returnDays: 7,
};

/** Rotating messages in the announcement bar. */
export const ANNOUNCEMENTS = [
  'Paiement à la livraison partout au Maroc',
  `Livraison offerte dès ${SHIPPING.freeShippingThreshold} DH`,
  '100% authentique — ou remboursé',
];

/**
 * Brands shown in the "Marques" mega-menu, the scrolling strip and the brand index.
 * `handle` must match a Shopify collection handle.
 * `logo` (optional): path to the brand's OFFICIAL logo file in /public/brands/
 * (SVG or transparent PNG from the brand's press kit or your authorised supplier).
 * When a logo is missing, the brand name is shown in the site's typography.
 */
export type Brand = {name: string; handle: string; logo?: string};

export const BRANDS: Brand[] = [
  {name: 'Nike', handle: 'nike', logo: ''},
  {name: 'Jordan', handle: 'jordan', logo: ''},
  {name: 'Adidas', handle: 'adidas', logo: ''},
  {name: 'New Balance', handle: 'new-balance', logo: ''},
  {name: 'Asics', handle: 'asics', logo: ''},
  {name: 'Puma', handle: 'puma', logo: ''},
  {name: 'On', handle: 'on', logo: ''},
  {name: 'Hoka', handle: 'hoka', logo: ''},
  {name: 'Converse', handle: 'converse', logo: ''},
  {name: 'Vans', handle: 'vans', logo: ''},
];

/** Homepage "univers" tiles. `handle` = Shopify collection handle. */
export const CATEGORIES = [
  {
    title: 'Running',
    kicker: '01',
    copy: 'Amorti, rebond, vitesse.',
    handle: 'running',
  },
  {
    title: 'Lifestyle',
    kicker: '02',
    copy: 'Les silhouettes de la rue.',
    handle: 'lifestyle',
  },
  {
    title: 'Basketball',
    kicker: '03',
    copy: 'Né sur le parquet.',
    handle: 'basketball',
  },
  {
    title: 'Outdoor',
    kicker: '04',
    copy: 'Grip et protection, partout.',
    handle: 'outdoor',
  },
];

/**
 * Optional hero media. Drop a file in /public (e.g. /hero.mp4 or /hero.jpg)
 * and set the path here. When empty, the hero is built from your newest product.
 */
export const HERO = {
  eyebrow: 'Nouvelle saison',
  title: ['Marche', 'sur ton', 'propre', 'rythme.'],
  copy: 'Les modèles les plus recherchés des grandes marques, sélectionnés et vérifiés un par un.',
  primaryCta: {
    label: 'Découvrir les nouveautés',
    to: '/collections/all?sort=newest',
  },
  secondaryCta: {label: 'Voir les marques', to: '/collections'},
  image: '',
  video: '',
};

/** Names Shopify may use for the size option. */
export const SIZE_OPTION_NAMES = [
  'size',
  'taille',
  'pointure',
  'eu',
  'size (eu)',
];
/** Names Shopify may use for the color option. */
export const COLOR_OPTION_NAMES = ['color', 'colour', 'couleur', 'coloris'];

export function isSizeOption(name: string) {
  return SIZE_OPTION_NAMES.includes(name.trim().toLowerCase());
}
export function isColorOption(name: string) {
  return COLOR_OPTION_NAMES.includes(name.trim().toLowerCase());
}

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
