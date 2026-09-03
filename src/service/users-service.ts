import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, type NewUser } from "../db/schema";

export class EmailAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailAlreadyExistsError";
  }
}

export class UsersService {
  static async registerUser(payload: NewUser) {
    // 1. Cek email apakah sudah terdaftar
    const existingUser = await db.select().from(users).where(eq(users.email, payload.email));
    
    if (existingUser.length > 0) {
      throw new EmailAlreadyExistsError("Email sudah terdaftar");
    }

    // 2. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

    // 3. Insert ke database
    const [result] = await db.insert(users).values({
      nama: payload.nama,
      email: payload.email,
      password: hashedPassword,
    });

    // 4. Return data yang disingkat tanpa password
    return {
      id: result.insertId,
      nama: payload.nama,
      email: payload.email,
    };
  }
}
