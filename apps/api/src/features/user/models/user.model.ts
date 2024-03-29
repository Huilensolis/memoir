import { Users } from "../schema/index";
import { UserSchema } from "../router/models";

export type User = typeof Users.$inferSelect;
export type NewUser = typeof Users.$inferInsert;
export type SafeUser = Omit<User, "password" | "end_date" | "id">;
export type updateUser = typeof UserSchema.static;
