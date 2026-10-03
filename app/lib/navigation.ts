import {BRANDS} from './config';

/**
 * Mega-menu structure. Every `to` is a normal storefront URL,
 * so you can point links at any Shopify collection handle.
 */
export type NavLink = {label: string; to: string; badge?: string};
export type NavColumn = {title: string; links: NavLink[]};
export type NavItem = {
  label: string;
  to: string;
  accent?: boolean;
  columns?: NavColumn[];
  feature?: {title: string; copy: string; to: string; handle?: string};
};

export const NAVIGATION: NavItem[] = [
  {
    label: 'Nouveautés',
    to: '/collections/all?sort=newest',
    columns: [
      {
        title: 'À la une',
        links: [
          {
            label: 'Derniers arrivages',
            to: '/collections/all?sort=newest',
            badge: 'New',
          },
          {label: 'Best-sellers', to: '/collections/all?sort=best-selling'},
          {label: 'Retour en stock', to: '/collections/restock'},
          {label: 'Éditions limitées', to: '/collections/limited'},
        ],
      },
      {
        title: 'Par usage',
        links: [
          {label: 'Running', to: '/collections/running'},
          {label: 'Lifestyle', to: '/collections/lifestyle'},
          {label: 'Basketball', to: '/collections/basketball'},
          {label: 'Outdoor', to: '/collections/outdoor'},
        ],
      },
    ],
    feature: {
      title: 'Le drop de la semaine',
      copy: 'Les paires qui viennent d’arriver en boutique.',
      to: '/collections/all?sort=newest',
    },
  },
  {
    label: 'Homme',
    to: '/collections/homme',
    columns: [
      {
        title: 'Chaussures',
        links: [
          {label: 'Toutes les sneakers', to: '/collections/homme'},
          {label: 'Running', to: '/collections/homme-running'},
          {label: 'Lifestyle', to: '/collections/homme-lifestyle'},
          {label: 'Basketball', to: '/collections/homme-basketball'},
          {label: 'Outdoor & trail', to: '/collections/homme-outdoor'},
        ],
      },
      {
        title: 'Marques',
        links: BRANDS.slice(0, 6).map((b) => ({
          label: b.name,
          to: `/collections/${b.handle}`,
        })),
      },
    ],
    feature: {
      title: 'Homme — Sélection',
      copy: 'Les silhouettes incontournables du moment.',
      to: '/collections/homme',
      handle: 'homme',
    },
  },
  {
    label: 'Femme',
    to: '/collections/femme',
    columns: [
      {
        title: 'Chaussures',
        links: [
          {label: 'Toutes les sneakers', to: '/collections/femme'},
          {label: 'Running', to: '/collections/femme-running'},
          {label: 'Lifestyle', to: '/collections/femme-lifestyle'},
          {label: 'Plateformes', to: '/collections/femme-plateformes'},
        ],
      },
      {
        title: 'Marques',
        links: BRANDS.slice(0, 6).map((b) => ({
          label: b.name,
          to: `/collections/${b.handle}`,
        })),
      },
    ],
    feature: {
      title: 'Femme — Sélection',
      copy: 'Légères, nettes, faites pour durer.',
      to: '/collections/femme',
      handle: 'femme',
    },
  },
  {
    label: 'Enfant',
    to: '/collections/enfant',
    columns: [
      {
        title: 'Par âge',
        links: [
          {label: 'Bébé (16 – 27)', to: '/collections/bebe'},
          {label: 'Enfant (28 – 35)', to: '/collections/enfant'},
          {label: 'Junior (36 – 40)', to: '/collections/junior'},
        ],
      },
    ],
  },
  {
    label: 'Marques',
    to: '/collections',
    columns: [
      {
        title: 'Toutes les marques',
        links: BRANDS.map((b) => ({
          label: b.name,
          to: `/collections/${b.handle}`,
        })),
      },
    ],
  },
  {label: 'Promos', to: '/collections/promo', accent: true},
];

export const FOOTER_COLUMNS: NavColumn[] = [
  {
    title: 'Boutique',
    links: [
      {label: 'Nouveautés', to: '/collections/all?sort=newest'},
      {label: 'Homme', to: '/collections/homme'},
      {label: 'Femme', to: '/collections/femme'},
      {label: 'Enfant', to: '/collections/enfant'},
      {label: 'Promos', to: '/collections/promo'},
    ],
  },
  {
    title: 'Aide',
    links: [
      {label: 'Livraison', to: '/policies/shipping-policy'},
      {label: 'Retours & échanges', to: '/policies/refund-policy'},
      {label: 'Guide des tailles', to: '/pages/guide-des-tailles'},
      {label: 'Suivre ma commande', to: '/account/orders'},
      {label: 'Contact', to: '/pages/contact'},
    ],
  },
  {
    title: 'La maison',
    links: [
      {label: 'Notre histoire', to: '/pages/a-propos'},
      {label: 'Authenticité', to: '/pages/authenticite'},
      {label: 'Conditions générales', to: '/policies/terms-of-service'},
      {label: 'Confidentialité', to: '/policies/privacy-policy'},
    ],
  },
];
