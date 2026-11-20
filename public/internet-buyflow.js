const form = document.querySelector('#buyflow-form');
const input = document.querySelector('#prompt');
const submit = form.querySelector('button');
const status = document.querySelector('#status');
const products = document.querySelector('#products');
const order = document.querySelector('#order');
const checkout = document.querySelector('#checkout');
const checkoutMessage = document.querySelector('#checkout-message');
let requestId = 0;
let cartRequestId = 0;
let currentOrder = null;
let selectedPlan = null;

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = String(text);
  return node;
}

function formatPrice(value, currency) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Price unavailable';
  try { return new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(value); }
  catch { return `${value.toFixed(2)} ${currency || ''}`.trim(); }
}

async function sendPrompt(prompt) {
  const response = await fetch('/ai/chat', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt })
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  const envelope = await response.json();
  const result = envelope.response;
  if (typeof result !== 'string') return result;
  try { return JSON.parse(result); } catch { return result; }
}

const provinceFlags = {
  'ontario': 'Ontario', 'quebec': 'Quebec', 'alberta': 'Alberta',
  'british columbia': 'British Columbia', 'manitoba': 'Manitoba', 'new brunswick': 'New Brunswick',
  'newfoundland and labrador': 'Newfoundland and Labrador', 'nova scotia': 'Nova Scotia',
  'prince edward island': 'Prince Edward Island', 'saskatchewan': 'Saskatchewan',
  'northwest territories': 'Northwest Territories', 'nunavut': 'Nunavut', 'yukon': 'Yukon'
};

function renderPlan(product, province) {
  const column = element('div', 'col-12 col-md-6 col-lg-4');
  const card = element('article', 'card plan-card h-100');
  const body = element('div', 'card-body p-4 d-flex flex-column');
  const icon = element('span', 'plan-icon mb-4');
  icon.setAttribute('aria-hidden', 'true');
  icon.append(element('i', 'bi bi-wifi'));
  const top = element('div', 'd-flex align-items-start justify-content-between gap-3 mb-4');
  icon.classList.remove('mb-4');
  top.append(icon);
  const flagName = typeof province === 'string' ? provinceFlags[province.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()] : null;
  if (flagName) {
    const location = element('span', 'plan-location');
    const flag = document.createElement('img');
    flag.src = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(`Flag of ${flagName}.svg`)}?width=100`;
    flag.alt = '';
    flag.loading = 'lazy';
    flag.addEventListener('error', () => { flag.hidden = true; });
    location.append(flag, element('span', '', flagName));
    top.append(location);
  }
  const speed = element('div', 'speed p-3 my-3');
  speed.append(element('span', 'text-secondary small d-block', 'Download speed'),
    element('strong', '', typeof product.downloadSpeedMbps === 'number' ? `${product.downloadSpeedMbps} Mbps` : 'Unavailable'));
  const price = element('div', 'mt-auto pt-3');
  price.append(element('strong', 'price', formatPrice(product.monthlyPrice, product.currency)), element('span', 'text-secondary', ' / month'));
  const buy = element('button', 'btn btn-primary w-100 py-2 mt-4 fw-semibold', 'Add to cart');
  buy.type = 'button';
  buy.disabled = typeof product.id !== 'string' || !product.id;
  buy.addEventListener('click', async () => {
    const activeRequest = ++cartRequestId;
    buy.disabled = true;
    checkout.disabled = true;
    checkoutMessage.textContent = 'Adding plan to cart…';
    try {
      const result = await sendPrompt(`Use the addToCart tool to add this product ID to the sample cart: ${JSON.stringify(product.id)}`);
      if (activeRequest !== cartRequestId) return;
      if (!result || !Array.isArray(result.items) || !result.items.some(item => item.productId === product.id)) {
        throw new Error('Unexpected cart response');
      }
      currentOrder = result;
      selectedPlan = product;
      renderOrder(result, product);
      checkoutMessage.textContent = 'Plan added to your cart.';
    } catch {
      if (activeRequest === cartRequestId) checkoutMessage.textContent = 'Could not add the plan. Please try again.';
    } finally {
      buy.disabled = false;
      if (activeRequest === cartRequestId) checkout.disabled = !currentOrder;
    }
  });
  body.append(top, element('h3', 'h4 fw-bold', product.name || 'Internet plan'),
    element('p', 'text-secondary', product.description === 'Sample home internet plan' ? 'Home internet plan' : (product.description || '')), speed, price, buy);
  card.append(body);
  column.append(card);
  return column;
}

function renderOrder(result, plan) {
  order.replaceChildren();
  const item = result.items.find(entry => entry.productId === plan?.id) || result.items[0];
  const heading = element('h3', 'h5 fw-bold mb-1', plan?.name || (item?.name === 'Sample Internet Plan' ? 'Internet plan' : item?.name) || 'Internet plan');
  const productId = element('p', 'text-secondary small mb-3', `Product ID: ${item?.productId || 'Unavailable'}`);
  const priceBox = element('div', 'speed p-3');
  const planPrice = plan ? formatPrice(plan.monthlyPrice, plan.currency) : formatPrice(result.total, result.currency);
  priceBox.append(element('p', 'small text-secondary mb-1', plan ? 'Plan price / month' : 'Cart total'),
    element('p', 'h4 fw-bold mb-0', planPrice));
  order.append(heading, productId, priceBox,
    element('p', 'small text-secondary mt-3 mb-0', `Order ID: ${result.orderId || 'Unavailable'}`));
  checkout.disabled = false;
}

checkout.addEventListener('click', () => {
  checkoutMessage.textContent = 'Checkout is not available yet. No order has been placed.';
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  const prompt = input.value.trim();
  if (!prompt) {
    input.setCustomValidity('Please enter a prompt.');
    input.reportValidity();
    return;
  }
  const activeRequest = ++requestId;
  submit.disabled = true;
  products.replaceChildren();
  status.classList.remove('text-danger');
  status.textContent = 'Finding plans…';
  try {
    const result = await sendPrompt(prompt);
    if (activeRequest !== requestId) return;
    if (result && typeof result === 'object' && Array.isArray(result.products)) {
      status.textContent = result.products.length ? `Plans for ${result.province || 'your location'}` : (result.message || 'No plans are available.');
      products.replaceChildren(...result.products.map(product => renderPlan(product, result.province)));
    } else if (result && typeof result === 'object' && Array.isArray(result.items)) {
      status.textContent = 'Order received.';
      currentOrder = result;
      selectedPlan = null;
      renderOrder(result, selectedPlan);
      checkoutMessage.textContent = 'Order added to your cart.';
    } else {
      status.textContent = typeof result === 'string' ? result : 'The response did not contain a product list. Please ask for plans in a province.';
    }
  } catch {
    if (activeRequest !== requestId) return;
    status.textContent = 'Could not load plans. Check that the BFF and catalog service are running and try again.';
    status.classList.add('text-danger');
  } finally {
    if (activeRequest === requestId) submit.disabled = false;
  }
});
input.addEventListener('input', () => input.setCustomValidity(''));
