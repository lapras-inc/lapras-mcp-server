import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GetTechSkillTool } from "../getTechSkill.js";

vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("GetTechSkillTool", () => {
  let tool: GetTechSkillTool;
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalEnv = process.env;

  beforeEach(() => {
    tool = new GetTechSkillTool();
    mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    process.env = { ...originalEnv, LAPRAS_API_KEY: "test-api-key" };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  it("テックスキル一覧を正常に取得できる", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            tech_skill_list: [
              { id: 1, name: "Python" },
              { id: 2, name: "Go" },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            error: false,
            tech_skill_list: [
              { tech_skill_id: 1, years: 3 },
              { tech_skill_id: 2, years: 5 },
            ],
            updated_at: "2025-09-26T10:00:00Z",
          }),
      });

    const result = await tool.execute();

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(
      JSON.stringify(
        {
          error: false,
          updated_at: "2025-09-26T10:00:00Z",
          tech_skill_list: [
            {
              tech_skill_id: 1,
              tech_skill_name: "Python",
              years_id: 3,
              years_label: "3年以上5年未満",
            },
            {
              tech_skill_id: 2,
              tech_skill_name: "Go",
              years_id: 5,
              years_label: "5年以上10年未満",
            },
          ],
        },
        null,
        2,
      ),
    );

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.any(URL),
      expect.objectContaining({
        method: "GET",
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: "Bearer test-api-key",
        },
      }),
    );

    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
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
    expect(result.content[0].text).toContain("テックスキルの取得に失敗しました");

    console.error = originalConsoleError;
  });

  it("ネットワークエラーが発生した場合は適切にエラーハンドリングする", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const networkError = new Error("Network error");
    mockFetch.mockRejectedValueOnce(networkError);

    const result = await tool.execute();
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("テックスキルの取得に失敗しました");

    console.error = originalConsoleError;
  });
});
