import { Users } from "@/features/user/schema";
import {
  pgTable,
  integer,
  varchar,
  boolean,
  uuid,
  timestamp,
  json,
} from "drizzle-orm/pg-core";

type TDocumentContent = {
  type: "doc";
  content: Record<string, unknown>[];
};

export const JournalEntry = pgTable("journal_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => Users.id, { onDelete: "cascade", onUpdate: "cascade" })
    .notNull(),
  title: varchar("title", { length: 80 }).default("Untintled").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  word_count: integer("word_count").default(0).notNull(),
  content: json("content")
    .default({
      type: "doc",
      content: [
        {
          type: "paragraph",
        },
      ],
    })
    .$type<TDocumentContent>(),
  is_private: boolean("is_private").default(false).notNull(),
  end_date: timestamp("end_date"),
});
