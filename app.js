class CodeAndCat {
  constructor() {
    this.currentLevel = 1;
    this.userProgress = this.loadProgress();
    this.isRunning = false;
    this.init();
  }

  // Загрузка прогресса из LocalStorage
  loadProgress() {
    const saved = localStorage.getItem("codeAndCatProgress");
    return saved
      ? JSON.parse(saved)
      : { currentLevel: 1, completedLevels: [], score: 0 };
  }

  // Сохранение прогресса
  saveProgress() {
    localStorage.setItem(
      "codeAndCatProgress",
      JSON.stringify(this.userProgress)
    );
  }

  // Инициализация
  init() {
    this.bindEvents();
    this.updateProgressDisplay();
  }

  // Назначение обработчиков событий
  bindEvents() {
    // Кнопки на главной странице
    const continueBtn = document.querySelector(".main-page__button--continue");
    const newGameBtn = document.querySelector(".main-page__button--new");

    if (continueBtn)
      continueBtn.addEventListener("click", () => this.continueGame());
    if (newGameBtn)
      newGameBtn.addEventListener("click", () => this.startNewGame());

    // Кнопки в уровнях
    const playPauseBtn = document.getElementById("play-pause");
    const prevStepBtn = document.getElementById("prev-step");
    const nextStepBtn = document.getElementById("next-step");

    if (playPauseBtn)
      playPauseBtn.addEventListener("click", () => this.toggleExecution());
    if (prevStepBtn)
      prevStepBtn.addEventListener("click", () => this.previousStep());
    if (nextStepBtn)
      nextStepBtn.addEventListener("click", () => this.nextStep());
  }

  // Запуск выполнения кода
  toggleExecution() {
    this.isRunning = !this.isRunning;
    const button = document.getElementById("play-pause");

    if (this.isRunning) {
      button.textContent = "⏸ Пауза";
      this.executeCode();
    } else {
      button.textContent = "▶ Запустить";
    }
  }

  // Простая визуализация выполнения
  executeCode() {
    const codeArea = document.querySelector(".level__description");
    if (!codeArea) return;

    const code = levelsData[this.currentLevel].code;
    const lines = code.split("\n");

    codeArea.innerHTML = ""; // Очищаем область

    lines.forEach((line, index) => {
      setTimeout(() => {
        const lineElement = document.createElement("div");
        lineElement.textContent = line;
        lineElement.style.opacity = "0.5";
        codeArea.appendChild(lineElement);

        // Анимация "подсветки" текущей строки
        setTimeout(() => {
          lineElement.style.opacity = "1";
          lineElement.style.backgroundColor = "#e8f4f8";
          setTimeout(() => {
            lineElement.style.backgroundColor = "transparent";
          }, 500);
        }, 100);
      }, index * 1000); // Задержка между строками
    });
  }

  // Обновление отображения прогресса
  updateProgressDisplay() {
    const progressElements = document.querySelectorAll(".levels__counter");
    progressElements.forEach((element) => {
      const levelNum = parseInt(element.textContent.match(/\d+/));
      if (this.userProgress.completedLevels.includes(levelNum)) {
        element.innerHTML += " ✓";
      }
    });
  }

  continueGame() {
    this.currentLevel = this.userProgress.currentLevel;
    window.location.href = `level${this.currentLevel}.html`;
  }

  startNewGame() {
    this.userProgress = { currentLevel: 1, completedLevels: [], score: 0 };
    this.saveProgress();
    window.location.href = "level1.html";
  }

  previousStep() {
    console.log("Предыдущий шаг");
    // Логика перехода к предыдущему шагу
  }

  nextStep() {
    console.log("Следующий шаг");
    // Логика перехода к следующему шагу
  }
}

// Запуск приложения при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  window.codeAndCatApp = new CodeAndCat();
});
