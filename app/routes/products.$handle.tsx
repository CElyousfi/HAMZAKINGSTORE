import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, Link} from 'react-router';
import {Price} from '~/components/Price';
import {ProductForm} from '~/components/ProductForm';
import {ProductGallery} from '~/components/ProductGallery';
import {ProductRail} from '~/components/ProductRail';
import {
  PRODUCT_CARD_FRAGMENT,
  type CardProduct,
} from '~/components/ProductItem';
import {
  IconCash,
  IconReturn,
  IconShield,
  IconTruck,
  IconChevron,
} from '~/components/Icons';
import {SHIPPING} from '~/lib/config';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `HAMZA KING | ${data?.product.title ?? ''}`},
    {
      name: 'description',
      content:
        data?.product.seo?.description ||
        data?.product.description?.slice(0, 155) ||
        '',
    },
    {
      property: 'og:image',
      content: data?.product.images?.nodes?.[0]?.url ?? '',
    },
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  const recommended = context.storefront
    .query(RECOMMENDATIONS_QUERY, {variables: {handle: params.handle!}})
    .then((r) => (r.productRecommendations ?? []) as CardProduct[])
    .catch((error: Error) => {
      console.error(error);
      return [] as CardProduct[];
    });
  return {recommended};
}

export default function Product() {
  const {product, recommended} = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, vendor} = product;

  // Put the selected variant image first, then the rest of the product images.
  const images = (() => {
    const all = product.images.nodes;
    const v = selectedVariant?.image;
    if (!v) return all;
    return [v, ...all.filter((i) => i.url !== v.url)];
  })();

  const buyRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = buyRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) =>
      setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="pdp">
      <nav className="crumbs container" aria-label="Fil d’Ariane">
        <Link to="/">Accueil</Link>
        <span>/</span>
        {vendor ? (
          <>
            <Link
              to={`/collections/${vendor.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {vendor}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span aria-current="page">{title}</span>
      </nav>

      <div className="pdp-grid container">
        <ProductGallery images={images} title={title} />

        <div className="pdp-panel">
          <div className="pdp-panel-inner" ref={buyRef}>
            <div className="pdp-head">
              {vendor ? <p className="pdp-vendor">{vendor}</p> : null}
              <h1 className="pdp-title">{title}</h1>
              <Price
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
                className="pdp-price"
              />
              <p className="pdp-cod">
                <IconCash width={16} height={16} /> Payable à la livraison ·
                Livraison {SHIPPING.deliveryCasablanca} à Casablanca
              </p>
            </div>

            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
              productTitle={title}
            />

            <ul className="pdp-perks">
              <li>
                <IconTruck />
                <span>
                  <strong>Livraison partout au Maroc</strong>
                  {SHIPPING.deliveryCasablanca} Casablanca ·{' '}
                  {SHIPPING.deliveryMorocco} autres villes
                </span>
              </li>
              <li>
                <IconReturn />
                <span>
                  <strong>Échange sous {SHIPPING.returnDays} jours</strong>
                  Pas la bonne pointure ? On l’échange.
                </span>
              </li>
              <li>
                <IconShield />
                <span>
                  <strong>Authenticité garantie</strong>
                  Contrôle en 12 points avant expédition.
                </span>
              </li>
            </ul>

            <div className="accordions">
              <Accordion title="Description" defaultOpen>
                <div
                  className="rte"
                  dangerouslySetInnerHTML={{__html: descriptionHtml}}
                />
              </Accordion>
              <Accordion title="Livraison & paiement">
                <p>
                  Livraison à domicile partout au Maroc. Casablanca :{' '}
                  {SHIPPING.deliveryCasablanca}. Autres villes :{' '}
                  {SHIPPING.deliveryMorocco}. Livraison offerte dès{' '}
                  {SHIPPING.freeShippingThreshold} DH.
                </p>
                <p>
                  Paiement en espèces à la livraison ou par carte bancaire en
                  ligne.
                </p>
              </Accordion>
              <Accordion title="Échanges & retours">
                <p>
                  Tu as {SHIPPING.returnDays} jours après réception pour
                  échanger ta paire, non portée et dans sa boîte d’origine.
                  Contacte-nous sur WhatsApp, on s’occupe du reste.
                </p>
              </Accordion>
              <Accordion title="Authenticité">
                <p>
                  Nous travaillons uniquement avec des distributeurs officiels
                  et des revendeurs vérifiés. Chaque paire est inspectée à la
                  main avant de partir.
                </p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <Await resolve={recommended}>
          {(products) =>
            products.length ? (
              <ProductRail
                eyebrow="Tu vas aimer"
                title="Dans le même esprit"
                products={products}
              />
            ) : null
          }
        </Await>
      </Suspense>

      <div
        className={`sticky-buy ${showSticky ? 'is-visible' : ''}`}
        aria-hidden={!showSticky}
      >
        <div className="sticky-buy-info">
          <span className="sticky-buy-title">{title}</span>
          <Price
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
        </div>
        <button
          className="btn"
          tabIndex={showSticky ? 0 : -1}
          onClick={() =>
            buyRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'})
          }
        >
          Choisir ma pointure
        </button>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="accordion" open={defaultOpen}>
      <summary>
        {title}
        <IconChevron width={18} height={18} />
      </summary>
      <div className="accordion-body">{children}</div>
    </details>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    images(first: 12) {
      nodes {
        __typename
        id
        url
        altText
        width
        height
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RECOMMENDATIONS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query ProductRecommendations(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productHandle: $handle) {
      ...ProductCard
    }
  }
` as const;
