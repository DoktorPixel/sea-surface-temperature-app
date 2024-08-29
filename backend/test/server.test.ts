import request from "supertest";
import { expect } from "chai";
import app from "../src/server";

describe("POST /upload", () => {
  it("should return error if no file provided", async () => {
    const res = await request(app).post("/upload").send({});
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property("message", "Ошибка: Неверный файл");
  });
});
