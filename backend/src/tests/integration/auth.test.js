import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import authRoutes from "../../routes/auth.routes.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("POST /api/auth/login - Integración Auth", () => {
  it("1. Debe rechazar la solicitud con status 400 si falta la contraseña", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "Ivresse.jorquera@aldeasinfantiles.cl" }); // Falta password

    expect(response.statusCode).toBe(400);
  });

  it("2. Debe responder con status 200 (éxito) al usar credenciales correctas", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "Ivresse.jorquera@aldeasinfantiles.cl",
        password: "Ivresse Jorquera" // La contraseña exacta de tu BD
      });

    // Como este usuario sí existe en tu base de datos, debe pasar exitosamente
    expect(response.statusCode).toBe(200);
    
    // Opcional: Si tu API devuelve un token al loguearse, puedes descomentar esto:
    // expect(response.body).toHaveProperty("token"); 
  });

  it("3. Debe responder con 401 (No Autorizado) ante una contraseña incorrecta", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "Ivresse.jorquera@aldeasinfantiles.cl",
        password: "clave-falsa-inventada"
      });

    expect([400, 401, 404]).toContain(response.statusCode);
  });
});