"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaRegBookmark, FaBookmark } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { FaRegClock } from "react-icons/fa";


interface EventCardProps {
  event: any;
  showActions?: boolean;
  onDelete?: (eventId: string) => void;
  onEdit?: (event: any) => void;
  hideRegister?: boolean;
  isBookmarked?: boolean;
  onBookmarkToggle?: (event: any, isBookmarked: boolean) => void;
  hideLive?: boolean;
}

export default function EventCard({ event, showActions = false, onDelete, onEdit, hideRegister = false, onBookmarkToggle, hideLive = false }: EventCardProps): React.JSX.Element {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Fetch bookmark status for this event on mount
  useEffect(() => {
    async function fetchBookmarkStatus() {
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
        setIsBookmarked(false);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5274/api/Bookmarks/bookmarked-events/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = res.data;
        if (Array.isArray(data)) {
          setIsBookmarked(data.some((e: any) => e.eventId === event.eventId));
        } else {
          setIsBookmarked(false);
        }
      } catch {
        setIsBookmarked(false);
      }
    }
    fetchBookmarkStatus();
    // Only run on mount or if eventId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.eventId]);

  // Handler for bookmark toggle
  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    const token = localStorage.getItem("token");
    try {
      const userRaw = localStorage.getItem("user");
      let userId = null;
      if (userRaw) {
        try {
          const userObj = JSON.parse(userRaw);
          userId = userObj.userId || userObj.id || userObj.UserId || userObj.Id;
        } catch {}
      }
      if (isBookmarked) {
        // Remove bookmark (send userId as query param)
        await axios.delete(`http://localhost:5274/api/Bookmarks/delete/${event.eventId}?userId=${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setIsBookmarked(false);
        if (typeof onBookmarkToggle === 'function') {
          onBookmarkToggle(event, true);
        }
      } else {
        // Add bookmark
        await axios.post(
          `http://localhost:5274/api/Bookmarks/add`,
          { eventId: event.eventId, userId },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setIsBookmarked(true);
      }
    } catch {
      alert(isBookmarked ? "Failed to remove bookmark" : "Failed to add bookmark");
    } finally {
      setBookmarkLoading(false);
    }
  };
  // Debug: log editCount and event
  if (showActions) {
    // Only log for cards with actions (My Events page)
    // eslint-disable-next-line no-console
    console.log('[EventCard] eventId:', event.eventId, 'editCount:', event.editCount, 'event:', event);
  }
  // Registration deadline (assume event.registrationDeadline is ISO string)
  const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
  // Use event data, fallback to defaults if missing
  // Removed carousel state, always show first image
  // Helper to ensure image URLs are absolute for backend-served images
  const toAbsoluteUrl = (url: string) => {
    if (!url) return "/images/card-top.jpg";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/uploads/")) return `http://localhost:5274${url}`;
    return url;
  };

  // If event has Media (array), use first image, else fallback
  const images = event?.media && event.media.length > 0
    ? event.media.filter((m: any) => m.mediaType === "Image").map((m: any) => toAbsoluteUrl(m.mediaUrl))
    : [toAbsoluteUrl(event.coverImage)];
  // Show 'Online' if event is online, otherwise show location or 'Venue'
  let location = "";
  if (event.eventType === "Online" || event.eventType === 0) {
    location = "Online";
  } else if (event.location && event.location.trim() !== "") {
    location = event.location;
  } else {
    location = "Venue";
  }
  // Show Paid if price > 0, else Free
  const type = event.price && event.price > 0 ? "Paid" : "Free";
  const registrations = event.registrations?.length || 0;
  const title = event.title || "Untitled Event";
  const eventStart = event.eventStart ? new Date(event.eventStart) : null;
  const eventEnd = event.eventEnd ? new Date(event.eventEnd) : null;
  const date = eventStart ? eventStart.toLocaleDateString() : "TBA";
  // Calculate duration in hours (rounded to 1 decimal)
  let duration = null;
  if (eventStart && eventEnd) {
    const diffMs = eventEnd.getTime() - eventStart.getTime();
    if (diffMs > 0) {
      duration = (diffMs / (1000 * 60 * 60)).toFixed(1); // hours
    }
  }

  // Recurrence label for display
  let recurrenceLabel = "";
  if (event.recurrenceType) {
    if (event.recurrenceType.toLowerCase() === "one-time") recurrenceLabel = "Once";
    else if (event.recurrenceType.toLowerCase() === "multiple") recurrenceLabel = "Multiple";
    else recurrenceLabel = event.recurrenceType;
  }
  const eventId = event.eventId;
  const shareUrl = `https://eventsphere.com/event/${eventId || 1}`;
  const shareText = encodeURIComponent(`Check out this event: ${title}`);
  // const audience = event.audience || "General";

  // Removed auto-scrolling carousel logic

  return (
    <div className="relative">
      <Link
        href={`/event/${eventId}/view-event`}
        className="block group focus:outline-none focus:ring-2 focus:ring-blue-400"
        tabIndex={0}
      >
        <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl overflow-hidden mx-auto p-4 mb-2 flex flex-col min-w-[220px] max-w-[340px] w-full h-[360px] sm:min-w-[220px] sm:max-w-[340px] sm:w-full sm:h-[420px] md:w-[300px] md:min-w-[300px] md:max-w-[300px] md:h-[420px] event-card-responsive">
        {/* Glow background */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl opacity-60 z-0" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl opacity-50 z-0" />
        {/* Responsive handled by Tailwind classes above. For <400px, parent should use flex-nowrap and overflow-x-auto. */}

        <div className="relative z-10 flex flex-col h-full">
          {/* Image Carousel */}
          <div className="relative w-full h-36 lg:h-44 rounded-2xl overflow-hidden flex-shrink-0">
            <Image
              src={images[0]}
              alt="Event Image"
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>

          {/* Location/Online & Type */}
          <div className="flex items-center mt-2">
            <div className="flex text-xs font-sans items-center max-w-[140px] flex-shrink-0">
              <Image src="/icons/location.png" alt="Location" width={13} height={13} />
              <span
                className="ml-1 w-[110px] overflow-hidden text-ellipsis whitespace-nowrap inline-block align-middle"
                title={location}
              >
                {location}
              </span>
            </div>
            <div className="mx-2">|</div>
            <div className="flex text-xs font-sans items-center">
              <Image src="/icons/save-money.png" alt="Type" width={13} height={13} />
              <span className="ml-1">{type}</span>
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center justify-between mb-1 lg:mb-2">
            <h4
              className="text-lg lg:text-xl font-semibold max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap block"
              title={title}
            >
              {title}
            </h4>
          <button
            type="button"
            className={"hover:scale-110 transition-transform cursor-pointer bg-transparent border-none p-0"}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this event"}
            onClick={handleBookmarkToggle}
            disabled={bookmarkLoading}
          >
            {isBookmarked ? (
              <FaBookmark size={22} color="#06b6d4" style={bookmarkLoading ? { opacity: 0.5 } : {}} />
            ) : (
              <FaRegBookmark size={22} color="#64748b" style={bookmarkLoading ? { opacity: 0.5 } : {}} />
            )}
          </button>
          </div>

          {/* Date, Start Time & Duration */}
          <div className="flex flex-col gap-1 lg:mb-1">
            <div className="flex gap-2 items-center font-bold text-xs">
              <Image src="/icons/calendar.png" alt="Date" width={15} height={20} />
              <span>
                {eventStart ? eventStart.toLocaleDateString() : "TBA"}
                {eventStart && (
                  <>
                    {" "}
                    <span className="text-gray-500">{eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {duration && (
                        <span className="text-gray-400 ml-1">({duration} hr{Number(duration) !== 1 ? 's' : ''})</span>
                      )}
                    </span>
                  </>
                )}
              </span>
            </div>
            {/* Registration Deadline */}
            {registrationDeadline && (
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-red-400">
                <FaRegClock className="text-red-400" size={15} />
                <span>
                  {registrationDeadline.toLocaleDateString()} {registrationDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          {/* Registration info (centered vertically for all screens) */}
          <div className="text-sm flex items-center gap-2 mb-1">
            <span className="text-blue-600 text-xs font-bold">{registrations}</span>{" "}
            <span className="text-xs">registrations</span>
            {!hideLive && (
              <span
                className="inline-flex items-center px-0.5 py-0.5 bg-red-500 text-xs rounded animate-pulse text-white font-bold"
                title="Live registration count"
              >
                <span className="w-1 h-1 bg-white rounded-full mr-1" />
                LIVE
              </span>
            )}
          </div>

          {/* Category, Recurrence & Share */}
          <div className="flex justify-between items-center text-sm mb-2 lg:mb-4">
            <div className="flex gap-2 text-xs items-center">
              <Image src="/icons/businessman.png" alt="Category" width={20} height={20} />
              {event.category && (
                <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded text-xs font-semibold text-gray-700" title={event.category}>
                  {event.category}
                </span>
              )}
              {recurrenceLabel && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 rounded text-xs font-semibold text-blue-700" title={recurrenceLabel}>
                  {recurrenceLabel}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`, '_blank', 'noopener,noreferrer');
              }}
              className="hover:scale-110 transition-transform cursor-pointer"
              aria-label="Share event on Twitter"
            >
              <Image src="/icons/send.png" alt="Share" width={16} height={20} />
            </button>
          </div>

          {/* Register Button and Actions */}
          <div className="flex flex-col items-center gap-2 mt-2">
            {!hideRegister && (
              <span
                className="bg-gradient-to-r text-xs lg:text-sm from-purple-500 to-blue-500 py-1 px-3 lg:py-2 lg:px-6 rounded-full shadow-md hover:from-purple-600 hover:to-blue-600 transition cursor-pointer select-none font-semibold tracking-wide"
                aria-label="Register for event"
              >
                Register Now
              </span>
            )}
            {showActions && (
              <div className="flex gap-2 mt-1">
                {/* Edit (Pencil) Button */}
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded-full text-xs font-semibold text-yellow-800 shadow border border-yellow-300 transition focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  title="Edit Event"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onEdit) onEdit(event);
                  }}
                >
                  <FaEdit className="h-4 w-4" />
                  <span>Edit</span>
                  {/* Show edits left if available (number or numeric string) */}
                  {((typeof event.editCount === 'number' && !isNaN(event.editCount)) || (typeof event.editCount === 'string' && !isNaN(Number(event.editCount)))) && (
                    <span className="ml-2 px-2 py-0.5 bg-white border border-yellow-300 rounded text-yellow-700 font-bold text-xs" title="Edits left">
                      {event.editCount} left
                    </span>
                  )}
                </button>
                {/* Delete Button */}
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-full text-xs font-semibold text-red-800 shadow border border-red-300 transition focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
                  title="Delete Event"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this event?')) {
                      if (onDelete) onDelete(eventId);
                    }
                  }}
                >
                  <FaTrash className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </Link>
    </div>
  );
}