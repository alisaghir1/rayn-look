/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.raynlook.com',
  generateRobotsTxt: true,
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/icon.*',
    '/favicon.*',
    '/cart',
    '/checkout',
    '/checkout/*',
  ],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/cart', '/checkout'],
      },
    ],
  },
  changefreq: 'daily',
  priority: 0.7,
  transform: async (config, path) => {
    let priority = 0.7;
    let changefreq = 'daily';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/shop') && path.split('/').length === 3) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.startsWith('/shop/product/')) {
      priority = 0.7;
      changefreq = 'weekly';
    } else if (path === '/about' || path === '/contact') {
      priority = 0.5;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
