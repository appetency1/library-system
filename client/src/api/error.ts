import axios from "axios";

const codeMessages: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: "账号或密码不正确。",
  AUTH_REQUIRED: "请先登录后再操作。",
  CHECKIN_TOO_EARLY: "当前还不能签到。",
  FORBIDDEN: "你没有权限执行该操作。",
  INVALID_DATE: "日期格式不正确。",
  INVALID_NAME: "姓名格式不正确。",
  INVALID_TIME: "时间格式不正确。",
  INVALID_TIME_RANGE: "结束时间必须晚于开始时间。",
  INVALID_USERNAME: "用户名格式不正确。",
  NOTICE_NOT_FOUND: "未找到对应公告。",
  RESERVATION_CREATE_FAILED: "创建预约失败，请稍后再试。",
  RESERVATION_EXPIRED: "该预约已过期。",
  RESERVATION_NOT_CANCELLABLE: "这个预约当前不能取消。",
  RESERVATION_NOT_CHECKINABLE: "这个预约当前不能签到。",
  RESERVATION_NOT_CHECKOUTABLE: "这个预约当前不能签退。",
  RESERVATION_NOT_FOUND: "未找到对应预约。",
  RESERVATION_TIME_PASSED: "所选时段已过，无法预约。",
  RESERVATION_UPDATE_FAILED: "更新预约失败，请稍后再试。",
  ROOM_NOT_FOUND: "未找到对应阅览室。",
  SEAT_NOT_FOUND: "未找到对应座位。",
  SEAT_SLOT_CONFLICT: "这个座位在该时段已被占用。",
  SEAT_UNAVAILABLE: "当前座位不可预约，请刷新后重试。",
  USER_CREATE_FAILED: "创建用户失败，请稍后再试。",
  USER_DISABLED: "当前账号已被禁用，无法执行该操作。",
  USER_NOT_FOUND: "未找到对应用户。",
  USER_ROLE_FORBIDDEN: "当前账号无权执行该操作。",
  USER_SLOT_CONFLICT: "你在这个时段已经有一个预约了。",
  WEAK_PASSWORD: "密码强度不足，请重新设置。"
};

const statusMessages: Record<number, string> = {
  400: "提交内容不符合要求，请检查后重试。",
  401: "请先登录后再操作。",
  403: "你没有权限执行该操作。",
  404: "未找到相关内容。",
  409: "当前操作与现有预约冲突，请刷新后重试。",
  500: "服务器暂时不可用，请稍后再试。"
};

const opaqueMessagePattern = /^[A-Z0-9_]+$/;

function extractMessage(error: unknown): string | undefined {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data;
    if (response && typeof response === "object") {
      const message = (response as { message?: unknown }).message;
      if (typeof message === "string") {
        return message;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return undefined;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const message = extractMessage(error);
  if (message && message in codeMessages) {
    return codeMessages[message];
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status && status in statusMessages) {
      return statusMessages[status];
    }
  }

  if (message && !opaqueMessagePattern.test(message)) {
    return message;
  }

  return fallback;
}
