import type { JSONContent } from "@tiptap/react";

export type Entry = {
  id: string;
  title: string;
  content: JSONContent;
  word_count: number;
  created_at: string;
  updated_at: string;
  end_date: string | null;
};

export type NewEntry = Pick<Entry, "title" | "content" | "word_count">;
