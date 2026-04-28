import { describe, expect, it } from "vitest";
import { createDatabase } from "../src/db.js";
import { authenticateUser, registerStudent } from "../src/domain/auth.service.js";

describe("auth.service", () => {
  it("authenticates the seeded student account", () => {
    const db = createDatabase(":memory:");
    const session = authenticateUser(db, {
      username: "student1",
      password: "Password123!"
    });

    expect(session.user.username).toBe("student1");
    expect(session.token).toBeTypeOf("string");
  });

  it("registers a new student and allows login", () => {
    const db = createDatabase(":memory:");
    const created = registerStudent(db, {
      username: "newstudent",
      password: "Password123!",
      name: "新同学"
    });

    expect(created.username).toBe("newstudent");

    const session = authenticateUser(db, {
      username: "newstudent",
      password: "Password123!"
    });

    expect(session.user.name).toBe("新同学");
  });
});
