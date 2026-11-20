# Product Catalog Web

A small Node.js and Bootstrap storefront for the product catalog. Requires Node.js 18 or later. Bootstrap and Bootstrap Icons are loaded from a CDN, so the browser needs internet access.

1. Start `product-catalog-service` on port 8081 and `product-catalog-bff` on port 8080 (see their READMEs).
2. From this directory, run `npm start`.
3. Open http://localhost:3000.

The Node server proxies `/api/products` to the BFF, avoiding browser CORS configuration. Set `PRODUCT_API_BASE_URL` to use a different API origin, or `PORT` to change the web server port. For example, `PRODUCT_API_BASE_URL=http://localhost:8081 npm start` calls the catalog service directly.

The API does not currently provide a checkout URL or purchase endpoint. The Buy plan button displays a message until checkout is connected.

Open http://localhost:3000/chat to submit a prompt. The web server forwards it through the BFF to the catalog service's `/ai/chat` endpoint. The current service response is a sample, not an AI-generated answer.

## Development mode

Run `npm run dev` to start the server with Node.js watch mode (Node.js 18.11 or later). It restarts when `server.js` changes. HTML, CSS, and browser JavaScript files are served from disk, so refresh the browser to see those changes. Stop any existing server on port 3000 before starting development mode.


## commit all code

cd /Users/bharani/Documents/code && \
for repo in product-catalog-service product-catalog-bff product-catalog-web; do
  git -C "$repo" add -A &&
  git -C "$repo" commit -m "Add chat and development setup" &&
  git -C "$repo" push -u origin "$(git -C "$repo" branch --show-current)"
done
The home page loads Ontario plans by default. Select a province or territory to load its plans through the BFF. Province flag images are served by Wikimedia Commons and require an internet connection; the location names remain usable if images cannot load.
