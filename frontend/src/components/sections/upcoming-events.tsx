"use client";

import { useRef, useEffect, useState } from "react";
import debounce from "lodash/debounce";
import EventCard from "../cards/event-card";
import SwipeableCard from "../cards/swipable-card";
import EventsFilters from "./events-filter";
import axios from "axios";

export default function UpcommingEvents() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAmount = 200;
  const scrollInterval = 3000;

  const [isPaused, setIsPaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [filters, setFilters] = useState<{
    location: string;
    online: boolean | null;
    paid: "paid" | "free" | null;
    price?: "paid" | "free" | null;
    category: string;
    recurrence: string;
    recurrenceType?: string;
    eventType?: string;
  }>({
    location: "",
    online: null,
    paid: null,
    category: "",
    recurrence: "",
    eventType: ""
  });

  const [categories] = useState<string[]>(["Music", "Tech", "Health", "Education", "Business", "Conference", "Exhibitions","Others"]);
  // const recurrenceTypes = ["Onetime","Multiple"]; // Removed as recurrence options are now hardcoded in EventsFilters

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const progress =
          (container.scrollLeft /
            ((container.scrollWidth / 2) - container.offsetWidth)) *
          100;
        setScrollProgress(Math.min(progress, 100));
      }
    };

    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (ref) ref.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Fetch filtered events from backend when filters change, with debounce
  useEffect(() => {
    const fetchFilteredEvents = async () => {
      try {
        const res = await axios.post("http://localhost:5274/api/Home/filter", filters);
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setEvents(res.data.data);
        } else {
          setEvents([]);
        }
      } catch (err) {
        setEvents([]);
        console.error("Failed to fetch filtered events", err);
      }
    };
    const debouncedFetch = debounce(fetchFilteredEvents, 400);
    debouncedFetch();
    return () => debouncedFetch.cancel();
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
          // recurrenceTypes={recurrenceTypes} // Removed as recurrence options are now hardcoded in EventsFilters
          onlineOptions={["Online", "Offline"]}
          paidOptions={["Free", "Paid"]}
          onClearFilters={() => setFilters({
            location: "",
            online: null,
            paid: null,
            category: "",
            recurrence: "",
            eventType: ""
          })}
        />

        <div className="relative pl-3 w-full">
          {/* Mobile view */}
          <div className="block sm:hidden w-full flex items-center justify-center" style={{ minHeight: '100%' }}>
            <SwipeableCard
              items={[...filteredEvents, { __viewAll: true }]}
              render={event =>
                event.__viewAll ? (
                  <div className="flex items-center justify-center h-full min-h-[180px]">
                    <a
                      href="/upcoming-events"
                      className="flex items-center gap-1 px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg min-w-[220px] justify-center"
                      style={{ whiteSpace: "nowrap", height: "fit-content" }}
                    >
                      View All
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <EventCard event={event} />
                )
              }
            />
          </div>

          {/* Desktop/tablet view */}
          <div className="hidden sm:block relative">
            <div
              ref={scrollRef}
              className="flex gap-4 items-center overflow-x-auto scroll-smooth rounded-lg no-scrollbar px-2"
              style={{ scrollbarWidth: "none" }}
            >
              {filteredEvents.length === 0 ? (
                <div className="text-gray-500">No upcoming events found.</div>
              ) : (
                <>
                  {filteredEvents.map((event, index) => (
                    <div
                      className="flex-shrink-0"
                      key={index}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <EventCard event={event} />
                    </div>
                  ))}
                  {/* View All button at the end */}
                  <div className="flex-shrink-0 ml-4">
                    <a
                      href="/upcoming-events"
                      className="flex items-center gap-1 px-4 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg"
                      style={{ whiteSpace: "nowrap", height: "fit-content" }}
                    >
                      View All
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Scroll progress bar */}
          <div className="mt-2 h-1 w-full bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
