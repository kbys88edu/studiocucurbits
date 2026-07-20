import type { APIRoute } from 'astro';
import { publicRoutePaths } from '../data/routes';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://www.studiocucurbits.com');
  const urls = publicRoutePaths.map((path) => `<url><loc>${new URL(path, base)}</loc></url>`).join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
