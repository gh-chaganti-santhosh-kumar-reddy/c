"use client";



import { useEffect, useState } from "react";
import EventCard from "../../components/cards/eventCard";
import EventsFilters from "../../components/sections/EventsFilters";
import axios from "axios";

interface Filters {
  location: string;
  online: boolean | null;
  paid: boolean | null;
  category: string;
  recurrence: string;
  eventType?: string;
}


export default function UpcomingEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filters, setFilters] = useState<Filters>({
    location: "",
    online: null,
    paid: null,
    category: "",
    recurrence: "",
    eventType: "",
  });
  const [categories] = useState<string[]>(["Music", "Tech", "Health", "Education", "Business", "Conference", "Exhibitions", "Others"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // Fetch filtered events from backend when filters change
  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .post("http://localhost:5274/api/Home/filter", filters)
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setEvents(res.data.data);
        } else {
          setEvents([]);
          setError("No upcoming events found.");
        }
      })
      .catch(() => {
        setEvents([]);
        setError("Failed to fetch upcoming events.");
      })
      .finally(() => setLoading(false));
  }, [filters]);


  const filteredEvents = events;

  return (
    <div className="mx-5">
      <div className="mt-10 mb-2">
        <h1 className="text-3xl mt-2 mb-3 font-sans font-bold">Upcoming Events:</h1>
        {/* Filters */}
        <EventsFilters
          filters={filters}
          onChange={update => setFilters(prev => ({ ...prev, ...update }))}
          categories={categories}
          onlineOptions={["Online", "Offline"]}
          paidOptions={["Free", "Paid"]}
        />
        <div className="w-full mt-6">
          {loading ? (
            <div className="text-gray-500 p-8 text-center">Loading events...</div>
          ) : error ? (
            <div className="text-red-500 p-8 text-center">{error}</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-gray-500 p-8 text-center">No upcoming events found.</div>
          ) : (
            <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 items-start">
              {filteredEvents.map((event, idx) => (
                <div className="min-w-0" key={event.eventId || idx}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
