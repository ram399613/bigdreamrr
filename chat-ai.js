/* ===========================================================
   BIG DREAM ADVANCED OFFLINE AI ASSISTANT
   Features:
   3️⃣ Smarter AI (multi-intent, memory, natural replies)
   4️⃣ Voice Reply (Text-to-Speech)
   5️⃣ Animations (slide, fade, typing dots)
   6️⃣ Extra Functions (Clear Chat, Save Chat, Memory)
=========================================================== */

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const typingEl = document.getElementById("typing");
const clearBtn = document.getElementById("clearChat");
const saveBtn = document.getElementById("saveChat");
const quickBtns = document.querySelectorAll(".quick-btn");

// Load saved name
let userName = localStorage.getItem("bd_username") || null;

/* ===========================================================
   ANIMATION HELPER
=========================================================== */
function animateBubble(el) {
  el.style.opacity = 0;
  el.style.transform = "translateY(10px)";
  setTimeout(() => {
    el.style.transition = "0.35s ease";
    el.style.opacity = 1;
    el.style.transform = "translateY(0)";
  }, 20);
}

/* ===========================================================
   ADD MESSAGE IN CHAT
=========================================================== */
function addMessage(text, who = "bot") {
  const div = document.createElement("div");
  div.className = `msg ${who}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  bubble.textContent = text;

  if (who === "user") {
    div.appendChild(bubble);
  } else {
    div.appendChild(avatar);
    div.appendChild(bubble);
  }

  messagesEl.appendChild(div);
  animateBubble(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

/* ===========================================================
   SMARTER OFFLINE AI LOGIC
=========================================================== */
function replyAI(text) {
  const t = text.toLowerCase();

  // learn name
  if (!userName && (t.startsWith("i am") || t.startsWith("my name is"))) {
    userName = text.replace("i am", "").replace("my name is", "").trim();
    localStorage.setItem("bd_username", userName);
    return `Nice to meet you, ${userName}! How can I help with your goals today?`;
  }

  // greeting
  if (/hi|hello|hey|good/.test(t)) {
    return userName
      ? `Hello ${userName}! What can I do for you today?`
      : "Hello! What's your name?";
  }

  // motivation
  if (/motivat|inspir|lazy|no energy|discour/.test(t)) {
    return "Every big dream begins with a small step. You're stronger than today's challenges. Let's keep moving forward! 💙";
  }

  // study
  if (/study|exam|focus|school|college|learn/.test(t)) {
    return "Study Plan:\n📘 40 mins deep work\n⏱️ 5–10 min break\n🔁 Repeat 4 cycles\n📌 Review before sleeping.\nYou’ve absolutely got this!";
  }

  // daily plan
  if (/day plan|routine|schedule|plan my day/.test(t)) {
    return "Your Day Plan:\n🌅 Morning: hydrate + stretch\n📚 Afternoon: focused study/work\n🌆 Evening: reflection + light walk\n💤 Night: good sleep for recovery.";
  }

  // health
  if (/health|exercise|diet|food|workout/.test(t)) {
    return "Health Tip: Drink water every 2 hours, walk 20 minutes a day, maintain sleep discipline, and eat balanced meals. Your body powers your dream!";
  }

  // emotions
  if (/sad|stress|depress|worried|hurt/.test(t)) {
    return "It's okay to feel this way. Take a deep breath. You're not alone — every storm eventually passes. I'm here with you 💙";
  }

  // fallback
  return "I’m here to help! Try asking about study plans, motivation, health, or your daily routine. 😊";
}

/* ===========================================================
   VOICE REPLY (Text to Speech)
=========================================================== */
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.pitch = 1;
  utter.rate = 1;
  utter.volume = 1;
  utter.voice = speechSynthesis.getVoices()[0];
  speechSynthesis.speak(utter);
}

/* ===========================================================
   SEND MESSAGE
=========================================================== */
function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  addMessage(text, "user");
  inputEl.value = "";

  typingEl.style.display = "flex";

  setTimeout(() => {
    typingEl.style.display = "none";
    const reply = replyAI(text);
    addMessage(reply, "bot");
    speak(reply); // voice reply
  }, 700);
}

/* ===========================================================
   VOICE INPUT
=========================================================== */
if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
  const SR = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  SR.lang = "en-US";

  micBtn.addEventListener("click", () => {
    SR.start();
    micBtn.style.background = "#38bdf8";
  });

  SR.onresult = (e) => {
    micBtn.style.background = "";
    const text = e.results[0][0].transcript;
    inputEl.value = text;
    sendMessage();
  };

  SR.onerror = () => (micBtn.style.background = "");
}

/* ===========================================================
   CLEAR CHAT
=========================================================== */
clearBtn.addEventListener("click", () => {
  messagesEl.innerHTML = "";
});

/* ===========================================================
   SAVE CHAT (download as text)
=========================================================== */
saveBtn.addEventListener("click", () => {
  let log = "";
  messagesEl.querySelectorAll(".msg").forEach((m) => {
    log += (m.classList.contains("user") ? "You: " : "Bot: ") +
           m.innerText +
           "\n\n";
  });

  const blob = new Blob([log], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "chat-history.txt";
  a.click();
});

/* ===========================================================
   INPUT EVENTS
=========================================================== */
sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
quickBtns.forEach((b) =>
  b.addEventListener("click", () => {
    inputEl.value = b.dataset.q;
    sendMessage();
  })
);

/* ===========================================================
   WELCOME
=========================================================== */
addMessage(
  userName
    ? `Welcome back, ${userName}! How can I help you today?`
    : "Hello! I'm your BIG DREAM helper. What's your name?",
  "bot"
);
