import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

// Όλοι οι πόροι (scripts, styles, fonts, images) εξυπηρετούνται από την ίδια
// την εφαρμογή: τα γράμματα της Google είναι self-hosted μέσω next/font, τα JSON-LD
// είναι inline script και τα React style attributes θέλουν 'unsafe-inline'.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isProduction ? ['upgrade-insecure-requests'] : []),
];

const securityHeaders = [
  { key: 'Content-Security-Policy', value: cspDirectives.join('; ') },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

const nextConfig: NextConfig = {
  // Τα αρχεία του content/ διαβάζονται στο runtime από τη σελίδα αναζήτησης
  // και από τυχόν δυναμικά κεφάλαια, οπότε πρέπει να μπουν στο server trace.
  outputFileTracingIncludes: {
    '/*': ['./content/**/*'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
