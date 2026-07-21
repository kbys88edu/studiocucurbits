import { collections, isVisibleCollection, isVisibleProduct, products } from './products';

const staticRoutes = [
  '/', '/about/', '/work/', '/products/', '/support/', '/downloads/', '/license/',
  '/privacy/', '/terms/', '/coming-soon/', '/beta/', '/press/', '/newsletter/',
];

export const publicRoutePaths = [
  ...staticRoutes,
  ...staticRoutes.map((path) => path === '/' ? '/ja/' : `/ja${path}`),
  ...products.filter(isVisibleProduct).flatMap(({ slug }) => [`/products/${slug}/`, `/ja/products/${slug}/`]),
  ...collections.filter(isVisibleCollection).flatMap(({ slug }) => [`/collections/${slug}/`, `/ja/collections/${slug}/`]),
];
