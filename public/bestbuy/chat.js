const form = document.querySelector('#chat-form');
const promptInput = document.querySelector('#prompt');
const messages = document.querySelector('#messages');
const sendButton = form.querySelector('button');

function addMessage(label, text, type) {
  const message = document.createElement('div');
  message.className = `message ${type}`;
  const heading = document.createElement('span');
  heading.className = 'message-label';
  heading.textContent = label;
  const content = document.createElement('p');
  content.textContent = text;
  message.append(heading, content);
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
  return content;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) {
    promptInput.setCustomValidity('Please enter a message.');
    promptInput.reportValidity();
    return;
  }
  addMessage('YOU', prompt, 'customer');
  promptInput.value = '';
  sendButton.disabled = true;
  const reply = addMessage('ASSISTANT', 'Thinking…', 'assistant');
  try {
    const response = await fetch('/bestbuy/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const data = await response.json();
    if (typeof data.response !== 'string') throw new Error('Invalid response');
    reply.textContent = data.response;
  } catch (error) {
    reply.textContent = 'Sorry, I could not get a response. Please check that the Best Buy and product catalog services are running, then try again.';
  } finally {
    sendButton.disabled = false;
    messages.scrollTop = messages.scrollHeight;
    promptInput.focus();
  }
});
promptInput.addEventListener('input', () => promptInput.setCustomValidity(''));
