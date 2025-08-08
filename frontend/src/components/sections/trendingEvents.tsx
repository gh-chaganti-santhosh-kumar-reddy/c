"use client";
import { useRef, useEffect, useState } from "react";
import EventCard, { UpcomingEvent } from "../cards/eventCard";
import axios from "axios";
import SwipeableCard from "../cards/SwipeableCard";

export default function TrendingEvents() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAmount = 200;
  const scrollInterval = 3000;
  const [isPaused, setIsPaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch trending events from API
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("http://localhost:5274/api/Home/trending");
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setEvents(res.data.data);
        } else {
          setEvents([]);
          setError("No trending events found.");
        }
      } catch {
        setEvents([]);
        setError("Failed to fetch trending events.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // Auto-scroll removed for trending events

  // Scroll progress tracking (normalized to first half)
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

  return (
    <div className="mx-5">
      <div className="mt-10 mb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl mt-2 mb-3 font-sans font-bold">
            Trending Events:
          </h1>
        </div>
        <div className="relative pl-3 w-full">
          {/* Mobile view */}
          <div className="block sm:hidden w-full flex items-center justify-center">
            <SwipeableCard
              items={events}
              render={(event) => <EventCard event={event} />}
            />
          </div>
          {/* Desktop/tablet view */}
          <div className="hidden sm:block relative">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth rounded-lg no-scrollbar px-2"
              style={{ scrollbarWidth: "none" }}
            >
              {loading ? (
                <div className="text-gray-500 p-8">Loading events...</div>
              ) : error ? (
                <div className="text-red-500 p-8">{error}</div>
              ) : events.length === 0 ? (
                <div className="text-gray-500 p-8">No trending events found.</div>
              ) : (
                events.map((event, index) => (
                  <div
                    className="flex-shrink-0"
                    key={event.eventId + "-trending-" + index}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <EventCard event={event} />
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1 w-full bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
