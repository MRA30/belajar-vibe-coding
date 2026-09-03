import { Elysia, t } from "elysia";
import { UsersService, EmailAlreadyExistsError } from "../service/users-service";

export const usersRoutes = new Elysia()
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        success: false,
        message: "Invalid input",
        code: 4001,
        error: error.all.map((err) => ({
          field: err.path.replace(/^\//, ""),
          message: err.summary || err.message,
        })),
      };
    }
  })
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const user = await UsersService.registerUser(body);
        return {
          success: true,
          message: "User berhasil ditambahkan",
          code: 2000,
          data: user,
        };
      } catch (error) {
        if (error instanceof EmailAlreadyExistsError) {
          set.status = 400;
          return {
            success: false,
            message: "Email sudah terdaftar",
            code: 4000,
            error: [],
          };
        }
        
        set.status = 500;
        return {
          success: false,
          message: "Internal server error",
          code: 5000,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    {
      body: t.Object({
        nama: t.String({ minLength: 1, error: "Nama tidak boleh kosong" }),
        email: t.String({ format: "email", error: "Email tidak boleh kosong" }),
        password: t.String({ minLength: 1, error: "Password tidak boleh kosong" }),
      }),
    }
  );
