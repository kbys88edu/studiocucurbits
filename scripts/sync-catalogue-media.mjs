import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const source = process.env.PRODUCT_CATALOGUE_DIR;
if (source) {
  for (const product of readdirSync(join(source, 'products'), { withFileTypes: true })) {
    if (!product.isDirectory()) continue;
    const media = join(source, 'products', product.name, 'media');
    if (!existsSync(media)) continue;
    const output = join('public', 'catalogue-media', product.name);
    mkdirSync(output, { recursive: true });
    for (const file of readdirSync(media, { withFileTypes: true })) {
      if (file.isFile()) copyFileSync(join(media, file.name), join(output, file.name));
    }
  }
}
