// ======================================================
// SCORPIO AI
// Multi Model Frontend
// Powered by OpenRouter
// ======================================================

const chatArea = document.getElementById("chatArea");
const emptyState = document.getElementById("emptyState");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let history = [];
let isLoading = false;

// ======================================================
// MODEL LIST
// ======================================================

const MODELS = [

    {
        id: "google/gemma-3-27b-it:free",
        name: "Gemma 3 27B (Free)"
    },

    {
        id: "qwen/qwen3-235b-a22b:free",
        name: "Qwen 3 235B (Free)"
    },

    {
        id: "moonshotai/kimi-k2:free",
        name: "Kimi K2 (Free)"
    },

    {
        id: "deepseek/deepseek-chat-v3-0324",
        name: "DeepSeek V3"
    },

    {
        id: "google/gemini-2.5-flash",
        name: "Gemini 2.5 Flash"
    },

    {
        id: "anthropic/claude-sonnet-4",
        name: "Claude Sonnet 4"
    },

    {
        id: "openai/gpt-4.1-mini",
        name: "GPT-4.1 Mini"
    }

];

// ======================================================
// CREATE MODEL SELECTOR
// ======================================================

const toolbar = document.createElement("div");

toolbar.className = "toolbar";

const modelSelect = document.createElement("select");

modelSelect.id = "modelSelect";

MODELS.forEach(model => {

    const option = document.createElement("option");

    option.value = model.id;

    option.textContent = model.name;

    modelSelect.appendChild(option);

});

toolbar.appendChild(modelSelect);

// ======================================================
// INSERT TOOLBAR
// ======================================================

const footer = document.querySelector("footer");

footer.insertBefore(toolbar, footer.firstChild);

// ======================================================
// SAVE LAST MODEL
// ======================================================

const savedModel = localStorage.getItem("scorpio_model");

if (savedModel) {

    modelSelect.value = savedModel;

}

modelSelect.addEventListener("change", () => {

    localStorage.setItem(

        "scorpio_model",

        modelSelect.value

    );

});

// ======================================================
// AUTO RESIZE
// ======================================================

input.addEventListener("input", () => {

    input.style.height = "auto";

    input.style.height =

        Math.min(

            input.scrollHeight,

            160

        ) + "px";

});

// ======================================================
// ENTER = SEND
// SHIFT + ENTER = NEW LINE
// ======================================================

input.addEventListener("keydown", (e) => {

    if (

        e.key === "Enter" &&

        !e.shiftKey

    ) {

        e.preventDefault();

        sendMessage();

    }

});

// ======================================================
// SUGGESTION BUTTON
// ======================================================

document

.querySelectorAll(".suggestion-chip")

.forEach(chip => {

    chip.onclick = () => {

        input.value = chip.innerText;

        input.dispatchEvent(

            new Event("input")

        );

        input.focus();

    };

});

// ======================================================
// ADD MESSAGE
// ======================================================

function appendMessage(role, text, model = "") {

    if (emptyState) {
        emptyState.remove();
    }

    const msg = document.createElement("div");
    msg.className = `msg ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";

    avatar.innerHTML = role === "user"
        ? "U"
        : "🦂";

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    // Nama model AI
    if (role === "ai" && model) {

        const badge = document.createElement("div");

        badge.style.fontSize = "11px";
        badge.style.color = "#F0A500";
        badge.style.marginBottom = "8px";
        badge.style.fontWeight = "600";
        badge.style.letterSpacing = ".5px";

        badge.textContent = model;

        bubble.appendChild(badge);

    }

    const content = document.createElement("div");

    content.style.whiteSpace = "pre-wrap";

    content.textContent = text;

    bubble.appendChild(content);

    msg.appendChild(avatar);
    msg.appendChild(bubble);

    chatArea.appendChild(msg);

    chatArea.scrollTop = chatArea.scrollHeight;

}

// ======================================================
// THINKING
// ======================================================

function appendThinking() {

    const msg = document.createElement("div");

    msg.className = "msg ai";

    msg.id = "thinking";

    msg.innerHTML = `

        <div class="avatar">🦂</div>

        <div class="bubble">

            <div style="
                color:#F0A500;
                font-size:11px;
                margin-bottom:10px;
                font-weight:600;
            ">

                ${modelSelect.options[
                    modelSelect.selectedIndex
                ].text}

            </div>

            <div class="thinking">

                <span></span>

                <span></span>

                <span></span>

            </div>

        </div>

    `;

    chatArea.appendChild(msg);

    chatArea.scrollTop = chatArea.scrollHeight;

}

// ======================================================
// REMOVE THINKING
// ======================================================

function removeThinking() {

    const t = document.getElementById("thinking");

    if (t) {

        t.remove();

    }

}

// ======================================================
// GET MODEL NAME
// ======================================================

function getModelName(id) {

    const model = MODELS.find(

        m => m.id === id

    );

    return model
        ? model.name
        : id;

}

// ======================================================
// SEND MESSAGE
// ======================================================

async function sendMessage() {

    const text = input.value.trim();

    if (!text || isLoading) return;

    const selectedModel = modelSelect.value;

    appendMessage("user", text);

    history.push({
        role: "user",
        content: text
    });

    input.value = "";
    input.style.height = "auto";

    isLoading = true;
    sendBtn.disabled = true;

    appendThinking();

    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                model: selectedModel,

                messages: history

            })

        });

        const data = await response.json();

        removeThinking();

        if (!response.ok) {

            throw new Error(

                data.error ||

                "Permintaan gagal."

            );

        }

        appendMessage(

            "ai",

            data.reply,

            getModelName(selectedModel)

        );

        history.push({

            role: "assistant",

            content: data.reply

        });

    }

    catch (err) {

        removeThinking();

        appendMessage(

            "ai",

            "⚠️ " + err.message,

            getModelName(selectedModel)

        );

        console.error(err);

    }

    finally {

        isLoading = false;

        sendBtn.disabled = false;

        input.focus();

    }

}

// ======================================================
// SEND BUTTON
// ======================================================

sendBtn.addEventListener("click", sendMessage);

// ======================================================
// CLEAR HISTORY
// ======================================================

function clearHistory() {

    history = [];

    chatArea.innerHTML = "";

    location.reload();

}

// ======================================================
// AUTO FOCUS
// ======================================================

window.onload = () => {

    input.focus();

};

// ======================================================
// SHORTCUT
// CTRL + L = CLEAR CHAT
// ======================================================

document.addEventListener("keydown", (e) => {

    if (e.ctrlKey && e.key.toLowerCase() === "l") {

        e.preventDefault();

        if (confirm("Hapus seluruh percakapan?")) {

            clearHistory();

        }

    }

});

// ======================================================
// SCORPIO AI
// VERSION 2.0
// MULTI MODEL READY
// ======================================================
