import { describe, expect, it } from "bun:test";
import { app } from "../src/index";

describe("Elysia Server Endpoints", () => {
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
});
