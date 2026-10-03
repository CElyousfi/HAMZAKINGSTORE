import {useEffect} from 'react';
import {useAnalytics, useNonce} from '@shopify/hydrogen';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/**
 * Meta (Facebook / Instagram) Pixel for Hydrogen.
 * Set PUBLIC_META_PIXEL_ID in your Oxygen environment variables to enable it.
 * Purchase events are tracked by Shopify checkout via the Facebook & Instagram app.
 */
export function MetaPixel({pixelId}: {pixelId?: string}) {
  const nonce = useNonce();
  const {subscribe, register} = useAnalytics();
  const {ready} = register('Meta Pixel');

  useEffect(() => {
    if (!pixelId) {
      ready();
      return;
    }

    const fbq = (...args: unknown[]) => window.fbq?.(...args);

    subscribe('page_viewed', () => fbq('track', 'PageView'));

    subscribe('product_viewed', (data) => {
      const p = data.products?.[0];
      if (!p) return;
      fbq('track', 'ViewContent', {
        content_ids: [p.variantId || p.id],
        content_name: p.title,
        content_type: 'product',
        value: Number(p.price),
        currency: 'MAD',
      });
    });

    subscribe('collection_viewed', (data) => {
      fbq('trackCustom', 'ViewCategory', {
        content_category: data.collection?.handle,
      });
    });

    subscribe('search_viewed', (data) => {
      fbq('track', 'Search', {search_string: data.searchTerm});
    });

    subscribe('product_added_to_cart', (data) => {
      const line = data.currentLine;
      if (!line) return;
      fbq('track', 'AddToCart', {
        content_ids: [line.merchandise.id],
        content_name: line.merchandise.product.title,
        content_type: 'product',
        value: Number(line.cost?.amountPerQuantity?.amount ?? 0),
        currency: line.cost?.amountPerQuantity?.currencyCode ?? 'MAD',
      });
    });

    subscribe('cart_viewed', (data) => {
      if (!data.cart?.totalQuantity) return;
      fbq('trackCustom', 'CartViewed', {
        value: Number(data.cart.cost?.totalAmount?.amount ?? 0),
        currency: data.cart.cost?.totalAmount?.currencyCode ?? 'MAD',
      });
    });

    ready();
  }, [pixelId, subscribe, ready]);

  if (!pixelId) return null;

  const snippet = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId.replace(/[^0-9]/g, '')}');`;

  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{__html: snippet}}
    />
  );
}

/**
 * Sends a "Lead" event when a customer clicks to order on WhatsApp.
 */
export function trackLead(params: Record<string, unknown>) {
  if (typeof window !== 'undefined') window.fbq?.('track', 'Lead', params);
}
