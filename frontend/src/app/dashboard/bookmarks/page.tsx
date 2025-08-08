"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "@/components/cards/eventCard";

export default function BookmarksPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBookmarkedEvents() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const userRaw = localStorage.getItem("user");
        let userId = null;
        if (userRaw) {
          try {
            const userObj = JSON.parse(userRaw);
            userId = userObj.userId || userObj.id || userObj.UserId || userObj.Id;
          } catch {}
        }
        if (!userId) {
          setError("User ID not found. Please log in again.");
          setEvents([]);
          setLoading(false);
          return;
        }
        const res = await axios.get(`http://localhost:5274/api/Bookmarks/bookmarked-events/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        setError("Failed to fetch your bookmarks");
        setEvents([]);
        console.error("[Bookmarks] API error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarkedEvents();
  }, []);



  return (
    <div className="mx-5 mt-10">
      <h1 className="text-3xl font-bold mb-6">My Bookmarked Events</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500">You have not bookmarked any events yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event, idx) => (
            <EventCard
              event={event}
              key={event.eventId || idx}
              showActions={false}
              hideRegister={false}
              onBookmarkToggle={async () => {
                // Remove the event from the list after successful delete
                setEvents(prev => prev.filter(e => e.eventId !== event.eventId));
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
