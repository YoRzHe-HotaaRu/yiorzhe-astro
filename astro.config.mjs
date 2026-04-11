// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  server: {
    headers: {
      // Strict-Transport-Security: Force HTTPS for 1 year, include subdomains
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      
      // Content-Security-Policy: Prevent XSS attacks
      // Allows: self, inline scripts/styles (for Astro), Google Fonts, Font Awesome, Cloudflare
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self'; frame-src 'self' https://itch.io; frame-ancestors 'self'; base-uri 'self'; form-action 'self';",
      
      // X-Frame-Options: Prevent clickjacking
      'X-Frame-Options': 'SAMEORIGIN',
      
      // Permissions-Policy: Restrict browser features
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()',
      
      // X-Content-Type-Options: Prevent MIME sniffing
      'X-Content-Type-Options': 'nosniff',
      
      // Referrer-Policy: Control referrer information
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // X-XSS-Protection: Additional XSS protection (legacy but still useful)
      'X-XSS-Protection': '1; mode=block',
      
      // Remove X-Powered-By header (security through obscurity)
      'X-Powered-By': ''
    }
  }
});
