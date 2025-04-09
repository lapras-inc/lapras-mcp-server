import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateOrUpdateExpriencesTool } from "../createOrUpdateExpriences.js";

vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("CreateOrUpdateExpriencesTool", () => {
  let tool: CreateOrUpdateExpriencesTool;
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalEnv = process.env;

  beforeEach(() => {
    tool = new CreateOrUpdateExpriencesTool();
    mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    process.env = { ...originalEnv, LAPRAS_API_KEY: "test-api-key" };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  it("新規職歴を正常に追加できる", async () => {
    const mockData = {
      success: true,
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
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const experience = {
      id: null,
      organization_name: "Test Company",
      positions: [{ id: 1 }],
      is_client_work: false,
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
    };

    const result = await tool.execute({ experience_list: [experience] });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockData, null, 2));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: "Bearer test-api-key",
        },
        body: JSON.stringify({ experience_list: [experience] }),
      }),
    );
  });

  it("既存の職歴を正常に更新できる", async () => {
    const mockData = {
      success: true,
      experiences: [
        {
          id: 123,
          organization_name: "Updated Company",
          positions: [{ id: 2 }],
          start_year: 2020,
          start_month: 1,
          end_year: 2023,
          end_month: 12,
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const experience = {
      id: 123,
      organization_name: "Updated Company",
      positions: [{ id: 2 }],
      is_client_work: false,
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
    };

    const result = await tool.execute({ experience_list: [experience] });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockData, null, 2));
  });

  it("クライアントワークの職歴を正常に追加できる", async () => {
    const mockData = {
      success: true,
      experiences: [
        {
          id: 124,
          organization_name: "Consulting Firm",
          client_company_name: "Client Company",
          positions: [{ id: 3 }],
          start_year: 2021,
          start_month: 4,
          end_year: 0,
          end_month: 0,
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const experience = {
      id: null,
      organization_name: "Consulting Firm",
      client_company_name: "Client Company",
      positions: [{ id: 3 }],
      is_client_work: true,
      start_year: 2021,
      start_month: 4,
      end_year: 0,
      end_month: 0,
    };

    const result = await tool.execute({ experience_list: [experience] });

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(JSON.stringify(mockData, null, 2));
  });

  it("LAPRAS_API_KEYが設定されていない場合はエラーを返す", async () => {
    process.env.LAPRAS_API_KEY = undefined;

    const result = await tool.execute({ experience_list: [] });

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

    const experience = {
      id: null,
      organization_name: "Test Company",
      positions: [{ id: 1 }],
      is_client_work: false,
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
    };

    const result = await tool.execute({ experience_list: [experience] });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("職歴の新規追加・更新に失敗しました");

    console.error = originalConsoleError;
  });

  it("ネットワークエラーが発生した場合は適切にエラーハンドリングする", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const networkError = new Error("Network error");
    mockFetch.mockRejectedValueOnce(networkError);

    const experience = {
      id: null,
      organization_name: "Test Company",
      positions: [{ id: 1 }],
      is_client_work: false,
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
    };

    const result = await tool.execute({ experience_list: [experience] });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("職歴の新規追加・更新に失敗しました");

    console.error = originalConsoleError;
  });
});
