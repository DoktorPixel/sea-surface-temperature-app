import request from "supertest";
import app from "./server";

describe("API Tests", () => {
  it("GET / - should return 'Hello from the Sea Surface Temperature App!'", (done) => {
    request(app)
      .get("/")
      .expect(200)
      .expect((res) => {
        if (res.text !== "Hello from the Sea Surface Temperature App!") {
          throw new Error("Incorrect response");
        }
      })
      .end(done);
  });

  it("POST /upload - should return an error when no file is uploaded", (done) => {
    request(app)
      .post("/upload")
      .expect(400)
      .expect((res) => {
        if (!res.text.includes("Error: File not uploaded")) {
          throw new Error("Expected file upload error message");
        }
      })
      .end(done);
  });
});
