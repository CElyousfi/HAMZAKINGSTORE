import {Link} from 'react-router';
import {CartForm, Image} from '@shopify/hydrogen';
import type {FetcherWithComponents} from 'react-router';
import {useVariantUrl} from '~/lib/variants';
import {isColorOption, isSizeOption} from '~/lib/config';
import {Price} from './Price';
import {useAside} from './Aside';

type Money = {amount: string; currencyCode: string};
type Img = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/**
 * Loose product shape so the card works with every query in the app
 * (collections, search, recommendations). Richer fields unlock
 * hover-image, quick-add sizes and badges.
 */
export type CardProduct = {
  id: string;
  handle: string;
  title: string;
  vendor?: string;
  tags?: string[];
  publishedAt?: string;
  featuredImage?: Img | null;
  images?: {nodes: Img[]};
  priceRange: {minVariantPrice: Money; maxVariantPrice?: Money};
  compareAtPriceRange?: {maxVariantPrice: Money};
  options?: {name: string; optionValues: {name: string}[]}[];
  variants?: {
    nodes: {
      id: string;
      availableForSale: boolean;
      selectedOptions: {name: string; value: string}[];
      price?: Money;
      compareAtPrice?: Money | null;
    }[];
  };
};

const NEW_DAYS = 30;

function getBadge(product: CardProduct) {
  const tags = (product.tags ?? []).map((t) => t.toLowerCase());
  if (tags.includes('exclusif') || tags.includes('limited'))
    return {label: 'Exclusif', tone: 'ink'};
  const soldOut = product.variants?.nodes?.length
    ? product.variants.nodes.every((v) => !v.availableForSale)
    : false;
  if (soldOut) return {label: 'Épuisé', tone: 'muted'};
  const price = Number(product.priceRange.minVariantPrice.amount);
  const compare = Number(
    product.compareAtPriceRange?.maxVariantPrice?.amount ?? 0,
  );
  if (compare > price) return {label: 'Promo', tone: 'clay'};
  if (
    tags.includes('new') ||
    tags.includes('nouveau') ||
    (product.publishedAt &&
      Date.now() - new Date(product.publishedAt).getTime() < NEW_DAYS * 864e5)
  )
    return {label: 'Nouveau', tone: 'ink'};
  return null;
}

export function ProductItem({
  product,
  loading,
}: {
  product: CardProduct;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage ?? product.images?.nodes?.[0];
  const hoverImage = product.images?.nodes?.[1];
  const badge = getBadge(product);
  const colorOpt = product.options?.find((o) => isColorOption(o.name));
  const colors = colorOpt?.optionValues.length ?? 0;
  const firstVariant = product.variants?.nodes?.[0];
  const compareAt =
    firstVariant?.compareAtPrice ??
    product.compareAtPriceRange?.maxVariantPrice;
  const price = firstVariant?.price ?? product.priceRange.minVariantPrice;
  const hasRange =
    product.priceRange.maxVariantPrice &&
    product.priceRange.maxVariantPrice.amount !==
      product.priceRange.minVariantPrice.amount;

  return (
    <article className="card">
      <div className="card-frame">
        <Link
          className="card-media"
          prefetch="intent"
          to={variantUrl}
          aria-label={product.title}
        >
          {image ? (
            <Image
              className="card-img"
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={loading}
              sizes="(min-width: 64em) 25vw, (min-width: 45em) 33vw, 50vw"
            />
          ) : (
            <span className="card-img card-img--empty" />
          )}
          {hoverImage ? (
            <Image
              className="card-img card-img--hover"
              alt=""
              aspectRatio="1/1"
              data={hoverImage}
              loading="lazy"
              sizes="(min-width: 64em) 25vw, (min-width: 45em) 33vw, 50vw"
            />
          ) : null}
          {badge ? (
            <span className={`badge badge--${badge.tone}`}>{badge.label}</span>
          ) : null}
        </Link>
        <QuickAdd product={product} />
      </div>
      <Link className="card-body" prefetch="intent" to={variantUrl}>
        {product.vendor ? (
          <p className="card-vendor">{product.vendor}</p>
        ) : null}
        <h3 className="card-title">{product.title}</h3>
        {colors > 1 ? <p className="card-meta">{colors} coloris</p> : null}
        <Price
          price={price}
          compareAtPrice={hasRange ? undefined : compareAt}
          from={Boolean(hasRange)}
          className="card-price"
        />
      </Link>
    </article>
  );
}

/** Size chips revealed on hover: one tap adds the pair to the cart. */
function QuickAdd({product}: {product: CardProduct}) {
  const {open} = useAside();
  const variants = product.variants?.nodes;
  const sizeOpt = product.options?.find((o) => isSizeOption(o.name));
  if (!variants?.length || !sizeOpt) return null;

  const sizes = sizeOpt.optionValues.map(({name}) => {
    const variant =
      variants.find(
        (v) =>
          v.availableForSale &&
          v.selectedOptions.some(
            (o) => o.name === sizeOpt.name && o.value === name,
          ),
      ) ??
      variants.find((v) =>
        v.selectedOptions.some(
          (o) => o.name === sizeOpt.name && o.value === name,
        ),
      );
    return {name, variant};
  });

  return (
    <div className="quickadd" aria-label="Ajout rapide">
      <p className="quickadd-label">Ajout rapide — choisis ta taille</p>
      <div className="quickadd-sizes">
        {sizes.map(({name, variant}) =>
          variant?.availableForSale ? (
            <CartForm
              key={name}
              route="/cart"
              action={CartForm.ACTIONS.LinesAdd}
              inputs={{lines: [{merchandiseId: variant.id, quantity: 1}]}}
            >
              {(fetcher: FetcherWithComponents<unknown>) => (
                <button
                  type="submit"
                  className="quickadd-size"
                  disabled={fetcher.state !== 'idle'}
                  onClick={() => open('cart')}
                >
                  {name}
                </button>
              )}
            </CartForm>
          ) : (
            <span key={name} className="quickadd-size is-out" aria-disabled>
              {name}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment CardMoney on MoneyV2 {
    amount
    currencyCode
  }
  fragment CardImage on Image {
    id
    url
    altText
    width
    height
  }
  fragment ProductCard on Product {
    id
    handle
    title
    vendor
    tags
    publishedAt
    featuredImage {
      ...CardImage
    }
    images(first: 2) {
      nodes {
        ...CardImage
      }
    }
    priceRange {
      minVariantPrice {
        ...CardMoney
      }
      maxVariantPrice {
        ...CardMoney
      }
    }
    compareAtPriceRange {
      maxVariantPrice {
        ...CardMoney
      }
    }
    options(first: 3) {
      name
      optionValues {
        name
      }
    }
    variants(first: 40) {
      nodes {
        id
        availableForSale
        selectedOptions {
          name
          value
        }
        price {
          ...CardMoney
        }
        compareAtPrice {
          ...CardMoney
        }
      }
    }
  }
` as const;
