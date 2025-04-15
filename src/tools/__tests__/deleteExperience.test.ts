import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteExperienceTool } from "../deleteExperience.js";

vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("DeleteExperienceTool", () => {
  let tool: DeleteExperienceTool;
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalEnv = process.env;

  beforeEach(() => {
    tool = new DeleteExperienceTool();
    mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    process.env = { ...originalEnv, LAPRAS_API_KEY: "test-api-key" };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  it("職歴を正常に削除できる", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    const result = await tool.execute({ experience_id: 123 });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe("職歴の削除が完了しました");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: "DELETE",
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: "Bearer test-api-key",
        },
      }),
    );
  });

  it("LAPRAS_API_KEYが設定されていない場合はエラーを返す", async () => {
    process.env.LAPRAS_API_KEY = undefined;

    const result = await tool.execute({ experience_id: 123 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("LAPRAS_API_KEYの設定が必要です");
  });

  it("APIリクエストが失敗した場合はエラーを返す", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await tool.execute({ experience_id: 123 });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("職歴の削除に失敗しました");
    expect(console.error).toHaveBeenCalled();

    console.error = originalConsoleError;
  });
});
