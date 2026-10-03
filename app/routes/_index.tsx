import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {
  PRODUCT_CARD_FRAGMENT,
  type CardProduct,
} from '~/components/ProductItem';
import {ProductRail} from '~/components/ProductRail';
import {ServiceStrip} from '~/components/Footer';
import {Price} from '~/components/Price';
import {IconArrow} from '~/components/Icons';
import {BRAND, BRANDS, CATEGORIES, HERO} from '~/lib/config';

export const meta: Route.MetaFunction = () => {
  return [
    {title: `${BRAND.name} | Sneakers authentiques au Maroc`},
    {name: 'description', content: BRAND.tagline},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context}: Route.LoaderArgs) {
  const {newest} = await context.storefront.query(HOME_NEWEST_QUERY);
  return {newest: newest.nodes as CardProduct[]};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  const bestSellers = context.storefront
    .query(HOME_BEST_QUERY)
    .then((r) => r.best.nodes as CardProduct[])
    .catch((error: Error) => {
      console.error(error);
      return [] as CardProduct[];
    });
  const universes = context.storefront
    .query(HOME_COLLECTIONS_QUERY)
    .then((r) => r.collections.nodes)
    .catch((error: Error) => {
      console.error(error);
      return [];
    });
  return {bestSellers, universes};
}

export default function Homepage() {
  const {newest, bestSellers, universes} = useLoaderData<typeof loader>();
  const heroProduct = newest[0];

  return (
    <div className="home">
      <Hero product={heroProduct} />
      <BrandTicker />

      <ProductRail
        eyebrow="Fraîchement arrivées"
        title="Nouveautés"
        to="/collections/all?sort=newest"
        products={newest}
      />

      <section className="universes container" aria-labelledby="univers-title">
        <header className="section-head">
          <div>
            <p className="eyebrow">Trouve ta paire</p>
            <h2 id="univers-title" className="display-m">
              Quatre univers.
            </h2>
          </div>
        </header>
        <Suspense fallback={<UniverseGrid collections={[]} />}>
          <Await resolve={universes}>
            {(collections) => <UniverseGrid collections={collections} />}
          </Await>
        </Suspense>
      </section>

      <AuthenticityBand />

      <Suspense fallback={null}>
        <Await resolve={bestSellers}>
          {(products) =>
            products.length ? (
              <ProductRail
                eyebrow="Ce que le Maroc porte"
                title="Best-sellers"
                to="/collections/all?sort=best-selling"
                products={products}
              />
            ) : null
          }
        </Await>
      </Suspense>

      <BrandIndex />
      <ServiceStrip />
    </div>
  );
}

function Hero({product}: {product?: CardProduct}) {
  const image = product?.featuredImage;
  return (
    <section className="hero" aria-label="À la une">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="dot" /> {HERO.eyebrow} — {new Date().getFullYear()}
        </p>
        <h1 className="hero-title">
          {HERO.title.map((line, i) => (
            <span
              key={line}
              className="hero-line"
              style={{['--i' as string]: i}}
            >
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <p className="hero-lede">{HERO.copy}</p>
        <div className="hero-ctas">
          <Link to={HERO.primaryCta.to} className="btn btn--lg">
            {HERO.primaryCta.label} <IconArrow width={18} height={18} />
          </Link>
          <Link to={HERO.secondaryCta.to} className="btn btn--lg btn--ghost">
            {HERO.secondaryCta.label}
          </Link>
        </div>
      </div>

      <div className="hero-stage">
        {HERO.video ? (
          <video
            className="hero-media"
            src={HERO.video}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : HERO.image ? (
          <img className="hero-media" src={HERO.image} alt="" />
        ) : image ? (
          <Image
            className="hero-product"
            data={image}
            alt={image.altText || product?.title || ''}
            sizes="(min-width: 64em) 55vw, 100vw"
            loading="eager"
          />
        ) : null}
        <span className="hero-grid" aria-hidden />
        <span className="hero-index" aria-hidden>
          N°01
        </span>
        {product ? (
          <Link to={`/products/${product.handle}`} className="hero-tag">
            <span className="hero-tag-kicker">
              {product.vendor || 'À la une'}
            </span>
            <span className="hero-tag-title">{product.title}</span>
            <Price price={product.priceRange.minVariantPrice} />
            <span className="hero-tag-cta">
              Voir la paire <IconArrow width={14} height={14} />
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}

function BrandTicker() {
  const row = [...BRANDS, ...BRANDS];
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {row.map((b, i) => (
          <Link
            key={`${b.handle}-${i}`}
            to={`/collections/${b.handle}`}
            className="ticker-item"
            tabIndex={-1}
          >
            {b.logo ? (
              <img
                className="ticker-logo"
                src={b.logo}
                alt={b.name}
                loading="lazy"
              />
            ) : (
              b.name
            )}
            <span className="ticker-sep">✦</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

type UniverseCollection = {
  handle: string;
  title: string;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  products: {
    nodes: {
      featuredImage?: {
        url: string;
        altText?: string | null;
        width?: number | null;
        height?: number | null;
      } | null;
    }[];
  };
};

function UniverseGrid({collections}: {collections: UniverseCollection[]}) {
  return (
    <div className="universe-grid">
      {CATEGORIES.map((cat) => {
        const c = collections.find((x) => x.handle === cat.handle);
        const img = c?.image ?? c?.products.nodes[0]?.featuredImage;
        if (cat.image) {
          return (
            <Link
              key={cat.handle}
              to={`/collections/${cat.handle}`}
              className="universe"
            >
              <img
                src={cat.image}
                alt=""
                className="universe-img"
                loading="lazy"
              />
              <span className="universe-kicker">{cat.kicker}</span>
              <span className="universe-body">
                <span className="universe-title">{cat.title}</span>
                <span className="universe-copy">{cat.copy}</span>
              </span>
              <span className="universe-arrow">
                <IconArrow />
              </span>
            </Link>
          );
        }
        return (
          <Link
            key={cat.handle}
            to={`/collections/${cat.handle}`}
            className="universe"
          >
            {img ? (
              <Image
                data={img}
                alt=""
                className="universe-img"
                aspectRatio="4/5"
                sizes="(min-width: 64em) 25vw, 50vw"
              />
            ) : (
              <span className="universe-img universe-img--empty" />
            )}
            <span className="universe-kicker">{cat.kicker}</span>
            <span className="universe-body">
              <span className="universe-title">{cat.title}</span>
              <span className="universe-copy">{cat.copy}</span>
            </span>
            <span className="universe-arrow">
              <IconArrow />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function AuthenticityBand() {
  const steps = [
    {
      n: '01',
      t: 'Sourcing',
      c: 'Uniquement auprès de distributeurs officiels et de revendeurs vérifiés.',
    },
    {
      n: '02',
      t: 'Contrôle',
      c: 'Étiquettes, coutures, semelle, boîte : chaque paire passe un contrôle en 12 points.',
    },
    {
      n: '03',
      t: 'Livraison',
      c: 'Expédiée sous 24h. Tu vérifies, puis tu payes à la livraison.',
    },
  ];
  return (
    <section className="band" aria-labelledby="band-title">
      <div className="container band-inner">
        <div className="band-head">
          <p className="eyebrow eyebrow--light">Notre promesse</p>
          <h2 id="band-title" className="display-l">
            Vérifiée à la main.
            <br />
            <span className="outline">Portée sans doute.</span>
          </h2>
        </div>
        <ol className="band-steps">
          {steps.map((s) => (
            <li key={s.n}>
              <span className="band-n">{s.n}</span>
              <span className="band-t">{s.t}</span>
              <span className="band-c">{s.c}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function BrandIndex() {
  return (
    <section className="brand-index container" aria-labelledby="brands-title">
      <header className="section-head">
        <div>
          <p className="eyebrow">Index</p>
          <h2 id="brands-title" className="display-m">
            Les marques.
          </h2>
        </div>
        <Link to="/collections" className="link-arrow">
          Toutes les collections <IconArrow width={16} height={16} />
        </Link>
      </header>
      <ul className="brand-list">
        {BRANDS.map((b, i) => (
          <li key={b.handle}>
            <Link to={`/collections/${b.handle}`}>
              <span className="brand-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="brand-name">
                {b.logo ? (
                  <img
                    className="brand-logo"
                    src={b.logo}
                    alt=""
                    loading="lazy"
                  />
                ) : null}
                {b.name}
              </span>
              <IconArrow className="brand-arrow" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const HOME_NEWEST_QUERY = `#graphql
  query HomeNewest($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    newest: products(first: 12, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const HOME_BEST_QUERY = `#graphql
  query HomeBest($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    best: products(first: 12, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const HOME_COLLECTIONS_QUERY = `#graphql
  query HomeCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 100) {
      nodes {
        handle
        title
        image {
          url
          altText
          width
          height
        }
        products(first: 1) {
          nodes {
            featuredImage {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
` as const;
