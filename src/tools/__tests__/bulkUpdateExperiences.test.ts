import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BulkUpdateExperiencesTool } from "../bulkUpdateExperiences.js";

vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("BulkUpdateExperiencesTool", () => {
  let tool: BulkUpdateExperiencesTool;
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalEnv = process.env;

  beforeEach(() => {
    tool = new BulkUpdateExperiencesTool();
    mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    process.env = { ...originalEnv, LAPRAS_API_KEY: "test-api-key" };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  const mockExperienceList = [
    {
      organization_name: "Test Company",
      positions: [{ id: 1 }],
      is_client_work: false,
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
    },
    {
      organization_name: "Another Company",
      positions: [{ id: 2 }],
      is_client_work: true,
      client_company_name: "Client Corp",
      start_year: 2018,
      start_month: 4,
      end_year: 2020,
      end_month: 3,
    },
  ];

  it("職歴を正常に更新できる", async () => {
    // 現在の職歴を取得するAPIのモック
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ experience_list: mockExperienceList }),
    });

    // 職歴を更新するAPIのモック
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const result = await tool.execute({
      experience_list: mockExperienceList,
      force: false,
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ success: true });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    // GETリクエストの検証
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
    // POSTリクエストの検証
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.any(URL),
      expect.objectContaining({
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: "Bearer test-api-key",
        },
        body: JSON.stringify({
          experience_list: mockExperienceList.map((e) => ({ ...e, id: null })),
        }),
      }),
    );
  });

  it("LAPRAS_API_KEYが設定されていない場合はエラーを返す", async () => {
    process.env.LAPRAS_API_KEY = undefined;

    const result = await tool.execute({
      experience_list: mockExperienceList,
      force: false,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("LAPRAS_API_KEYの設定が必要です");
  });

  it("experience_listが空の場合はエラーを返す", async () => {
    // 現在の職歴を取得するAPIのモック
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ experience_list: [] }),
    });

    const result = await tool.execute({
      experience_list: [],
      force: false,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("職歴リストが必要です");
  });

  it("更新後の職歴数が現在より少ない場合、forceがfalseならエラーを返す", async () => {
    // 現在の職歴を3件に設定
    const currentExperiences = [
      ...mockExperienceList,
      {
        organization_name: "Third Company",
        positions: [{ id: 3 }],
        is_client_work: false,
        start_year: 2017,
        start_month: 1,
        end_year: 2018,
        end_month: 3,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ experience_list: currentExperiences }),
    });

    const result = await tool.execute({
      experience_list: mockExperienceList, // 2件のみ更新
      force: false,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("職歴リストの数が減っています");
  });

  it("更新後の職歴数が現在より少なくても、forceがtrueなら更新できる", async () => {
    // 現在の職歴を3件に設定
    const currentExperiences = [
      ...mockExperienceList,
      {
        organization_name: "Third Company",
        positions: [{ id: 3 }],
        is_client_work: false,
        start_year: 2017,
        start_month: 1,
        end_year: 2018,
        end_month: 3,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ experience_list: currentExperiences }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const result = await tool.execute({
      experience_list: mockExperienceList,
      force: true,
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ success: true });
  });

  it("更新後の職歴に現在の組織名が含まれていない場合、forceがfalseならエラーを返す", async () => {
    // 現在の職歴を設定
    const currentExperiences = [
      {
        organization_name: "Old Company",
        positions: [{ id: 1 }],
        is_client_work: false,
        start_year: 2020,
        start_month: 1,
        end_year: 2023,
        end_month: 12,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ experience_list: currentExperiences }),
    });

    const result = await tool.execute({
      experience_list: [
        {
          organization_name: "New Company", // 異なる組織名
          positions: [{ id: 1 }],
          is_client_work: false,
          start_year: 2020,
          start_month: 1,
          end_year: 2023,
          end_month: 12,
        },
      ],
      force: false,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("職歴リストの数が減っています");
  });

  it("更新後の職歴に現在の組織名が含まれていなくても、forceがtrueなら更新できる", async () => {
    // 現在の職歴を設定
    const currentExperiences = [
      {
        organization_name: "Old Company",
        positions: [{ id: 1 }],
        is_client_work: false,
        start_year: 2020,
        start_month: 1,
        end_year: 2023,
        end_month: 12,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ experience_list: currentExperiences }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const result = await tool.execute({
      experience_list: [
        {
          organization_name: "New Company", // 異なる組織名
          positions: [{ id: 1 }],
          is_client_work: false,
          start_year: 2020,
          start_month: 1,
          end_year: 2023,
          end_month: 12,
        },
      ],
      force: true,
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ success: true });
  });

  it("APIリクエストが失敗した場合はエラーを返す", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ experience_list: mockExperienceList }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({}),
    });

    const result = await tool.execute({
      experience_list: mockExperienceList,
      force: false,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("職歴の新規追加・更新に失敗しました");

    console.error = originalConsoleError;
  });

  it("ネットワークエラーが発生した場合は適切にエラーハンドリングする", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const networkError = new Error("Network error");
    mockFetch.mockRejectedValueOnce(networkError);

    const result = await tool.execute({
      experience_list: mockExperienceList,
      force: false,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("職歴の新規追加・更新に失敗しました");

    console.error = originalConsoleError;
  });
});
