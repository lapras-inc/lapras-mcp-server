import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GetExpriencesTool } from "../getExperiences.js";

vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("GetExpriencesTool", () => {
  let tool: GetExpriencesTool;
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalEnv = process.env;

  beforeEach(() => {
    tool = new GetExpriencesTool();
    mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    process.env = { ...originalEnv, LAPRAS_API_KEY: "test-api-key" };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  it("職歴一覧を正常に取得できる", async () => {
    const mockData = {
      experiences: [
        {
          id: 123,
          organization_name: "Test Company",
          positions: [{ id: 1 }],
          start_year: 2020,
          start_month: 1,
          end_year: 2023,
          end_month: 12,
        },
        {
          id: 124,
          organization_name: "Another Company",
          positions: [{ id: 2 }],
          start_year: 2018,
          start_month: 4,
          end_year: 2020,
          end_month: 3,
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await tool.execute();

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockData, null, 2));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: "GET",
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: "Bearer test-api-key",
        },
      }),
    );
  });

  it("LAPRAS_API_KEYが設定されていない場合はエラーを返す", async () => {
    process.env.LAPRAS_API_KEY = undefined;

    const result = await tool.execute();

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

    const result = await tool.execute();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("職歴の取得に失敗しました");

    console.error = originalConsoleError;
  });

  it("ネットワークエラーが発生した場合は適切にエラーハンドリングする", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const networkError = new Error("Network error");
    mockFetch.mockRejectedValueOnce(networkError);

    const result = await tool.execute();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("職歴の取得に失敗しました");

    console.error = originalConsoleError;
  });
});
