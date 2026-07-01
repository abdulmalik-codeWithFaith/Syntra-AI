"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AutoJoinPoller() {
  const { userDoc } = useAuth();

  useEffect(() => {
    if (!userDoc) return;

    async function poll() {
      try {
        await fetch("/api/cron/auto-join", {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`,
          },
        });
      } catch (err) {
        console.error("Auto-join poll failed:", err);
      }
    }

    // Run immediately on mount
    poll();

    // Then every 60 seconds
    const interval = setInterval(poll, 60 * 1000);
    return () => clearInterval(interval);
  }, [userDoc]);

  return null; // invisible component
}