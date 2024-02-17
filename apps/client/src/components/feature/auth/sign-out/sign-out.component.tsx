"use client";

import { AuthService } from "@/models/api/auth";
import { ClientRoutingService } from "@/models/routing/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutBtn() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function signOut() {
    setLoading(true);

    try {
      await AuthService.signOut();
      router.push(ClientRoutingService.auth.signIn);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={signOut}>{loading ? "loading..." : "Sign Out"}</button>
  );
}