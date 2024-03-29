import { describe, it, expect, beforeEach, afterAll } from "bun:test";

import { app } from "@/app";
import { createUser } from "../utils/user";
import { db } from "@/config/database";
import { Users } from "@/features/user/schema";
import { endpointPath } from "./index";

beforeEach(async () => await db.delete(Users));
afterAll(async () => await db.delete(Users));

describe("put user on /user", () => {
	it("should update user correctly", async () => {
		const { user, cookie } = await createUser();

		if (!user || !cookie) throw new Error("user could not be created");

		const res = await app.handle(
			new Request(`${endpointPath}/`, {
				method: "PUT",
				headers: { "Content-Type": "application/json", cookie: cookie },
				body: JSON.stringify({
					name: "testasdfasfas",
					email: "mynewemail@gmail.com",
					password: "mynewPassword1234aasdf",
				}),
			}),
		);

		expect(res.ok).toBeTrue();
		expect(res.status).toBe(201);

		const body = await res.json();
		expect(body).toBeObject();
		expect(body).toBeEmptyObject();
	});
});
