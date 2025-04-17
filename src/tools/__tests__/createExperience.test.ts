import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateExperienceTool } from "../createExperience.js";

vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("CreateExperienceTool", () => {
  let tool: CreateExperienceTool;
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalEnv = process.env;

  beforeEach(() => {
    tool = new CreateExperienceTool();
    mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    process.env = { ...originalEnv, LAPRAS_API_KEY: "test-api-key" };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  it("職歴を正常に作成できる", async () => {
    const mockData = {
      id: "123",
      organization_name: "Test Company",
      positions: [{ id: 1 }],
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
    };

    const createParams = {
      organization_name: "Test Company",
      positions: [{ id: 1 }],
      is_client_work: false,
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
      position_name: "",
      client_company_name: "",
      description: "",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await tool.execute(createParams);

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual(mockData);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          Authorization: "Bearer test-api-key",
        },
        body: JSON.stringify(createParams),
      }),
    );
  });

  it("クライアントワークの場合、client_company_nameが必須", async () => {
    const createParams = {
      organization_name: "Test Company",
      positions: [{ id: 1 }],
      is_client_work: true,
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
      position_name: "",
      client_company_name: "Client Company",
      description: "",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...createParams, id: "123" }),
    });

    const result = await tool.execute(createParams);

    expect(result.isError).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(createParams),
      }),
    );
  });

  it("LAPRAS_API_KEYが設定されていない場合はエラーを返す", async () => {
    process.env.LAPRAS_API_KEY = undefined;

    const result = await tool.execute({
      organization_name: "Test Company",
      positions: [{ id: 1 }],
      is_client_work: false,
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
      position_name: "",
      client_company_name: "",
      description: "",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("LAPRAS_API_KEYの設定が必要です");
  });

  it("APIリクエストが失敗した場合はエラーを返す", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
    });

    const result = await tool.execute({
      organization_name: "Test Company",
      positions: [{ id: 1 }],
      is_client_work: false,
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
      position_name: "",
      client_company_name: "",
      description: "",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("職歴の新規追加に失敗しました");
    expect(console.error).toHaveBeenCalled();

    console.error = originalConsoleError;
  });

  it("descriptionの\\nを改行文字に変換する", async () => {
    const createParams = {
      organization_name: "Test Company",
      positions: [{ id: 1 }],
      is_client_work: false,
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
      position_name: "",
      client_company_name: "",
      description: "Line 1\\nLine 2\\nLine 3",
    };

    const expectedBody = {
      ...createParams,
      description: "Line 1\nLine 2\nLine 3",
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...expectedBody, id: "123" }),
    });

    const result = await tool.execute(createParams);

    expect(result.isError).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(expectedBody),
      }),
    );
  });
});
