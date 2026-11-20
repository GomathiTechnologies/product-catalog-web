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
  const description = element('p', 'text-secondary', product.description === 'Sample home internet plan' ? 'Home internet plan' : product.description);
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

const provinceNames = [
  ['ON', 'Ontario'], ['QC', 'Quebec'], ['AB', 'Alberta'], ['BC', 'British Columbia'],
  ['MB', 'Manitoba'], ['NB', 'New Brunswick'], ['NL', 'Newfoundland and Labrador'],
  ['NS', 'Nova Scotia'], ['PE', 'Prince Edward Island'], ['SK', 'Saskatchewan'],
  ['NT', 'Northwest Territories'], ['NU', 'Nunavut'], ['YT', 'Yukon']
];
const provinceContainer = document.querySelector('#provinces');
const selectedProvince = document.querySelector('#selected-province');
let currentRequest = 0;

for (const [code, name] of provinceNames) {
  const button = element('button', 'province-option');
  button.type = 'button';
  button.setAttribute('aria-pressed', 'false');
  const flag = document.createElement('img');
  flag.src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(`Flag of ${name}.svg`)}?width=100`;
  flag.alt = '';
  flag.loading = 'lazy';
  flag.addEventListener('error', () => { flag.hidden = true; });
  button.append(flag, element('span', '', name));
  button.addEventListener('click', () => selectProvince(code, name));
  button.dataset.code = code;
  provinceContainer.append(button);
}

function selectProvince(code, name) {
  for (const button of provinceContainer.children) {
    button.setAttribute('aria-pressed', String(button.dataset.code === code));
  }
  selectedProvince.textContent = `— ${name}`;
  purchaseMessage.classList.add('d-none');
  loadProducts(code);
}

async function loadProducts(province) {
  const request = ++currentRequest;
  productsContainer.replaceChildren();
  status.hidden = false;
  status.classList.remove('text-danger');
  status.textContent = 'Loading plans…';
  try {
    const response = await fetch(`/dynamic/province/products?province=${encodeURIComponent(province)}`);
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    if (!Array.isArray(data.products)) throw new Error('Invalid product response');
    if (request !== currentRequest) return;
    if (!data.products.length) {
      status.textContent = data.message || 'No plans are available right now.';
      return;
    }
    productsContainer.replaceChildren(...data.products.map(renderProduct));
    status.hidden = true;
  } catch {
    if (request !== currentRequest) return;
    status.textContent = 'We could not load the plans. Please check that the product services are running and try again.';
    status.classList.add('text-danger');
  }
}
selectProvince('ON', 'Ontario');
