import { describe, expect, it, beforeAll } from "bun:test";
import { app } from "../src/index";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

describe("Elysia Server Endpoints", () => {
  beforeAll(async () => {
    // Clean up test data before running tests
    // Must delete sessions first due to foreign key constraint
    await db.delete(sessions);
    await db.delete(users);
  });
  it("returns 200 and status ok on GET /", async () => {
    const response = await app.handle(new Request("http://localhost:3000/"));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.message).toBe("Server is running with Bun + ElysiaJS + Drizzle + MySQL!");
  });

  it("handles GET /users without crashing", async () => {
    const response = await app.handle(new Request("http://localhost:3000/users"));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(typeof data.success).toBe("boolean");
  });

  it("returns POST /register without crashing", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: "John Doe",
          email: "johndoe@email.com",
          password: "password123",
        }),
      })
    );
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(typeof data.success).toBe("boolean");
  });

  // make test emial exist
  it("returns error if email already exists on POST /register", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: "John Doe",
          email: "johndoe@email.com",
          password: "password123",
        }),
      })
    );
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.code).toBe(4002); // Assuming 4002 is the code for email already exists
  });

  it("returns validation error on incomplete POST /register", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: "" }),
      })
    );
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.code).toBe(4001);
    expect(Array.isArray(data.error)).toBe(true);
  });

  it("returns validation error on incomplete POST /login", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "notanemail" }),
      })
    );
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.code).toBe(4001);
    expect(Array.isArray(data.error)).toBe(true);
  });

  it("returns POST /login without crashing", async () => {
    const response = await app.handle(
      new Request("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "johndoe@email.com",
          password: "password123",
        }),
      })
    );
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(typeof data.success).toBe("boolean");
  });
});
