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
});
