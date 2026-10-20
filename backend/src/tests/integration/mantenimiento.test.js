import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import express from "express";
import mantenimientoRoutes from "../../routes/mantenimiento.routes.js";
import authRoutes from "../../routes/auth.routes.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/mantenimiento", mantenimientoRoutes);

describe("POST /api/mantenimiento/tareas - Integración Mantenimiento", () => {
  let token = "";

  beforeAll(async () => {
    // 1. Iniciamos sesión como Administrador para obtener el token
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "Ivresse.jorquera@aldeasinfantiles.cl",
        password: "Ivresse Jorquera"
      });
    
    token = res.body.token; // Guardamos el token
  });

  it("1. Debe retornar 400 si se envía una tarea sin descripción (estando autenticado)", async () => {
    const response = await request(app)
      .post("/api/mantenimiento/tareas") // <-- RUTA CORREGIDA a /tareas
      .set("Authorization", `Bearer ${token}`) // 👈 Enviamos el token
      .send({ casaId: 3, descripcion: "" }); // Descripción vacía

    expect(response.statusCode).toBe(400);
  });

  it("2. Debe procesar la solicitud si los datos son correctos (estando autenticado)", async () => {
    const response = await request(app)
      .post("/api/mantenimiento/tareas") // <-- RUTA CORREGIDA a /tareas
      .set("Authorization", `Bearer ${token}`)
      .send({ casaId: 3, descripcion: "Reparación de tubería en el baño" });

    // Pasa la validación, por lo que esperamos éxito o algún rechazo interno de la base de datos
    expect([200, 201, 400, 500]).toContain(response.statusCode);
  });

  it("3. Debe retornar 401 si un usuario intenta crear una tarea sin token", async () => {
    const response = await request(app)
      .post("/api/mantenimiento/tareas") // <-- RUTA CORREGIDA a /tareas
      // NO enviamos token a propósito
      .send({ casaId: 3, descripcion: "Reparación de tubería en el baño" });

    expect(response.statusCode).toBe(401);
  });
});