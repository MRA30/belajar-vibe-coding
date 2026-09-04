import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions, type NewUser } from "../db/schema";
import crypto from "crypto";

export class EmailAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailAlreadyExistsError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCredentialsError";
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

  static async loginUser(payload: Pick<NewUser, "email" | "password">) {
    // 1. Cari user berdasarkan email
    const [user] = await db.select().from(users).where(eq(users.email, payload.email));
    
    if (!user) {
      throw new InvalidCredentialsError("Email atau password salah");
    }

    // 2. Bandingkan password
    const isPasswordValid = await bcrypt.compare(payload.password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError("Email atau password salah");
    }

    // 3. Generate token & insert ke tabel sessions
    const token = crypto.randomUUID();
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 24 * 60 * 60 * 1000); // 1 hari dari sekarang

    await db.insert(sessions).values({
      token,
      userId: user.id,
      createdAt: issuedAt,
      updatedAt: issuedAt,
    });

    return {
      token,
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
  }
}
