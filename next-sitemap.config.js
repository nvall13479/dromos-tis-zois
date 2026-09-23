/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://dromos-tis-zois.vercel.app/', // <-- Βάλτε εδώ το δικό σας URL
  generateRobotsTxt: true, // Δημιουργεί αυτόματα και το robots.txt
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
};