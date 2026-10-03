import {Await, Link} from 'react-router';
import {Suspense, useId, useState} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside, useAside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header, type MenuImages} from '~/components/Header';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {WhatsAppFloat} from '~/components/WhatsAppButton';
import {NAVIGATION} from '~/lib/navigation';
import {BRANDS, whatsappLink} from '~/lib/config';
import {ICON_MODELS} from '~/lib/content';
import {
  usePageTransition,
  useRecentSearches,
  useRevealOnScroll,
  useWishlist,
} from '~/lib/ui';
import {
  IconArrow,
  IconChevron,
  IconHeart,
  IconSearch,
  IconUser,
  IconWhatsApp,
} from './Icons';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  menuImages: Promise<MenuImages>;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  menuImages,
}: PageLayoutProps) {
  useRevealOnScroll();
  usePageTransition();
  return (
    <Aside.Provider>
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside />
      <Header
        header={header}
        cart={cart}
        isLoggedIn={isLoggedIn}
        publicStoreDomain={publicStoreDomain}
        menuImages={menuImages}
      />
      <main id="main">{children}</main>
      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
      <WhatsAppFloat />
    </Aside.Provider>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="Ton panier">
      <Suspense fallback={<div className="drawer-loading" />}>
        <Await resolve={cart}>
          {(cart) => <CartMain cart={cart} layout="aside" />}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  const recent = useRecentSearches();
  return (
    <Aside type="search" heading="Rechercher" side="top">
      <div className="search-drawer">
        <SearchFormPredictive className="search-drawer-form">
          {({fetchResults, goToSearch, inputRef}) => (
            <div className="search-field">
              <IconSearch />
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Un modèle, une marque, une couleur…"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') recent.push(e.currentTarget.value);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  recent.push(inputRef.current?.value ?? '');
                  goToSearch();
                }}
                className="btn btn--sm"
              >
                Chercher
              </button>
            </div>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {collections, products, queries} = items;

            if (!term.current) {
              return (
                <div className="search-suggest">
                  {recent.items.length ? (
                    <div className="search-block">
                      <div className="search-block-head">
                        <p className="eyebrow">Recherches récentes</p>
                        <button className="link-btn" onClick={recent.clear}>
                          Effacer
                        </button>
                      </div>
                      <div className="chip-row">
                        {recent.items.map((q) => (
                          <Link
                            key={q}
                            className="chip"
                            to={`${SEARCH_ENDPOINT}?q=${encodeURIComponent(q)}`}
                            onClick={closeSearch}
                          >
                            {q}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="search-block">
                    <p className="eyebrow">Les plus recherchés</p>
                    <div className="chip-row">
                      {ICON_MODELS.slice(0, 8).map((m) => (
                        <Link
                          key={m.name}
                          className="chip"
                          to={`${SEARCH_ENDPOINT}?q=${encodeURIComponent(m.query)}`}
                          onClick={() => {
                            recent.push(m.query);
                            closeSearch();
                          }}
                        >
                          {m.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="search-block">
                    <p className="eyebrow">Marques</p>
                    <div className="chip-row">
                      {BRANDS.map((b) => (
                        <Link
                          key={b.handle}
                          className="chip"
                          to={`/collections/${b.handle}`}
                          onClick={closeSearch}
                        >
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            if (state === 'loading') {
              return <p className="search-state">Recherche…</p>;
            }

            if (!total) {
              return (
                <div className="search-suggest">
                  <SearchResultsPredictive.Empty term={term} />
                  <p className="muted small">
                    Essaie avec le nom du modèle (ex. « Samba ») ou la marque.
                  </p>
                </div>
              );
            }

            return (
              <div className="search-results">
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <Link
                  className="link-arrow"
                  onClick={() => {
                    recent.push(term.current);
                    closeSearch();
                  }}
                  to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                >
                  Voir tous les résultats pour « {term.current} »
                  <IconArrow width={16} height={16} />
                </Link>
              </div>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}

function MobileMenuAside() {
  const {close} = useAside();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const {count} = useWishlist();
  return (
    <Aside
      type="mobile"
      heading="Menu"
      side="left"
      footer={
        <div className="mnav-foot">
          <Link to="/account" onClick={close} className="mnav-foot-link">
            <IconUser /> Compte
          </Link>
          <Link to="/wishlist" onClick={close} className="mnav-foot-link">
            <IconHeart filled={count > 0} /> Wishlist
            {count ? ` (${count})` : ''}
          </Link>
          <a
            href={whatsappLink('Salam ! J’ai besoin d’aide.')}
            target="_blank"
            rel="noreferrer"
            className="mnav-foot-link"
          >
            <IconWhatsApp /> WhatsApp
          </a>
        </div>
      }
    >
      <nav className="mnav" aria-label="Menu mobile">
        {NAVIGATION.map((item, i) => {
          const isOpen = openIdx === i;
          if (!item.columns) {
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={close}
                className={`mnav-row ${item.accent ? 'is-accent' : ''}`}
              >
                {item.label}
                <IconArrow width={18} height={18} />
              </Link>
            );
          }
          return (
            <div
              key={item.label}
              className={`mnav-group ${isOpen ? 'is-open' : ''}`}
            >
              <button
                className="mnav-row"
                aria-expanded={isOpen}
                onClick={() => setOpenIdx(isOpen ? null : i)}
              >
                {item.label}
                <IconChevron width={18} height={18} />
              </button>
              <div className="mnav-sub">
                <div>
                  <Link to={item.to} onClick={close} className="mnav-all">
                    Tout voir
                  </Link>
                  {item.columns.map((col, ci) => (
                    <div key={`${col.title}-${ci}`} className="mnav-col">
                      {col.title.trim() ? (
                        <p className="eyebrow">{col.title}</p>
                      ) : null}
                      {col.links.map((l) => (
                        <Link key={l.label} to={l.to} onClick={close}>
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
      <div className="mnav-brands">
        <p className="eyebrow">Marques</p>
        <div className="chip-row">
          {BRANDS.map((b) => (
            <Link
              key={b.handle}
              to={`/collections/${b.handle}`}
              className="chip"
              onClick={close}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="mnav-links">
        <Link to="/pages/faq" onClick={close}>
          Aide & FAQ
        </Link>
        <Link to="/account/orders" onClick={close}>
          Suivre ma commande
        </Link>
        <Link to="/pages/contact" onClick={close}>
          Contact
        </Link>
      </div>
    </Aside>
  );
}
