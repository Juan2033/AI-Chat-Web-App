const form = document.getElementById("chatForm");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}
function makeDots() {
  const dots = document.createElement("span");
  dots.className = "dots";
  dots.innerHTML = "<span></span><span></span><span></span>";
  return dots;
}

function addMessage(textOrNode, who = "bot") {
  const wrap = document.createElement("div");
  wrap.className = who;

  const row = document.createElement("div");
  row.className = "row";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = who === "me" ? "J" : "AI";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (typeof textOrNode === "string") bubble.textContent = textOrNode;
  else bubble.appendChild(textOrNode);

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `<span>${who === "me" ? "Tú" : "IA"}</span><span>•</span><span>${nowTime()}</span>`;
  bubble.appendChild(meta);

  row.appendChild(avatar);
  row.appendChild(bubble);
  wrap.appendChild(row);
  messages.appendChild(wrap);

  scrollToBottom();
  return wrap;
}

function saveHistory() {
  const items = [];
  messages.querySelectorAll(".me, .bot").forEach((m) => {
    const who = m.classList.contains("me") ? "me" : "bot";
    const bubble = m.querySelector(".bubble");
    const content = bubble.childNodes[0]?.textContent ?? "";
    items.push({ who, content });
  });
  localStorage.setItem("chat_history", JSON.stringify(items));
}

function loadHistory() {
  const raw = localStorage.getItem("chat_history");
  if (!raw) return;
  try {
    JSON.parse(raw).forEach(({ who, content }) => addMessage(content, who));
  } catch {}
}

clearBtn.addEventListener("click", () => {
  messages.innerHTML = "";
  localStorage.removeItem("chat_history");
  input.focus();
});

loadHistory();
if (!messages.children.length) {
  addMessage("Hola 👋 Soy tu demo con **Gemini**. Escribe algo y te respondo.", "bot");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "me");
  input.value = "";

  sendBtn.disabled = true;
  input.disabled = true;

  const loaderMsg = addMessage(makeDots(), "bot");

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    loaderMsg.remove();

    addMessage(data.reply ?? data.error ?? "No hubo respuesta", "bot");
  } catch (err) {
    loaderMsg.remove();
    addMessage("Error conectando con el servidor.", "bot");
    console.error(err);
  } finally {
    sendBtn.disabled = false;
    input.disabled = false;
    input.focus();
    saveHistory();
  }
});