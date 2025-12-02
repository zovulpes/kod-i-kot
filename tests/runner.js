let programOutput = "";
let _inputQueue = [];

function captureOutput(text) {
  programOutput += text;
}

function builtinRead(x) {
  if (typeof Sk === "undefined" || !Sk.builtinFiles)
    throw new Error("Skulpt builtin files not available");
  if (!Sk.builtinFiles["files"][x])
    throw new Error("\nFile not found: '" + x + "'");
  return Sk.builtinFiles["files"][x];
}

// Возвращает очередной элемент из очереди
function inputFunction() {
  if (_inputQueue.length === 0) throw new Error("Программа запросила ввод");
  return _inputQueue.shift();
}

// сброс
function resetRunner() {
  programOutput = "";
  _inputQueue = [];
}

// заполнение очереди
function setInputQueueFromString(s) {
  _inputQueue = s ? s.split("\n").filter((v) => v !== "") : [];
}

// вернуть вывод
function getProgramOutput() {
  return programOutput;
}

// вернуть очередь (для тестов, если нужно)
function getInputQueue() {
  return _inputQueue;
}

// ключевая функция runTest остаётся без изменений
function runTest(testInput, expectedOutput, options = {}) {
  programOutput = "";
  setInputQueueFromString(testInput);

  let userCode = "";
  if (options.userCode) userCode = options.userCode;
  else if (options.codeProvider) userCode = options.codeProvider();
  else if (typeof document !== "undefined") {
    const editor = document.getElementById("code-editor");
    if (editor) userCode = editor.value;
  }

  if (typeof Sk === "undefined")
    return Promise.resolve({ success: false, message: "Skulpt не найден" });

  Sk.configure({
    output: captureOutput,
    read: builtinRead,
    inputfun: inputFunction,
    inputfunTakesPrompts: false,
  });

  return Sk.misceval
    .asyncToPromise(() =>
      Sk.importMainWithBody("<stdin>", false, userCode, true)
    )
    .then(
      () => {
        if ((programOutput || "").trim() === (expectedOutput || "").trim()) {
          return {
            success: true,
            message: `Тест (${testInput || "нет ввода"}) пройден`,
          };
        } else {
          return {
            success: false,
            message:
              `❌ Тест (${testInput || "нет ввода"}) не пройден\n` +
              `Ваш вывод: "${(programOutput || "").trim()}"\n` +
              `Ожидаемый: "${(expectedOutput || "").trim()}"`,
          };
        }
      },
      (err) => ({ success: false, message: `❌ Ошибка в коде: ${err}` })
    );
}

module.exports = {
  programOutput,
  captureOutput,
  builtinRead,
  inputFunction,
  resetRunner,
  setInputQueueFromString,
  getProgramOutput,
  getInputQueue,
  runTest,
};
