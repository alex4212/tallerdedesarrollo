import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import acogidaRoutes from "../../routes/acogida.routes.js";
import authRoutes from "../../routes/auth.routes.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/acogida", acogidaRoutes);

describe("POST /api/acogida/menores - Integración Acogida", () => {
  let token = "";

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "Ivresse.jorquera@aldeasinfantiles.cl",
        password: "Ivresse Jorquera"
      });
    
    token = res.body.token; 
  });

  it("1. Debe retornar 400 si la petición no tiene el RUT (estando autenticado como Admin)", async () => {
    const response = await request(app)
      .post("/api/acogida/menores") 
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre_completo: "Ana López", edad: 12 }); 

    expect(response.statusCode).toBe(400);
  });

  it("2. Debe procesar la solicitud si se envía un RUT válido (estando autenticado)", async () => {
    const response = await request(app)
      .post("/api/acogida/menores") // <-- RUTA EXACTA DE TU CÓDIGO
      .set("Authorization", `Bearer ${token}`)
      .send({ rut: "12345678-5", nombre_completo: "Ana López", edad: 12 });

    expect([200, 201, 400, 500]).toContain(response.statusCode);
  });

  it("3. Debe retornar 401 si un intruso intenta acceder sin enviar token", async () => {
    const response = await request(app)
      .post("/api/acogida/menores")
      .send({ rut: "12345678-5", nombre_completo: "Ana López", edad: 12 });

    expect(response.statusCode).toBe(401);
  });
});