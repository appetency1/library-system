import { beforeEach, describe, expect, it } from "vitest";
import { createDatabase } from "../src/db.js";
import { createNotice, deleteNotice, listNotices } from "../src/domain/admin.service.js";

describe("admin.service", () => {
  let db: ReturnType<typeof createDatabase>;

  beforeEach(() => {
    db = createDatabase(":memory:");
  });

  it("deletes an existing notice", () => {
    createNotice(db, {
      title: "临时通知",
      content: "稍后清理",
      status: "published"
    });

    const before = listNotices(db);
    const noticeId = before[before.length - 1].id;

    deleteNotice(db, noticeId);

    const after = listNotices(db);
    expect(after.some((notice) => notice.id === noticeId)).toBe(false);
  });

  it("throws when deleting a missing notice", () => {
    expect(() => deleteNotice(db, 9999)).toThrowError("NOTICE_NOT_FOUND");
  });
});
