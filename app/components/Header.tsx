import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {useOptimisticCart, useAnalytics} from '@shopify/hydrogen';
import type {CartApiQueryFragment, HeaderQuery} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {ANNOUNCEMENTS, BRAND} from '~/lib/config';
import {NAVIGATION, type NavItem} from '~/lib/navigation';
import {
  IconBag,
  IconMenu,
  IconSearch,
  IconUser,
  IconArrow,
  Monogram,
} from './Icons';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

export function Header({cart}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const lastY = useRef(0);
  const location = useLocation();

  useEffect(() => {
    setOpenIndex(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Hide on scroll down, reveal on scroll up (only after the first fold).
      setHidden(y > 240 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 240) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`site-top ${scrolled ? 'is-scrolled' : ''} ${
        hidden && openIndex === null ? 'is-hidden' : ''
      }`}
      onMouseLeave={() => setOpenIndex(null)}
    >
      <AnnouncementBar />
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <MobileToggle />
            <Link
              prefetch="intent"
              to="/"
              className="wordmark"
              aria-label={BRAND.name}
            >
              <Monogram />
              <span className="wordmark-text">{BRAND.name}</span>
            </Link>
          </div>

          <nav className="mainnav" aria-label="Navigation principale">
            {NAVIGATION.map((item, i) => (
              <div
                key={item.label}
                className={`mainnav-item ${openIndex === i ? 'is-open' : ''}`}
                onMouseEnter={() => setOpenIndex(item.columns ? i : null)}
              >
                <NavLink
                  to={item.to}
                  prefetch="intent"
                  className={`mainnav-link ${item.accent ? 'is-accent' : ''}`}
                  onFocus={() => setOpenIndex(item.columns ? i : null)}
                  end
                >
                  {item.label}
                </NavLink>
              </div>
            ))}
          </nav>

          <div className="header-actions">
            <SearchToggle />
            <Link
              to="/account"
              className="icon-btn hide-sm"
              aria-label="Mon compte"
            >
              <IconUser />
            </Link>
            <CartToggle cart={cart} />
          </div>
        </div>

        {NAVIGATION.map((item, i) =>
          item.columns ? (
            <MegaPanel
              key={item.label}
              item={item}
              open={openIndex === i}
              onClose={() => setOpenIndex(null)}
            />
          ) : null,
        )}
      </header>
      <div
        className={`mega-scrim ${openIndex !== null ? 'is-open' : ''}`}
        onMouseEnter={() => setOpenIndex(null)}
        aria-hidden
      />
    </div>
  );
}

function MegaPanel({
  item,
  open,
  onClose,
}: {
  item: NavItem;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div className={`mega ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="mega-inner">
        <div className="mega-cols">
          {item.columns?.map((col) => (
            <div key={col.title} className="mega-col">
              <p className="mega-title">{col.title}</p>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      prefetch="intent"
                      onClick={onClose}
                      tabIndex={open ? 0 : -1}
                    >
                      {link.label}
                      {link.badge ? (
                        <em className="tag">{link.badge}</em>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {item.feature ? (
          <Link
            to={item.feature.to}
            className="mega-feature"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
          >
            <span className="mega-feature-index">{item.label}</span>
            <span className="mega-feature-title">{item.feature.title}</span>
            <span className="mega-feature-copy">{item.feature.copy}</span>
            <span className="mega-feature-cta">
              Explorer <IconArrow width={16} height={16} />
            </span>
          </Link>
        ) : (
          <Link
            to={item.to}
            className="mega-feature mega-feature--plain"
            onClick={onClose}
            tabIndex={open ? 0 : -1}
          >
            <span className="mega-feature-title">Tout {item.label}</span>
            <span className="mega-feature-cta">
              Voir tout <IconArrow width={16} height={16} />
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length),
      4200,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div className="announce" role="region" aria-label="Annonces">
      <div className="announce-track">
        {ANNOUNCEMENTS.map((msg, i) => (
          <p
            key={msg}
            className={`announce-msg ${i === index ? 'is-active' : ''}`}
            aria-hidden={i !== index}
          >
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
}

function MobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="icon-btn show-md"
      onClick={() => open('mobile')}
      aria-label="Ouvrir le menu"
    >
      <IconMenu />
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button
      className="search-pill"
      onClick={() => open('search')}
      aria-label="Rechercher"
    >
      <IconSearch />
      <span className="hide-sm">Rechercher</span>
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <button
      className="icon-btn cart-btn"
      aria-label={`Panier, ${count ?? 0} article(s)`}
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        });
      }}
    >
      <IconBag />
      {count ? <span className="cart-count">{count}</span> : null}
    </button>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncCart();
  const cart = useOptimisticCart(originalCart);
  return <CartBadge count={cart?.totalQuantity ?? 0} />;
}

function useAsyncCart() {
  return useAsyncValue() as CartApiQueryFragment | null;
}
