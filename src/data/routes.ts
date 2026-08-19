import { collections, isVisibleCollection, isVisibleProduct, products } from './products';

const staticRoutes = [
  '/', '/about/', '/work/', '/products/', '/support/', '/support/suspended/', '/downloads/', '/license/',
  '/privacy/', '/terms/', '/coming-soon/', '/beta/', '/press/', '/newsletter/',
];

export const publicRoutePaths = [
  ...staticRoutes,
  ...staticRoutes.map((path) => path === '/' ? '/ja/' : `/ja${path}`),
  ...products.filter(isVisibleProduct).flatMap(({ slug }) => [`/products/${slug}/`, `/ja/products/${slug}/`]),
  ...products.filter((product) => isVisibleProduct(product) && product.launch).flatMap(({ slug }) => [`/products/${slug}/specifications/`, `/ja/products/${slug}/specifications/`]),
  ...collections.filter(isVisibleCollection).flatMap(({ slug }) => [`/collections/${slug}/`, `/ja/collections/${slug}/`]),
];
