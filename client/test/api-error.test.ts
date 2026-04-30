import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "../src/api/error";

describe("getApiErrorMessage", () => {
  it("maps backend reservation errors to friendly text", () => {
    const error = {
      isAxiosError: true,
      message: "Request failed with status code 401",
      response: {
        status: 401,
        data: { message: "AUTH_REQUIRED" }
      }
    };

    expect(getApiErrorMessage(error, "预约失败，请稍后重试。")).toBe("请先登录后再操作。");
  });

  it("falls back to the HTTP status when the backend message is unknown", () => {
    const error = {
      isAxiosError: true,
      message: "Request failed with status code 409",
      response: {
        status: 409,
        data: { message: "SOMETHING_ELSE" }
      }
    };

    expect(getApiErrorMessage(error, "预约失败，请稍后重试。")).toBe(
      "当前操作与现有预约冲突，请刷新后重试。"
    );
  });

  it("maps opaque error codes directly", () => {
    expect(getApiErrorMessage(new Error("RESERVATION_TIME_PASSED"), "预约失败，请稍后重试。")).toBe(
      "所选时段已过，无法预约。"
    );
  });
});
