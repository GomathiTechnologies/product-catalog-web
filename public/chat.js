const form = document.querySelector('#chat-form');
const promptInput = document.querySelector('#prompt');
const resultArea = document.querySelector('#result-area');
const result = document.querySelector('#result');
const button = form.querySelector('button');

form.addEventListener('submit', async event => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) {
    promptInput.setCustomValidity('Please enter a prompt.');
    promptInput.reportValidity();
    return;
  }
  button.disabled = true;
  resultArea.classList.remove('d-none');
  result.textContent = 'Loading…';
  try {
    const response = await fetch('/ai/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const data = await response.json();
    result.textContent = typeof data.response === 'string' ? data.response : JSON.stringify(data, null, 2);
  } catch (error) {
    result.textContent = `Could not get a response. Check that the BFF and catalog service are running. ${error.message}`;
  } finally {
    button.disabled = false;
  }
});
promptInput.addEventListener('input', () => promptInput.setCustomValidity(''));
