/**
 * @jest-environment jsdom
 */

const {
  captureOutput,
  inputFunction,
  runTest,
  resetRunner,
  setInputQueueFromString,
  getProgramOutput,
} = require("./runner.js");

describe("Runner tests", () => {
  let originalSk;

  beforeEach(() => {
    // сохраняем оригинальный Sk, если есть
    originalSk = global.Sk;

    // создаём минимальный мок Sk для тестов
    global.Sk = {
      builtinFiles: { files: {} },
      configure: jest.fn(),
      misceval: {
        asyncToPromise: jest.fn((fn) => {
          try {
            const res = fn();
            if (res && typeof res.then === "function") return res;
            return Promise.resolve(res);
          } catch (e) {
            return Promise.reject(e);
          }
        }),
      },
      importMainWithBody: jest.fn(() => Promise.resolve()),
    };
  });

  afterEach(() => {
    global.Sk = originalSk;
    jest.resetAllMocks();
    resetRunner();
  });

  test("runTest: успешный тест — совпадает вывод", async () => {
    global.Sk.importMainWithBody.mockImplementation(() => {
      captureOutput("42\n");
      return Promise.resolve();
    });

    const result = await runTest("", "42");
    expect(result.success).toBe(true);
    expect(result.message).toMatch(/Тест/);
  });

  test("runTest: несовпадение вывода => success false", async () => {
    global.Sk.importMainWithBody.mockImplementation(() => {
      captureOutput("wrong output\n");
      return Promise.resolve();
    });

    const result = await runTest("", "expected");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Тест/);
    expect(result.message).toMatch(/Ваш вывод/);
  });

  test("runTest: ошибка Python => success false и текст ошибки", async () => {
    global.Sk.misceval.asyncToPromise.mockImplementation(() => {
      return Promise.reject(new Error("NameError: name x is not defined"));
    });

    const result = await runTest("", "");
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/Ошибка/);
    expect(result.message).toMatch(/NameError/);
  });

  describe("inputFunction tests", () => {
    test.each([
      { inputs: "a\nb\n", expected: ["a", "b"] },
      { inputs: "42\n", expected: ["42"] },
    ])(
      "inputFunction returns queued values ($inputs)",
      ({ inputs, expected }) => {
        // Наполняем очередь через setInputQueueFromString
        setInputQueueFromString(inputs);

        const out = [];
        out.push(inputFunction());
        if (expected.length > 1) out.push(inputFunction());
        expect(out).toEqual(expected);

        // последующий вызов должен выбросить ошибку
        expect(() => inputFunction()).toThrow(/Программа запросила ввод/);
      }
    );
  });
});
