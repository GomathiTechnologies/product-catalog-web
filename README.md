# Product Catalog Web

A small Node.js and Bootstrap storefront for the product catalog. Requires Node.js 18 or later. Bootstrap and Bootstrap Icons are loaded from a CDN, so the browser needs internet access.

1. Start `product-catalog-service` on port 8081 and `product-catalog-bff` on port 8080 (see their READMEs).
2. From this directory, run `npm start`.
3. Open http://localhost:3000.

The Node server proxies `/api/products` to the BFF, avoiding browser CORS configuration. Set `PRODUCT_API_BASE_URL` to use a different API origin, or `PORT` to change the web server port. For example, `PRODUCT_API_BASE_URL=http://localhost:8081 npm start` calls the catalog service directly.

The API does not currently provide a checkout URL or purchase endpoint. The Buy plan button displays a message until checkout is connected.
