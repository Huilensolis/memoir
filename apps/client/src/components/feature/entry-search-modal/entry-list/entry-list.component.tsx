"use client";

import { CommandItem } from "@/components/ui/command";
import { ClientRoutingService } from "@/models/routing/client";
import type { Entry } from "@/types/entry";
import { File } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EntryItemSkeleton } from "./entry-item-skeleton";
import { EntryService } from "@/models/api/entry";
import { useSearchEntryModalStore } from "@/app/app/(stores)/search-entry-command-modal";
import { useAsideNavStore } from "../../aside-nav/store";
import moment from "moment";

export function EntryList() {
  const toggleModal = useSearchEntryModalStore((state) => state.toggleModal);
  const closeDrawerMenu = useAsideNavStore((state) => state.closeDrawer);
  const openDrawerMenu = useAsideNavStore((state) => state.openDrawer);

  const [loading, setLoading] = useState(true);

  const [entries, setEntries] = useState<Entry[]>([]);

  function handleClickOnEntry() {
    toggleModal();

    closeDrawerMenu();

    setTimeout(() => {
      openDrawerMenu();
    }, 500);
  }

  useEffect(() => {
    // fetch entries
    async function fetchUserEntries({ signal }: { signal: AbortSignal }) {
      try {
        setLoading(true);
        const { entryList, error } = await EntryService.getUserEntyList({
          signal,
        });

        if (error || !entryList) throw new Error("error getting entry");

        const availabelEntries = entryList.filter(
          (entry) => typeof entry.end_date !== "string",
        );

        setEntries(
          availabelEntries.sort((entry, nextEntry) =>
            new Date(entry.updated_at) > new Date(nextEntry.updated_at)
              ? -1
              : 1,
          ),
        );
      } catch (error) {
        //
      } finally {
        setLoading(false);
      }
    }

    const ctrl = new AbortController();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchUserEntries({ signal: ctrl.signal });

    return () => {
      ctrl.abort();
    };
  }, []);

  return (
    <>
      {loading &&
        Array(8)
          .fill("")
          .map((_, i) => <EntryItemSkeleton key={i} />)}

      {!loading &&
        entries.length > 0 &&
        entries.map((entry) => (
          <CommandItem
            className="w-full"
            key={entry.id}
            onClick={(e) => {
              e.preventDefault();
            }}
            value={entry.title}
          >
            <article>
              <Link
                href={ClientRoutingService.app.entries.readById(entry.id)}
                className="w-full flex items-center gap-2 text-base"
                onClick={handleClickOnEntry}
              >
                <File className="mr-2 h-5 w-5" />
                <div className="flex flex-col">
                  <h1 className="text-sm">{entry.title}</h1>
                  <p className="text-neutral-400 text-sm">
                    {moment(entry.updated_at).startOf("seconds").fromNow()}
                  </p>
                </div>
              </Link>
            </article>
          </CommandItem>
        ))}
    </>
  );
}
