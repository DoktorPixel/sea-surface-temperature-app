import request from "supertest";
import app from "./server";
import path from "path";
import fs from "fs";

describe("API Tests", function () {
  this.timeout(10000);
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

  it("POST /upload - should process the file successfully", (done) => {
    request(app)
      .post("/upload")
      .attach("file", path.join(__dirname, "../test-files/sst.grid.zip"))
      .expect(200)
      .expect((res) => {
        if (!res.body.imageUrl || !res.body.imageUrl.includes("output.png")) {
          throw new Error("Expected valid image URL in response");
        }
      })
      .end(done);
  });

  it("POST /upload - should delete uploaded file after processing", (done) => {
    const testFilePath = path.join(__dirname, "../test-files/sst.grid.zip");

    request(app)
      .post("/upload")
      .attach("file", testFilePath)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        const uploadedFilePath = path.join(
          __dirname,
          "../uploads/",
          path.basename(testFilePath)
        );

        if (fs.existsSync(uploadedFilePath)) {
          throw new Error("Uploaded file was not deleted");
        }

        done();
      });
  });
});
