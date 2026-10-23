// Published posts for sitemap.xml. Every other page is found from the pages
// folder at build time, but posts are written after the site is deployed.
export default defineSitemapEventHandler(() =>
  publishedPostDates().map(({ slug, updatedAt }) => ({
    loc: `/blog/${slug}/`,
    lastmod: updatedAt,
  })),
);
