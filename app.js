// --- 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И ФУНКЦИИ SKULPT ---

// Переменные для работы с вводом/выводом Skulpt
let programOutput = "";
let inputQueue = [];

// Функция для захвата вывода команды print()
function captureOutput(text) {
  programOutput += text;
}

// Служебная функция для чтения файлов (обязательна для Skulpt)
function builtinRead(x) {
  if (
    Sk.builtinFiles === undefined ||
    Sk.builtinFiles["files"][x] === undefined
  )
    throw "\nFile not found: '" + x + "'";
  return Sk.builtinFiles["files"][x];
}

// Функция, которая выдает следующий элемент из очереди, когда Python запрашивает input()
function inputFunction() {
  const nextInput = inputQueue.shift();
  if (nextInput === undefined) {
    throw new Error(
      "Программа запросила ввод, но в тестах закончились данные."
    );
  }
  return nextInput;
}

// --- 2. ОСНОВНАЯ ЛОГИКА (Всё внутри обертки DOMContentLoaded для избежания ошибок Scope) ---
document.addEventListener("DOMContentLoaded", function () {
  // 2.1. ИНИЦИАЛИЗАЦИЯ ВСЕХ КОНСТАНТ (ОДИН РАЗ)
  const runButton = document.getElementById("play-pause");
  const codeEditor = document.getElementById("code-editor");
  const outputConsole = document.getElementById("output-console");
  const nextBtn = document.getElementById("next-step");
  // Объявляем константы для кнопок меню по классам
  const continueBtn = document.querySelector(".main-page__button--continue");
  const newGameBtn = document.querySelector(".main-page__button--new"); // 0. ЛОГИКА ПРОВЕРКИ ПРОГРЕССА В LOCALSTORAGE

  // 0. ЛОГИКА ПРОВЕРКИ ПРОГРЕССА В LOCALSTORAGE
  const savedLevel = localStorage.getItem("python_level");

  // 1. ЛОГИКА ОТОБРАЖЕНИЯ КНОПКИ "ПРОДОЛЖИТЬ"
  if (continueBtn && newGameBtn) {
    if (savedLevel) {
      // Если прогресс найден:
      continueBtn.classList.remove("hidden");
      continueBtn.href = savedLevel;
    } else {
      // Если прогресс НЕ найден:
      continueBtn.classList.add("hidden");
    }
  }

  if (newGameBtn) {
    // Проверяем, что кнопка найдена
    newGameBtn.addEventListener("click", function (e) {
      e.preventDefault(); // Останавливаем стандартное действие ссылки (<a>)

      localStorage.removeItem("python_level");
      window.location.href = "./level1.html";
    });
  }

  // 2.2. ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ЗАПУСКА ОДНОГО ТЕСТА
  function runTest(testInput, expectedOutput) {
    programOutput = ""; // Очищаем вывод перед новым тестом
    inputQueue = testInput.split("\n"); // Загружаем ввод для текущего теста

    // Получаем код пользователя здесь, чтобы он был свежим
    const userCode = codeEditor.value;

    // Конфигурация Skulpt
    Sk.configure({
      output: captureOutput,
      read: builtinRead,
      inputfun: inputFunction,
      inputfunTakesPrompts: false,
    });

    // Запуск Skulpt
    const myPromise = Sk.misceval.asyncToPromise(function () {
      return Sk.importMainWithBody("<stdin>", false, userCode, true);
    });

    // Обработка результата (Promise)
    return myPromise.then(
      // Успешное выполнение кода Python
      function () {
        // Сравнение фактического вывода с ожидаемым (игнорируем лишние пробелы)
        if (programOutput.trim() === expectedOutput.trim()) {
          return {
            success: true,
            message: `Тест (${testInput || "Нет ввода"}) пройден.`,
          };
        } else {
          const actualLength = programOutput.trim().length;
          const expectedLength = expectedOutput.trim().length;

          return {
            success: false,
            message: `❌ Тест (${testInput || "Нет ввода"}) не пройден.
Длина: Ваш вывод (${actualLength}) vs Ожидаемый (${expectedLength})

Ваш вывод: "${programOutput.trim()}"
Ожидаемый вывод: "${expectedOutput.trim()}"
`,
          };
        }
      },
      // Ошибка Python
      function (err) {
        return {
          success: false,
          message: `❌ Ошибка в коде (на тесте ${
            testInput || "Нет ввода"
          }):\n${err.toString()}`,
        };
      }
    );
  }

  // 2.3. ОСНОВНАЯ ЛОГИКА КНОПКИ "ЗАПУСТИТЬ"
  runButton.addEventListener("click", function () {
    const testsJson = document.body.getAttribute("data-tests");
    const nextLevelUrl = document.body.getAttribute("data-next");

    // Проверка JSON: если данные неверны, выдаст ошибку
    try {
      var tests = JSON.parse(testsJson);
    } catch (e) {
      outputConsole.textContent =
        "❌ Ошибка конфигурации уровня: Неверный формат JSON в data-tests.";
      outputConsole.classList.add("error");
      return;
    }

    outputConsole.textContent = "Запуск программы. Тестирование...";
    outputConsole.classList.remove("success", "error");

    let chain = Promise.resolve();
    let allTestsPassed = true;

    // Создаем цепочку Promise для последовательного запуска тестов
    tests.forEach((testCase, index) => {
      chain = chain.then(() => {
        if (!allTestsPassed) return;

        return runTest(testCase.input, testCase.expected).then((result) => {
          outputConsole.textContent += `\n- Запуск теста #${index + 1} (Ввод: ${
            testCase.input || "Нет"
          })...`;

          if (!result.success) {
            allTestsPassed = false;
            throw result.message; // Передаем ошибку дальше в catch
          }
        });
      });
    });

    // Обработка финального результата
    chain
      .then(() => {
        // УСПЕХ
        outputConsole.textContent += "\n\n✅ Все тесты пройдены успешно!";
        outputConsole.classList.add("success");

        if (nextLevelUrl === "finished") {
          // *** Завершение игры ***
          alert("🏆 ПОЗДРАВЛЯЮ! Ты прошел все уровни и освоил основы Python.");

          // СТИРАЕМ ПРОГРЕСС ПОСЛЕ ПОЛНОГО ЗАВЕРШЕНИЯ
          localStorage.removeItem("python_level");
        } else if (nextLevelUrl) {
          // Логика перехода на следующий уровень

          // СОХРАНЯЕМ СЛЕДУЮЩИЙ УРОВЕНЬ В LOCALSTORAGE
          localStorage.setItem("python_level", nextLevelUrl);

          nextBtn.classList.remove("hidden");
          nextBtn.href = nextLevelUrl;
        }
      })
      .catch((errorMessage) => {
        // ПРОВАЛ
        outputConsole.textContent = `\n${errorMessage}`;
        outputConsole.classList.add("error");
      });
  });

  // 2.4. ЛОГИКА КОТА
  const cat = document.querySelector(".level__cat");

  if (cat) {
    // 1. Получаем строку подсказок из атрибута data-tips
    const tipsString = document.body.getAttribute("data-tips");

    // Проверяем, есть ли подсказки
    if (tipsString) {
      // 2. Разбиваем строку на массив, используя "|" как разделитель
      const tips = tipsString.split("|");

      cat.addEventListener("click", function () {
        // Выбираем случайную подсказку из объединенного массива
        const randomIndex = Math.floor(Math.random() * tips.length);
        const randomTip = tips[randomIndex];

        alert("🐈 Кот подсказывает:\n" + randomTip);
      });
    } else {
      // Если data-tips не задан, котик будет молчать или давать стандартную подсказку
      cat.addEventListener("click", function () {
        alert(
          "🐈 Кот подсказывает:\nПохоже, для этого уровня нет специальных подсказок. Проверь общие правила!"
        );
      });
    }
  }
}); // <-- Конец DOMContentLoaded

  // ДЛЯ ТЕСТИРОВАНИЯ
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      // экспортируем то, что будем тестировать
      captureOutput,
      builtinRead,
      inputFunction,
      runTest,
    };
  }
