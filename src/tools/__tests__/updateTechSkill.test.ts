import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateTechSkillTool } from "../updateTechSkill.js";

vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("UpdateTechSkillTool", () => {
  let tool: UpdateTechSkillTool;
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalEnv = process.env;

  beforeEach(() => {
    tool = new UpdateTechSkillTool();
    mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    process.env = { ...originalEnv, LAPRAS_API_KEY: "test-api-key" };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  it("テックスキルを正常に更新できる", async () => {
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
        json: () => Promise.resolve({ error: false }),
      });

    const result = await tool.execute({
      tech_skill_list: [
        { name: "Python", years: 4 },
        { name: "Go", years: 1 },
      ],
    });

    expect(result.isError).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledTimes(2);
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
        method: "PUT",
        headers: {
          accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: "Bearer test-api-key",
        },
        body: JSON.stringify({
          tech_skill_list: [
            { tech_skill_id: 1, years: 3 },
            { tech_skill_id: 2, years: 1 },
          ],
        }),
      }),
    );
  });

  it("経験年数の入力値が適切な経験年数IDに変換される", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            tech_skill_list: [
              { id: 10, name: "Skill Zero" },
              { id: 20, name: "Skill One" },
              { id: 30, name: "Skill Two" },
              { id: 40, name: "Skill Three" },
              { id: 50, name: "Skill Five" },
              { id: 60, name: "Skill Ten" },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ error: false }),
      });

    const result = await tool.execute({
      tech_skill_list: [
        { name: "skill zero", years: 0 },
        { name: "Skill One", years: 1 },
        { name: "Skill Two", years: 2 },
        { name: "Skill Three", years: 3 },
        { name: " Skill Five ", years: 5 },
        { name: "SKILL TEN", years: 10 },
      ],
    });

    expect(result.isError).toBeUndefined();
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.any(URL),
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          tech_skill_list: [
            { tech_skill_id: 10, years: 0 },
            { tech_skill_id: 20, years: 1 },
            { tech_skill_id: 30, years: 2 },
            { tech_skill_id: 40, years: 3 },
            { tech_skill_id: 50, years: 5 },
            { tech_skill_id: 60, years: 10 },
          ],
        }),
      }),
    );
  });

  it("スキル名がマスターに存在しない場合はエラーを返す", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          tech_skill_list: [{ id: 1, name: "Python" }],
        }),
    });

    const result = await tool.execute({
      tech_skill_list: [{ name: "Unknown", years: 2 }],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("有効なテックスキルが存在しません");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("LAPRAS_API_KEYが設定されていない場合はエラーを返す", async () => {
    process.env.LAPRAS_API_KEY = undefined;

    const result = await tool.execute({
      tech_skill_list: [{ name: "Python", years: 2 }],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("LAPRAS_API_KEYの設定が必要です");
  });

  it("マスタ取得でエラーが発生した場合はエラーを返す", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    const result = await tool.execute({
      tech_skill_list: [{ name: "Python", years: 2 }],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("テックスキルの更新に失敗しました");

    console.error = originalConsoleError;
  });

  it("更新APIでエラーが発生した場合はエラーを返す", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            tech_skill_list: [{ id: 1, name: "Python" }],
          }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({}),
      });

    const result = await tool.execute({
      tech_skill_list: [{ name: "Python", years: 2 }],
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("テックスキルの更新に失敗しました");

    console.error = originalConsoleError;
  });
});
