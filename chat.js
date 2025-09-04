document.addEventListener("DOMContentLoaded", () => {
  const convo = document.getElementById("conversation");
  const input = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const clearBtn = document.getElementById("clear-btn");
  const suggestionsBox = document.getElementById("suggestions");
  const statusEl = document.getElementById("status");

  const STORAGE_KEY = "se_chat_history_v1";

  if (!convo || !input || !sendButton) {
    console.error("Missing required DOM elements");
    return;
  }


  const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  for (const m of history) appendMessage(m.role, m.text, { time: m.time, save: false });

  function saveMessage(role, text, time) {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    arr.push({ role, text, time });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    while (convo.firstChild) convo.removeChild(convo.firstChild);
    statusEl.textContent = "Cleared";
  }

  function formatTime(ts = Date.now()) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function getInitials(name) {
    if (!name) return "You";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "You";

    
    if (parts.length === 1) {
      const single = parts[0];
      if (single.length <= 3) return single.toUpperCase();
      return single.slice(0, 2).toUpperCase();
    }

   
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  
  function createAvatar(role, displayName) {
    const el = document.createElement("div");
    el.className = `avatar ${role === "user" ? "user" : "bot"}`;
    const name = role === "user" ? (displayName || localStorage.getItem("se_user_name") || "You") : "SE";
    el.textContent = getInitials(name);
    el.title = name;
    el.setAttribute("aria-hidden", "false");
    el.setAttribute("aria-label", `${name} avatar`);
    return el;
  }

  function appendMessage(role, text, { time = Date.now(), save = true } = {}) {
    const wrapper = document.createElement("div");
    wrapper.className = `msg ${role === "user" ? "user" : "bot"}`;

    // pass optional user display name if available
    const displayName = role === "user" ? (localStorage.getItem("se_user_name") || "You") : "SE";
    const avatar = createAvatar(role === "user" ? "user" : "bot", displayName);

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerText = text;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `<span>${role === "user" ? displayName : "Assistant"}</span><span>•</span><span>${formatTime(time)}</span>`;

    const col = document.createElement("div");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.appendChild(bubble);
    col.appendChild(meta);

    wrapper.appendChild(avatar);
    wrapper.appendChild(col);

    convo.appendChild(wrapper);
    convo.scrollTop = convo.scrollHeight;

    if (save) saveMessage(role === "user" ? "user" : "bot", text, time);
  }

  function addTyping() {
    const wrapper = document.createElement("div");
    wrapper.className = "msg bot typing-msg";
    wrapper.setAttribute("data-typing", "1");

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "HE";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.style.minWidth = "64px";
    const t = document.createElement("div");
    t.className = "typing";
    t.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    bubble.appendChild(t);

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    convo.appendChild(wrapper);
    convo.scrollTop = convo.scrollHeight;
    return wrapper;
  }

  async function getAssistantResponse(userPrompt) {
 
    statusEl.textContent = "Contacting server...";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userPrompt }),
      });
      const raw = await res.text().catch(() => "");
      if (!res.ok) {
        console.warn("Server returned", res.status, raw);
       
        if (raw && raw.trim().startsWith("<!DOCTYPE")) {
          return { ok: false, text: `Server returned ${res.status} (HTML). Try running local server.` };
        }
        return { ok: false, text: `Server returned ${res.status}: ${raw || res.statusText}` };
      }
      let data;
      try { data = raw ? JSON.parse(raw) : {}; } catch { return { ok: false, text: "Invalid JSON from server." }; }
      const reply = data.reply || data.message || data.result || "";
      return { ok: true, text: reply || "No reply." };
    } catch (err) {
      console.error("Request failed:", err);
      return { ok: false, text: `Network error: ${err.message || err}` };
    } finally {
      statusEl.textContent = "Ready";
    }
  }

  async function send() {
    const userMessage = input.value.trim();
    if (!userMessage) return;
  
    input.value = "";
    input.disabled = true;
    sendButton.disabled = true;
    appendMessage("user", userMessage);
    const typingEl = addTyping();

    const result = await getAssistantResponse(userMessage);

  
    if (typingEl && typingEl.parentElement) typingEl.parentElement.removeChild(typingEl);

    if (!result.ok) {
      appendMessage("bot", result.text);
    } else {
      
      await revealBotText(result.text);
    }

    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
  }


  async function revealBotText(fullText) {
    const wrapper = document.createElement("div");
    wrapper.className = `msg bot`;
    const avatar = createAvatar("bot");
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerText = ""; // will fill
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `<span>Assistant</span><span>•</span><span>${formatTime()}</span>`;

    const col = document.createElement("div");
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.appendChild(bubble);
    col.appendChild(meta);

    wrapper.appendChild(avatar);
    wrapper.appendChild(col);
    convo.appendChild(wrapper);
    convo.scrollTop = convo.scrollHeight;

    // typing animation: reveal characters at variable speed
    const speed = 18; 
    for (let i = 0; i <= fullText.length; i++) {
      bubble.innerText = fullText.slice(0, i);
      convo.scrollTop = convo.scrollHeight;
      await new Promise((r) => setTimeout(r, speed + Math.random() * 6));
    }

    saveMessage("bot", fullText, Date.now());
  }

 
  sendButton.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  clearBtn.addEventListener("click", () => {
    if (confirm("Clear the conversation history?")) clearHistory();
  });

  
  suggestionsBox.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    input.value = btn.textContent;
    input.focus();
  });


  (function loadPresetScore() {
    try {
      const preset = localStorage.getItem("se_preset_score");
      if (!preset) return;

   
      let pretty = preset;
      try {
        const parsed = JSON.parse(preset);
        pretty = JSON.stringify(parsed, null, 2);
      } catch (e) {
       
      }

      const prompt =
        "Hi assistant — please review this mental health score and give recommendations:\n\n" +
        pretty +
        "\n\nPlease respond with supportive guidance and next steps.";

      input.value = prompt;
      if (statusEl) statusEl.textContent = "Imported score from Scenario Engine";
  
      localStorage.removeItem("se_preset_score");
      input.focus();
    } catch (err) {
      console.error("Failed to load preset score:", err);
    }
  })();

  input.focus();

});