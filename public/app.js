const productsContainer = document.querySelector('#products');
const status = document.querySelector('#status');
const purchaseMessage = document.querySelector('#purchase-message');

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderProduct(product) {
  const column = element('div', 'col-12 col-md-6 col-lg-4');
  const card = element('article', 'card plan-card h-100');
  const body = element('div', 'card-body p-4 d-flex flex-column');
  const icon = element('span', 'plan-icon mb-4');
  icon.setAttribute('aria-hidden', 'true');
  icon.append(element('i', 'bi bi-wifi'));
  const name = element('h3', 'h4 fw-bold', product.name);
  const description = element('p', 'text-secondary', product.description);
  const speed = element('div', 'speed p-3 my-3');
  speed.append(element('span', 'text-secondary small d-block', 'Download speed'), element('strong', '', `${product.downloadSpeedMbps} Mbps`));
  const price = element('div', 'mt-auto pt-3');
  let formattedPrice;
  try { formattedPrice = new Intl.NumberFormat('en-CA', { style: 'currency', currency: product.currency }).format(product.monthlyPrice); }
  catch { formattedPrice = `${product.monthlyPrice} ${product.currency}`; }
  price.append(element('strong', 'price', formattedPrice), element('span', 'text-secondary', ' / month'));
  const button = element('button', 'btn btn-primary w-100 py-2 mt-4 fw-semibold');
  button.type = 'button';
  const buttonIcon = element('i', 'bi bi-globe me-2');
  buttonIcon.setAttribute('aria-hidden', 'true');
  button.append(buttonIcon, document.createTextNode('Buy plan'));
  button.addEventListener('click', () => {
    purchaseMessage.textContent = `Checkout for ${product.name} is not available yet.`;
    purchaseMessage.classList.remove('d-none');
    purchaseMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  body.append(icon, name, description, speed, price, button);
  card.append(body);
  column.append(card);
  return column;
}

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Request failed');
    const products = await response.json();
    if (!Array.isArray(products)) throw new Error('Invalid product response');
    if (!products.length) {
      status.textContent = 'No plans are available right now.';
      return;
    }
    productsContainer.replaceChildren(...products.map(renderProduct));
    status.hidden = true;
  } catch {
    status.textContent = 'We could not load the plans. Please check that the product services are running and refresh the page.';
    status.classList.add('text-danger');
  }
}
loadProducts();
