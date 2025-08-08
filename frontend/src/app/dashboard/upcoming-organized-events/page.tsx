"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "@/components/cards/eventCard";

export default function MyEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMyEvents() {
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
        console.log("[MyEvents] Using token:", token, "userId:", userId);
        if (!userId) {
          setError("User ID not found. Please log in again.");
          setEvents([]);
          setLoading(false);
          return;
        }
        const res = await axios.post(`http://localhost:5274/api/dashboard/current-organized/${userId}`, {}, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        console.log("[MyEvents] API response:", res.data);
        if (Array.isArray(res.data)) {
          // Fetch edit count for each event and merge into event object
          const eventsWithEditCount = await Promise.all(
            res.data.map(async (event: any) => {
              try {
                const token = localStorage.getItem("token");
                const editCountRes = await axios.get(
                  `http://localhost:5274/api/Events/editeventcount/${event.eventId}`,
                  { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
                // If API returns { editEventCount: number }, extract that
                const count = typeof editCountRes.data === 'object' && editCountRes.data !== null && 'editEventCount' in editCountRes.data
                  ? editCountRes.data.editEventCount
                  : editCountRes.data;
                return { ...event, editCount: count };
              } catch {
                return { ...event, editCount: undefined };
              }
            })
          );
          setEvents(eventsWithEditCount);
        } else {
          setEvents([]);
        }
      } catch (err: any) {
        setError("Failed to fetch your events");
        setEvents([]);
        console.error("[MyEvents] API error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyEvents();
  }, []);

  return (
    <div className="mx-5 mt-10">
      <h1 className="text-3xl font-bold mb-6">My Organized Events</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500">You have not organized any events yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event, idx) => (
            <EventCard
              event={event}
              key={event.eventId || idx}
              showActions={true}
              hideRegister={true}
              onDelete={async (eventId) => {
                try {
                  const token = localStorage.getItem("token");
                  await axios.delete(`http://localhost:5274/api/Events/${eventId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                  });
                  setEvents(prev => prev.filter(e => e.eventId !== eventId));
                } catch (err) {
                  alert("Failed to delete event");
                }
              }}
              onEdit={(event) => {
                // You can route to edit page or open a modal here
                window.location.href = `/event/${event.eventId}/edit-event`;
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
