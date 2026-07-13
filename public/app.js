const chatArea = document.getElementById("chatArea");
const emptyState = document.getElementById("emptyState");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const modelSelect = document.getElementById("modelSelect");
const newChatBtn = document.getElementById("newChatBtn");
const settingsBtn = document.getElementById("settingsBtn");
const closeSettings = document.getElementById("closeSettings");
const settingsModal = document.getElementById("settingsModal");
const overlay = document.getElementById("overlay");
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const fileBadge = document.getElementById("fileBadge");
const voiceBtn = document.getElementById("voiceBtn");

let history = [];
let isLoading = false;
let selectedFile = null;

const MODELS = {
  "google/gemma-3-27b-it:free": "Gemma 3 27B",
  "qwen/qwen3-235b-a22b:free": "Qwen 3 235B",
  "moonshotai/kimi-k2:free": "Kimi K2",
  "google/gemini-2.5-flash": "Gemini 2.5 Flash",
  "anthropic/claude-sonnet-4": "Claude Sonnet 4",
  "openai/gpt-4.1-mini": "GPT-4.1 Mini",
  "deepseek/deepseek-chat-v3-0324": "DeepSeek V3"
};

const savedModel = localStorage.getItem("oqline_model");
if (savedModel && MODELS[savedModel]) modelSelect.value = savedModel;
modelSelect.addEventListener("change", () => localStorage.setItem("oqline_model", modelSelect.value));

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 145)}px`;
});

input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

function appendMessage(role, text, model = "") {
  document.getElementById("emptyState")?.remove();
  const message = document.createElement("div");
  message.className = `msg ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "Anda" : "OQ";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (role === "ai" && model) {
    const badge = document.createElement("div");
    badge.className = "model-badge";
    badge.textContent = model;
    bubble.appendChild(badge);
  }
  const content = document.createElement("div");
  content.textContent = text;
  bubble.appendChild(content);
  message.append(avatar, bubble);
  chatArea.appendChild(message);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function appendThinking() {
  const message = document.createElement("div");
  message.className = "msg ai";
  message.id = "thinking";
  message.innerHTML = `<div class="avatar">OQ</div><div class="bubble"><div class="model-badge">${MODELS[modelSelect.value] || "Oqline AI"}</div><div class="thinking"><span></span><span></span><span></span></div></div>`;
  chatArea.appendChild(message);
  chatArea.scrollTop = chatArea.scrollHeight;
}

async function sendMessage() {
  let text = input.value.trim();
  if (!text || isLoading) return;
  if (selectedFile) text += `\n\n[Lampiran dipilih: ${selectedFile.name}]`;

  const selectedModel = modelSelect.value;
  appendMessage("user", text);
  history.push({ role: "user", content: text });
  input.value = "";
  input.style.height = "auto";
  clearSelectedFile();
  isLoading = true;
  sendBtn.disabled = true;
  appendThinking();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: selectedModel, messages: history })
    });
    const data = await response.json();
    document.getElementById("thinking")?.remove();
    if (!response.ok) throw new Error(data.error || "Permintaan gagal.");
    appendMessage("ai", data.reply, MODELS[selectedModel] || selectedModel);
    history.push({ role: "assistant", content: data.reply });
  } catch (error) {
    document.getElementById("thinking")?.remove();
    appendMessage("ai", `Maaf, terjadi kendala: ${error.message}`, "Oqline AI");
    console.error(error);
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

function resetChat() {
  history = [];
  chatArea.innerHTML = "";
  location.reload();
}

function showModal() { settingsModal.classList.add("show"); overlay.classList.add("show"); }
function hideLayers() { settingsModal.classList.remove("show"); overlay.classList.remove("show"); sidebar.classList.remove("open"); }
function clearSelectedFile() { selectedFile = null; fileInput.value = ""; fileBadge.hidden = true; fileBadge.textContent = ""; }

sendBtn.addEventListener("click", sendMessage);
newChatBtn.addEventListener("click", resetChat);
settingsBtn.addEventListener("click", showModal);
closeSettings.addEventListener("click", hideLayers);
overlay.addEventListener("click", hideLayers);
menuBtn.addEventListener("click", () => { sidebar.classList.add("open"); overlay.classList.add("show"); });
uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  selectedFile = fileInput.files?.[0] || null;
  if (selectedFile) { fileBadge.textContent = `Lampiran: ${selectedFile.name}`; fileBadge.hidden = false; }
});
voiceBtn.addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return alert("Fitur suara belum didukung oleh browser ini.");
  const recognition = new SpeechRecognition();
  recognition.lang = "id-ID";
  recognition.onresult = event => { input.value = event.results[0][0].transcript; input.dispatchEvent(new Event("input")); input.focus(); };
  recognition.start();
});

document.querySelectorAll(".suggestion-card").forEach(card => {
  card.addEventListener("click", () => {
    input.value = card.dataset.prompt || card.innerText;
    input.dispatchEvent(new Event("input"));
    input.focus();
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") hideLayers();
  if (event.ctrlKey && event.key.toLowerCase() === "l") { event.preventDefault(); if (confirm("Hapus seluruh percakapan?")) resetChat(); }
});

window.addEventListener("load", () => input.focus());
