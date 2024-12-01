const request = require("supertest");
const app = require("../app");

describe("Auth Routes", () => {
    it("should register a new user", async () => {
        const res = await request(app).post("/auth/register").send({
            username: "testuser56",
            email: "testuser35@example.com",
            password: "passwor3d15234",
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toEqual("User registered successfully");
    });
});
