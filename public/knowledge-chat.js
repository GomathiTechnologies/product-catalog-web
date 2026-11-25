const form = document.querySelector('#knowledge-form');
const question = document.querySelector('#question');
const conversation = document.querySelector('#conversation');
const button = form.querySelector('button');

function addMessage(label, text) {
  const message = document.createElement('div');
  message.className = 'speed p-3 mb-3';
  const heading = document.createElement('h2');
  heading.className = 'h6 fw-bold';
  heading.textContent = label;
  const content = document.createElement('div');
  content.style.whiteSpace = 'pre-wrap';
  content.style.overflowWrap = 'anywhere';
  content.textContent = text;
  message.append(heading, content);
  conversation.appendChild(message);
  return { message, content };
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const prompt = question.value.trim();
  if (!prompt) {
    question.setCustomValidity('Please enter a question.');
    question.reportValidity();
    return;
  }
  button.disabled = true;
  question.value = '';
  conversation.classList.remove('d-none');
  addMessage('You', prompt);
  const answer = addMessage('Knowledge assistant', 'Searching the knowledge base…');
  answer.message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  try {
    const response = await fetch('/ai/knowledge/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    if (typeof data.response !== 'string' || !data.response.trim()) throw new Error('The service returned an empty answer.');
    answer.content.textContent = data.response;
    if (Array.isArray(data.sources) && data.sources.length) {
      const heading = document.createElement('h3');
      heading.className = 'h6 fw-bold mt-3';
      heading.textContent = 'Sources';
      const sources = document.createElement('ul');
      sources.className = 'text-secondary mb-0';
      for (const source of data.sources) {
        const item = document.createElement('li');
        item.textContent = `${source.fileName}${source.pageNumber == null ? '' : `, page ${source.pageNumber}`}`;
        sources.appendChild(item);
      }
      answer.message.append(heading, sources);
    }
  } catch (error) {
    answer.content.textContent = `Could not answer your question. ${error.message}`;
  } finally {
    button.disabled = false;
    answer.message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
question.addEventListener('input', () => question.setCustomValidity(''));
