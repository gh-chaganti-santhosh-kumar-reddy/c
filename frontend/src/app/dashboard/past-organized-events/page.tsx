"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "@/components/cards/eventCard";

export default function PastOrganizedEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      let userId = null;
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          userId = userObj.userId || userObj.id || userObj.UserId || userObj.Id;
        } catch {}
      }
      if (userId && token) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5274"}/api/Dashboard/past-organized/${userId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = res.data;
          setEvents(Array.isArray(data) ? data : []);
        } catch {
          setEvents([]);
        }
      } else {
        setEvents([]);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {events.length === 0 ? (
        <div className="col-span-full text-center text-gray-500">No past organized events found.</div>
      ) : (
        events.map(event => (
          <EventCard key={event.eventId} event={event} hideRegister={true} hideLive={true} />
        ))
      )}
    </div>
  );
}
