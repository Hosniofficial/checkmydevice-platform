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
      {/* Core */}
      <title>{seo.title}</title>
      <meta name="description"  content={seo.description} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      <link rel="canonical"     href={seo.canonical} />

      {/* Open Graph */}
      {Object.entries(seo.ogTags).map(([property, content]) => (
        <meta key={property} property={property} content={content} />
      ))}

      {/* Twitter Cards */}
      {Object.entries(seo.twitterTags).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}
    </Helmet>
  );
}
