import fetch from "node-fetch";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UpdateExperienceTool } from "../updateExperience.js";

vi.mock("node-fetch", () => {
  return {
    default: vi.fn(),
  };
});

describe("UpdateExperienceTool", () => {
  let tool: UpdateExperienceTool;
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalEnv = process.env;

  beforeEach(() => {
    tool = new UpdateExperienceTool();
    mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    process.env = { ...originalEnv, LAPRAS_API_KEY: "test-api-key" };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
    process.env = originalEnv;
  });

  it("職歴を正常に更新できる", async () => {
    const mockData = {
      id: 123,
      organization_name: "Updated Company",
      positions: [{ id: 1 }],
      start_year: 2020,
      start_month: 1,
      end_year: 2023,
      end_month: 12,
    };

    const updateParams = {
      experience_id: 123,
      organization_name: "Updated Company",
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

    const result = await tool.execute(updateParams);

    expect(result.isError).toBeUndefined();
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual(mockData);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: "PUT",
        headers: {
          accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: "Bearer test-api-key",
        },
        body: JSON.stringify({
          organization_name: updateParams.organization_name,
          positions: updateParams.positions,
          is_client_work: updateParams.is_client_work,
          start_year: updateParams.start_year,
          start_month: updateParams.start_month,
          end_year: updateParams.end_year,
          end_month: updateParams.end_month,
          position_name: updateParams.position_name,
          client_company_name: updateParams.client_company_name,
          description: updateParams.description,
        }),
      }),
    );
  });

  it("LAPRAS_API_KEYが設定されていない場合はエラーを返す", async () => {
    process.env.LAPRAS_API_KEY = undefined;

    const result = await tool.execute({
      experience_id: 123,
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
      experience_id: 123,
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
    expect(result.content[0].text).toContain("職歴の更新に失敗しました");
    expect(console.error).toHaveBeenCalled();

    console.error = originalConsoleError;
  });
});
