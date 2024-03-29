import { Hr } from "@/components/ui/hr";
import { AsideNavLinks } from "./components/navlinks";
import { ProfileCard } from "./components/profile-card";

export async function AsideNav() {
  return (
    <aside className="max-w-80 w-full h-full min-h-screen p-2 flex gap-2 flex-col items-center bg-zinc-100 border-r border-neutral-300">
      <ProfileCard />
      <Hr orientation="horizontal" className="my-1" />
      <AsideNavLinks />
      <Hr orientation="horizontal" className="my-1" />
    </aside>
  );
}
