import { Helmet } from 'react-helmet-async';
import { buildSEO } from '../lib/seo.js';

/**
 * SEOHead — drop this into any page to set title, meta, OG, Twitter cards.
 *
 * Usage:
 *   <SEOHead page="home" />
 *   <SEOHead page="search" />
 */
export default function SEOHead({ page }) {
  const seo = buildSEO(page);

  return (
    <Helmet>
      {/* Title — always set */}
      <title>{seo.title}</title>

      {/* Meta — only for public pages */}
      {!seo.isAdmin && seo.description && <meta name="description" content={seo.description} />}
      {!seo.isAdmin && seo.keywords    && <meta name="keywords"    content={seo.keywords} />}
      {!seo.isAdmin && seo.canonical   && <link rel="canonical"    href={seo.canonical} />}

      {/* Block admin pages from indexing */}
      {seo.isAdmin && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph — public pages only */}
      {Object.entries(seo.ogTags).map(([property, content]) => (
        <meta key={property} property={property} content={content} />
      ))}

      {/* Twitter Cards — public pages only */}
      {Object.entries(seo.twitterTags).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}
    </Helmet>
  );
}
