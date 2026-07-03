const QUIZ_DATA = [
  {
    id: "science",
    name: "Science",
    icon: "🔬",
    questions: [
      { question: "What planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
      { question: "What gas do plants absorb from the air?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], correct: 2 },
      { question: "What is the chemical symbol for water?", options: ["HO", "H2O", "O2", "CO2"], correct: 1 },
      { question: "How many bones are in the adult human body?", options: ["186", "206", "226", "246"], correct: 1 },
      { question: "What force pulls objects toward Earth?", options: ["Magnetism", "Friction", "Gravity", "Tension"], correct: 2 },
    ],
  },
  {
    id: "movies",
    name: "Movies",
    icon: "🎬",
    questions: [
      { question: "Who directed 'Jaws' and 'E.T.'?", options: ["George Lucas", "Steven Spielberg", "James Cameron", "Ridley Scott"], correct: 1 },
      { question: "Which movie features a character named Jack Dawson?", options: ["Titanic", "Avatar", "Inception", "Gladiator"], correct: 0 },
      { question: "What is the highest-grossing animated film of all time (2024)?", options: ["Frozen 2", "Inside Out 2", "The Lion King (2019)", "Moana"], correct: 1 },
      { question: "In which movie franchise is 'Middle-earth' set?", options: ["Star Wars", "Narnia", "The Lord of the Rings", "Harry Potter"], correct: 2 },
      { question: "Which studio produced 'Toy Story'?", options: ["DreamWorks", "Pixar", "Illumination", "Blue Sky"], correct: 1 },
    ],
  },
  {
    id: "geography",
    name: "Geography",
    icon: "🌍",
    questions: [
      { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2 },
      { question: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1 },
      { question: "Mount Kilimanjaro is located in which country?", options: ["Kenya", "Tanzania", "Uganda", "Ethiopia"], correct: 1 },
      { question: "Which country has the largest population?", options: ["USA", "India", "China", "Indonesia"], correct: 1 },
      { question: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correct: 2 },
    ],
  },
];

const TIME_PER_QUESTION = 15; // seconds

let currentCategory = null;
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = TIME_PER_QUESTION;
let timerId = null;
let hasAnswered = false;

const categoryListEl = document.getElementById("category-list");
const quizCategoryLabel = document.getElementById("quiz-category-label");
const questionCounterEl = document.getElementById("question-counter");
const questionTextEl = document.getElementById("question-text");
const answersListEl = document.getElementById("answers-list");
const feedbackEl = document.getElementById("feedback");
const timerEl = document.getElementById("timer");
const timerValueEl = document.getElementById("timer-value");
const resultsScoreEl = document.getElementById("results-score");
const resultsMessageEl = document.getElementById("results-message");
const bestScoreLineEl = document.getElementById("best-score-line");

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((el) => {
    el.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

function getBestScores() {
  const raw = localStorage.getItem("quiz-best-scores");
  return raw ? JSON.parse(raw) : {};
}

function saveBestScoreIfHighest(categoryId, newScore) {
  const bestScores = getBestScores();
  const previousBest = bestScores[categoryId] || 0;
  if (newScore > previousBest) {
    bestScores[categoryId] = newScore;
    localStorage.setItem("quiz-best-scores", JSON.stringify(bestScores));
    return { best: newScore, isNewBest: true };
  }
  return { best: previousBest, isNewBest: false };
}

function renderCategories() {
  const bestScores = getBestScores();

  categoryListEl.innerHTML = QUIZ_DATA.map((category) => {
    const best = bestScores[category.id];
    const bestLine = best !== undefined
      ? `<p class="best">Best: ${best} / ${category.questions.length}</p>`
      : "";

    return `
      <button class="category-card" data-category-id="${category.id}">
        <span class="icon">${category.icon}</span>
        <h3>${category.name}</h3>
        <p>${category.questions.length} questions</p>
        ${bestLine}
      </button>
    `;
  }).join("");

  document.querySelectorAll(".category-card").forEach((card) => {
    card.addEventListener("click", () => {
      const categoryId = card.dataset.categoryId;
      startQuiz(categoryId);
    });
  });
}

function startQuiz(categoryId) {
  currentCategory = QUIZ_DATA.find((c) => c.id === categoryId);
  currentQuestionIndex = 0;
  score = 0;

  showScreen("quiz-screen");
  renderQuestion();
}

function renderQuestion() {
  hasAnswered = false;
  feedbackEl.textContent = "";

  const question = currentCategory.questions[currentQuestionIndex];

  quizCategoryLabel.textContent = currentCategory.name;
  questionCounterEl.textContent =
    `Question ${currentQuestionIndex + 1} of ${currentCategory.questions.length}`;
  questionTextEl.textContent = question.question;

  answersListEl.innerHTML = question.options.map((option, index) => {
    return `<button class="answer-btn" data-index="${index}">${option}</button>`;
  }).join("");

  document.querySelectorAll(".answer-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleAnswer(Number(btn.dataset.index)));
  });

  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_PER_QUESTION;
  timerValueEl.textContent = timeLeft;
  timerEl.classList.remove("urgent");

  timerId = setInterval(() => {
    timeLeft -= 1;
    timerValueEl.textContent = timeLeft;

    if (timeLeft <= 5) {
      timerEl.classList.add("urgent");
    }

    if (timeLeft <= 0) {
      clearInterval(timerId);
      handleAnswer(null);
    }
  }, 1000);
}

function handleAnswer(selectedIndex) {
  if (hasAnswered) return;
  hasAnswered = true;
  clearInterval(timerId);

  const question = currentCategory.questions[currentQuestionIndex];
  const buttons = document.querySelectorAll(".answer-btn");
  const isCorrect = selectedIndex === question.correct;

  if (isCorrect) {
    score += 1;
    feedbackEl.textContent = "Correct!";
    feedbackEl.style.color = "var(--green)";
  } else {
    feedbackEl.textContent = selectedIndex === null ? "Time's up!" : "Not quite.";
    feedbackEl.style.color = "var(--pink)";
  }

  buttons.forEach((btn) => {
    const index = Number(btn.dataset.index);
    btn.disabled = true;
    if (index === question.correct) {
      btn.classList.add("correct");
    } else if (index === selectedIndex) {
      btn.classList.add("wrong");
    }
  });

  setTimeout(goToNextQuestion, 1200);
}

function goToNextQuestion() {
  currentQuestionIndex += 1;

  if (currentQuestionIndex < currentCategory.questions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  const total = currentCategory.questions.length;
  const { best, isNewBest } = saveBestScoreIfHighest(currentCategory.id, score);

  resultsScoreEl.textContent = `${score} / ${total}`;
  resultsMessageEl.textContent = getResultsMessage(score, total);
  bestScoreLineEl.textContent = isNewBest
    ? `New best score for ${currentCategory.name}!`
    : `Best for ${currentCategory.name}: ${best} / ${total}`;

  showScreen("results-screen");
}

function getResultsMessage(score, total) {
  const ratio = score / total;
  if (ratio === 1) return "Perfect round!";
  if (ratio >= 0.6) return "Solid effort.";
  return "Room to improve — try again!";
}

document.getElementById("retry-btn").addEventListener("click", () => {
  startQuiz(currentCategory.id);
});

document.getElementById("menu-btn").addEventListener("click", () => {
  showScreen("categories-screen");
  renderCategories();
});

renderCategories();