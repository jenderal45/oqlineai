// ========================================
// SCORPIO AI
// Frontend Chat Engine
// ========================================

const chatArea = document.getElementById("chatArea");
const emptyState = document.getElementById("emptyState");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let history = [];
let isLoading = false;

// ========================================
// Auto Resize Textarea
// ========================================

input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 160) + "px";
});

// ========================================
// Enter = Kirim
// Shift + Enter = Baris Baru
// ========================================

input.addEventListener("keydown", (e) => {

    if (e.key === "Enter" && !e.shiftKey) {

        e.preventDefault();

        sendMessage();

    }

});

// ========================================
// Suggestion Chip
// ========================================

document.querySelectorAll(".suggestion-chip").forEach((chip) => {

    chip.addEventListener("click", () => {

        input.value = chip.innerText;

        input.dispatchEvent(new Event("input"));

        input.focus();

    });

});

// ========================================
// Tambah Bubble Chat
// ========================================

function appendMessage(role, text) {

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

    bubble.textContent = text;

    msg.appendChild(avatar);

    msg.appendChild(bubble);

    chatArea.appendChild(msg);

    chatArea.scrollTop = chatArea.scrollHeight;

}

// ========================================
// Thinking Animation
// ========================================

function appendThinking() {

    const thinking = document.createElement("div");

    thinking.className = "msg ai";

    thinking.id = "thinking";

    thinking.innerHTML = `

        <div class="avatar">🦂</div>

        <div class="bubble">

            <div class="thinking">

                <span></span>

                <span></span>

                <span></span>

            </div>

        </div>

    `;

    chatArea.appendChild(thinking);

    chatArea.scrollTop = chatArea.scrollHeight;

}

function removeThinking() {

    const t = document.getElementById("thinking");

    if (t) {

        t.remove();

    }

}

// ========================================
// Kirim Pesan
// ========================================

async function sendMessage() {

    const text = input.value.trim();

    if (!text || isLoading) return;

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

            data.reply

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

            "⚠️ " + err.message

        );

        console.error(err);

    }

    finally {

        isLoading = false;

        sendBtn.disabled = false;

        input.focus();

    }

}

// ========================================
// Focus Awal
// ========================================

window.onload = () => {

    input.focus();

};
