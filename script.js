const WEBHOOK_URL = "https://n8n.srv1077417.hstgr.cloud/webhook/52eb4fff-c04b-4ba5-b210-30e098c9acc6";

const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const actionSelect = document.getElementById('action-select');
const categorySelect = document.getElementById('category-select');
const sendBtn = document.getElementById('send-btn');

let chatHistory = JSON.parse(localStorage.getItem('chatHistory') || "[]");
chatHistory.forEach(m => addMessage(m.text, m.sender));

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

userInput.addEventListener("focus", () => {
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 300);
});

async function sendMessage() {
  const text = userInput.value.trim();
  const action = actionSelect.value;
  const category = categorySelect.value;
  if (!text) return;

  addMessage(text, 'user');
  chatHistory.push({ text, sender: 'user' });
  saveChat();
  userInput.value = '';

  // typing indicator
  const typing = document.createElement('div');
  typing.className = 'message bot-message typing';
  typing.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  chatContainer.appendChild(typing);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: text, action, category })
    });

    const data = await res.json();
    const reply = data.output || "No response received.";
    typing.remove();
    addMessage(reply, 'bot');
    chatHistory.push({ text: reply, sender: 'bot' });
    saveChat();
  } catch {
    typing.remove();
    addMessage("Error connecting to server.", 'error');
  }
}

function addMessage(text, sender) {
  const div = document.createElement('div');
  if(sender === 'user') div.className = 'message user-message';
  else if(sender === 'bot') div.className = 'message bot-message';
  else div.className = 'error-message';
  div.textContent = text;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function saveChat() {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}
