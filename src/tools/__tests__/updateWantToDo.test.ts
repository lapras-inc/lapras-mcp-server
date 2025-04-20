import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateWantToDoTool } from "../updateWantToDo.js";

vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("UpdateWantToDoTool", () => {
  let tool: UpdateWantToDoTool;
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalEnv = process.env;

  beforeEach(() => {
    tool = new UpdateWantToDoTool();
    mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    process.env = { ...originalEnv, LAPRAS_API_KEY: "test-api-key" };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  it("今後のキャリアでやりたいことを正常に更新できる", async () => {
    const mockData = {
      error: false,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const wantToDo = "今後はAIエンジニアとして成長し、大規模プロジェクトをリードしていきたいです。";
    const result = await tool.execute({ want_to_do: wantToDo });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockData, null, 2));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: "PUT",
        headers: {
          accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: "Bearer test-api-key",
        },
        body: JSON.stringify({ want_to_do: wantToDo }),
      }),
    );
  });

  it("LAPRAS_API_KEYが設定されていない場合はエラーを返す", async () => {
    process.env.LAPRAS_API_KEY = undefined;

    const result = await tool.execute({ want_to_do: "テスト" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("LAPRAS_API_KEYの設定が必要です");
  });

  it("APIリクエストが失敗した場合はエラーを返す", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({}),
    });

    const result = await tool.execute({ want_to_do: "テスト" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("今後のキャリアでやりたいことの更新に失敗しました");

    console.error = originalConsoleError;
  });

  it("ネットワークエラーが発生した場合は適切にエラーハンドリングする", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const networkError = new Error("Network error");
    mockFetch.mockRejectedValueOnce(networkError);

    const result = await tool.execute({ want_to_do: "テスト" });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("今後のキャリアでやりたいことの更新に失敗しました");

    console.error = originalConsoleError;
  });
});
