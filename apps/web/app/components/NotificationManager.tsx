"use client";

import { LocalNotifications } from "@capacitor/local-notifications";
import { useEffect } from "react";
import { buildFeedQuery, fetchFeed } from "@/lib/api";
import { getFavorites, getLastSeen, getNotify, setLastSeen } from "@/lib/config";

// Prueft die Favoriten-Themen auf neue Vorgaenge und meldet sie per lokaler
// Benachrichtigung. Laeuft, wenn die App offen/im Vordergrund ist. Echtes
// Hintergrund-Push braucht spaeter einen Server (FCM) - hier bewusst lokal.
async function check() {
  if (!getNotify()) return;
  const favs = getFavorites();
  if (favs.length === 0) return;
  const feed = await fetchFeed(buildFeedQuery({ topics: favs, limit: 20 }));
  if (!feed || feed.items.length === 0) return;

  const newestId = feed.items[0].event_id;
  const lastSeen = getLastSeen();
  if (!lastSeen) {
    setLastSeen(newestId);
    return;
  }
  if (newestId === lastSeen) return;

  let count = 0;
  for (const item of feed.items) {
    if (item.event_id === lastSeen) break;
    count += 1;
  }
  setLastSeen(newestId);
  if (count === 0) return;

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Date.now() % 100000),
          title: "Neues zu deinen Themen",
          body:
            count === 1
              ? "1 neuer Vorgang in deinen Favoriten-Themen."
              : `${count} neue Vorgänge in deinen Favoriten-Themen.`,
        },
      ],
    });
  } catch {
    /* im Browser ohne Wirkung */
  }
}

export function NotificationManager() {
  useEffect(() => {
    void check();
    const id = window.setInterval(() => void check(), 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);
  return null;
}
