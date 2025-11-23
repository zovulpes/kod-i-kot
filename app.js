document.addEventListener("DOMContentLoaded", function () {
  // --- ЧАСТЬ 1: Инициализация переменных ---
  const codeEditor = document.getElementById("code-editor");
  const runBtn = document.getElementById("play-pause");
  const nextBtn = document.getElementById("next-step");
  const consoleDiv = document.getElementById("output-console");
  const cat = document.querySelector(".level__cat");

  // Получаем правильный ответ и ссылку на след. уровень из тега <body>
  // Если их нет (например, мы на главной), то answer будет null
  const body = document.body;
  const correctAnswer = body.getAttribute("data-answer");
  const nextLevelUrl = body.getAttribute("data-next");

  // --- ЧАСТЬ 2: Логика проверки кода (если мы на странице уровня) ---
  if (codeEditor && runBtn) {
    runBtn.addEventListener("click", function () {
      // 1. Берем текст, который ввел пользователь, и убираем пробелы по краям
      const userCode = codeEditor.value.trim();

      // 2. Очищаем консоль перед проверкой
      consoleDiv.className = "output-console"; // сброс стилей
      consoleDiv.textContent = "Запуск программы...";

      // 3. Имитация задержки (как будто компьютер думает)
      setTimeout(() => {
        // ПРОВЕРКА: Содержит ли код пользователя правильный ответ?
        // Мы используем .includes(), чтобы не придираться к каждому пробелу
        if (userCode.includes(correctAnswer)) {
          // УСПЕХ
          consoleDiv.textContent =
            "Программа выполнена успешно! Результат верный.";
          consoleDiv.classList.add("success"); // Зеленый цвет

          // Показываем кнопку "Вперед"
          if (nextLevelUrl) {
            nextBtn.classList.remove("hidden");
            nextBtn.href = nextLevelUrl;

            // Сохраняем прогресс: запоминаем ссылку на следующий уровень
            localStorage.setItem("lastLevel", nextLevelUrl);
          }
        } else {
          // ОШИБКА
          consoleDiv.innerHTML =
            "Ошибка выполнения.<br>Код не соответствует заданию или содержит синтаксическую ошибку.";
          consoleDiv.classList.add("error"); // Красный цвет
        }
      }, 500); // Задержка 0.5 секунды
    });
  }

  // --- ЧАСТЬ 3: Логика Кота ---
  if (cat) {
    const tips = [
      "Не забудь проверить кавычки!",
      "Python чувствителен к регистру. Print и print — это разные вещи.",
      "Внимательно прочитай задание ещё раз.",
      "Мяу! Ты отлично справляешься, не сдавайся!",
      "Попробуй скопировать пример из задания и поменять его.",
    ];

    cat.addEventListener("click", function () {
      // Выбираем случайную фразу
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      alert("🐈 Кот подсказывает:\n" + randomTip);
    });
  }

  // --- ЧАСТЬ 4: Логика Главного меню (kk.html) ---
  // Находим кнопки на главной странице
  const continueBtn = document.querySelector(".main-page__button--continue");
  const newGameBtn = document.querySelector(".main-page__button--new");

  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      // Смотрим в память браузера
      const savedLevel = localStorage.getItem("lastLevel");
      if (savedLevel) {
        window.location.href = savedLevel; // Переходим на сохраненный уровень
      } else {
        alert("Сохраненной игры нет. Начинаем сначала!");
        window.location.href = "./level1.html";
      }
    });
  }

  if (newGameBtn) {
    newGameBtn.addEventListener("click", function () {
      // Очищаем сохранение и идем на 1 уровень
      localStorage.removeItem("lastLevel");
      window.location.href = "./level1.html";
    });
  }
});
