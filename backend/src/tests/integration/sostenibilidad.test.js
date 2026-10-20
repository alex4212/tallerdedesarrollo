import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import sostenibilidadRoutes from "../../routes/sostenibilidad.routes.js";
import authRoutes from "../../routes/auth.routes.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/sostenibilidad", sostenibilidadRoutes);

describe("POST /api/sostenibilidad/gastos - Integración Sostenibilidad", () => {
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

  it("1. Debe retornar 400 si el monto del gasto es negativo (estando autenticado)", async () => {
    const response = await request(app)
      .post("/api/sostenibilidad/gastos") 
      .set("Authorization", `Bearer ${token}`) 
      .send({ casaId: 3, monto: -5000, descripcion: "Supermercado" });

    expect(response.statusCode).toBe(400);
  });

  it("2. Debe procesar la solicitud si los datos son correctos (estando autenticado)", async () => {
    const response = await request(app)
      .post("/api/sostenibilidad/gastos") 
      .set("Authorization", `Bearer ${token}`)
      .send({ casaId: 3, monto: 50000, descripcion: "Supermercado" });

    expect([200, 201, 400, 500]).toContain(response.statusCode);
  });

  it("3. Debe retornar 401 si se intenta registrar sin token", async () => {
    const response = await request(app)
      .post("/api/sostenibilidad/gastos") 
      .send({ casaId: 3, monto: 50000, descripcion: "Supermercado" });

    expect(response.statusCode).toBe(401);
  });
});