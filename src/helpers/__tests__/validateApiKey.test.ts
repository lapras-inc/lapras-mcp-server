import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateApiKey } from "../validateApiKey.js";

describe("validateApiKey", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("LAPRAS_API_KEYが設定されていない場合、エラーレスポンスを返す", () => {
    process.env.LAPRAS_API_KEY = undefined;
    const result = validateApiKey();
    expect(result.isInvalid).toBe(true);
    if (result.isInvalid) {
      expect(result.errorResopnse.isError).toBe(true);
      expect(result.errorResopnse.content[0].text).toContain("LAPRAS_API_KEYの設定が必要です");
    }
  });

  it("LAPRAS_API_KEYが設定されている場合、APIキーを返す", () => {
    const testApiKey = "test-api-key";
    process.env.LAPRAS_API_KEY = testApiKey;
    const result = validateApiKey();
    expect(result.isInvalid).toBe(false);
    if (!result.isInvalid) {
      expect(result.apiKey).toBe(testApiKey);
    }
  });

  it("LAPRAS_API_KEYが空白文字を含む場合、トリムされたAPIキーを返す", () => {
    const testApiKey = "  test-api-key  ";
    process.env.LAPRAS_API_KEY = testApiKey;
    const result = validateApiKey();
    expect(result.isInvalid).toBe(false);
    if (!result.isInvalid) {
      expect(result.apiKey).toBe(testApiKey.trim());
    }
  });
});
