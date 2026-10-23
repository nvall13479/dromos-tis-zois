/** @type {import('next-sitemap').IConfig} */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dromos-tis-zois.vercel.app';

module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/offline', '/search', '/history', '/manifest.webmanifest', '/sw.js'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/search', '/offline', '/history'],
      },
    ],
  },
};
