import { db } from "@/config/database";
import { JournalEntry } from "@/features/journal-entry/schema";
import cron from "@elysiajs/cron";
import { eq, isNotNull } from "drizzle-orm";
import Elysia from "elysia";

export const pluginCronCleanDeletedJournalEntries = (app: Elysia) =>
  app.use(
    cron({
      pattern: "@daily",
      name: "clean-deleted-journal-entries",
      async run(store) {
        const deletedJournalEntries = await db
          .select()
          .from(JournalEntry)
          .where(isNotNull(JournalEntry.end_date));
        if (!deletedJournalEntries.length || deletedJournalEntries.length === 0)
          return;

        const today = new Date();

        for await (const deletedEntry of deletedJournalEntries) {
          if (
            deletedEntry.end_date !== null &&
            deletedEntry.end_date.getTime() < today.getTime()
          ) {
            try {
              await db
                .delete(JournalEntry)
                .where(eq(JournalEntry.id, deletedEntry.id));
            } catch (error) {
              console.log(
                "could not delete journal entry with id:",
                deletedEntry.id,
              );
            }
          }
        }
      },
    }),
  );
