// --- Expanded Sample Scenarios ---
const SCENARIOS = [
  {
    title: "Feeling Overwhelmed",
    intro: "You have a lot of homework and exams are coming.",
    questions: [
      {
        q: "How do you usually react?",
        answers: [
          { label: "I panic and procrastinate", score: { stress: 2 } },
          { label: "I make a study plan", score: { resilience: 2 } },
        ],
      },
      {
        q: "Do you talk to anyone about it?",
        answers: [
          { label: "Yes, a friend or family member", score: { support: 2 } },
          { label: "No, I keep it to myself", score: { isolation: 2 } },
        ],
      },
    ],
  },
  {
    title: "Low Motivation",
    intro: "You feel tired and don’t want to study.",
    questions: [
      {
        q: "What do you usually do?",
        answers: [
          { label: "I rest and then continue", score: { resilience: 2 } },
          { label: "I give up completely", score: { stress: 2 } },
        ],
      },
    ],
  },
  {
    title: "Anxiety About Future",
    intro: "You are worried about what lies ahead.",
    questions: [
      {
        q: "How do you cope with these feelings?",
        answers: [
          { label: "I try to plan for the future", score: { resilience: 2 } },
          { label: "I avoid thinking about it", score: { stress: 2 } },
        ],
      },
      {
        q: "Do you seek help?",
        answers: [
          { label: "Yes, I talk to a counselor", score: { support: 2 } },
          { label: "No, I handle it alone", score: { isolation: 2 } },
        ],
      },
    ],
  },
  {
    title: "Struggling with Relationships",
    intro: "You feel disconnected from friends or family.",
    questions: [
      {
        q: "What do you do when you feel this way?",
        answers: [
          { label: "I reach out to someone", score: { support: 2 } },
          { label: "I isolate myself", score: { isolation: 2 } },
        ],
      },
      {
        q: "How often do you communicate with loved ones?",
        answers: [
          { label: "Regularly", score: { resilience: 2 } },
          { label: "Rarely", score: { stress: 2 } },
        ],
      },
    ],
  },
  {
    title: "Coping with Stress",
    intro: "You are feeling overwhelmed by daily pressures.",
    questions: [
      {
        q: "What helps you manage stress?",
        answers: [
          { label: "Exercise or physical activity", score: { resilience: 2 } },
          { label: "I tend to overeat or binge-watch", score: { stress: 2 } },
        ],
      },
      {
        q: "Do you practice mindfulness or relaxation techniques?",
        answers: [
          { label: "Yes, regularly", score: { resilience: 2 } },
          { label: "No, I don't find it helpful", score: { stress: 2 } },
        ],
      },
    ],
  },
  {
    title: "Sleep Problems",
    intro: "You struggle to fall or stay asleep.",
    questions: [
      {
        q: "How often do you sleep poorly?",
        answers: [
          { label: "Occasionally", score: { stress: 1 } },
          { label: "Most nights", score: { stress: 2 } },
        ],
      },
      {
        q: "Do poor sleep habits affect your day?",
        answers: [
          { label: "Sometimes, but manageable", score: { resilience: 1 } },
          { label: "Yes, it impacts everything", score: { stress: 2 } },
        ],
      },
    ],
  },
  {
    title: "Social Anxiety",
    intro: "You feel nervous in social situations.",
    questions: [
      {
        q: "What happens in social settings?",
        answers: [
          { label: "I feel uncomfortable but push through", score: { resilience: 1 } },
          { label: "I avoid them entirely", score: { isolation: 2 } },
        ],
      },
      {
        q: "Do you worry about being judged?",
        answers: [
          { label: "Sometimes, but I manage", score: { stress: 1 } },
          { label: "Yes, a lot", score: { stress: 2 } },
        ],
      },
    ],
  },
  {
    title: "Grief & Loss",
    intro: "You are processing the loss of someone or something important.",
    questions: [
      {
        q: "How do you process grief?",
        answers: [
          { label: "I talk about it and get support", score: { support: 2 } },
          { label: "I keep it inside", score: { isolation: 2 } },
        ],
      },
      {
        q: "Are daily routines affected?",
        answers: [
          { label: "Some days yes, but I cope", score: { resilience: 1 } },
          { label: "Yes, I struggle a lot", score: { stress: 2 } },
        ],
      },
    ],
  },
];

let step = { s: 0, q: 0 }; // scenario idx, question idx
let score = {}; // category -> points

function addScores(base, extra) {
  const newScore = { ...base };
  for (const key in extra) {
    newScore[key] = (newScore[key] || 0) + extra[key];
  }
  return newScore;
}

function renderScenario() {
  const app = document.getElementById("app");
  const scenario = SCENARIOS[step.s];
  const question = scenario.questions[step.q];

  app.innerHTML = `
    <div class="scenario-card">
      <h2 class="scenario-title">${scenario.title}</h2>
      <p class="muted scenario-intro">${scenario.intro}</p>

      <div class="q">
        <h3>${question.q}</h3>
        <div class="answers">
          ${question.answers
            .map(
              (a, i) =>
                `<button class="choice" data-idx="${i}">${a.label}</button>`
            )
            .join("")}
        </div>
      </div>

      <div class="progress">
        Scenario ${step.s + 1}/${SCENARIOS.length} • 
        Question ${step.q + 1}/${scenario.questions.length}
      </div>
    </div>
  `;

  // attach event listeners
  document.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-idx");
      pick(question.answers[idx].score);
    });
  });
}

function pick(answerScore) {
  score = addScores(score, answerScore);

  const scenario = SCENARIOS[step.s];
  const isLastQuestion = step.q >= scenario.questions.length - 1;
  const isLastScenario = step.s >= SCENARIOS.length - 1;

  if (!isLastQuestion) {
    step.q++;
  } else if (!isLastScenario) {
    step.s++;
    step.q = 0;
  } else {
    finishGame();
    return;
  }
  renderScenario();
}

function finishGame() {
  const app = document.getElementById("app");
  const friendly = Object.keys(score).length ? JSON.stringify(score, null, 2) : "No significant flags detected.";
  app.innerHTML = `
    <div class="result-card">
      <h2>Finished — Thank you</h2>
      <p class="muted">This quick check suggests these areas:</p>
      <pre class="result-pre" id="score-pre">${friendly}</pre>

      <div style="margin-top:18px; display:flex; gap:10px;">
        <button id="copy-score" class="btn">Copy Score</button>
        <button id="send-bot" class="btn primary">Send to Assistant</button>
        <button class="btn" onclick="location.reload()">Try Again</button>
      </div>
    </div>
  `;

  // Copy to clipboard
  document.getElementById("copy-score").addEventListener("click", async () => {
    try {
      const text = document.getElementById("score-pre").innerText;
      await navigator.clipboard.writeText(text);
      const b = document.getElementById("copy-score");
      b.textContent = "Copied ✓";
      setTimeout(() => (b.textContent = "Copy Score"), 1500);
    } catch (err) {
      alert("Copy failed. You can manually select and copy the score.");
      console.error(err);
    }
  });

  // Send to assistant: save to localStorage and open chat
  document.getElementById("send-bot").addEventListener("click", () => {
    const data = document.getElementById("score-pre").innerText;
    try {
      // store raw JSON string so chat can load it
      localStorage.setItem("se_preset_score", data);
      // open chat in same tab
      location.href = "chat.html";
    } catch (err) {
      alert("Unable to send to assistant.");
      console.error(err);
    }
  });
}

// Start
renderScenario();

