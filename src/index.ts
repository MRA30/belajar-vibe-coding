import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const port = Number(process.env.PORT) || 3000;

export const app = new Elysia()
  .decorate("db", db)
  .get("/", () => ({
    status: "ok",
    message: "Server is running with Bun + ElysiaJS + Drizzle + MySQL!",
    timestamp: new Date().toISOString(),
  }))
  .get("/users", async ({ db }) => {
    try {
      const allUsers = await db.select().from(users);
      return {
        success: true,
        data: allUsers,
      };
    } catch (error) {
      return {
        success: false,
        message: "Database connection failed or table does not exist yet. Ensure MySQL is running and migrations are pushed.",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  })
  .listen(port);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
