"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const EventLivePreview = dynamic(() => import("@/components/event-live-preview"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5274";

const mapEventData = (data: any) => {
  // Support both { data: event } and plain event object
  const event = data && typeof data === 'object' && data.data ? data.data : data;
  const arr = (v: any) => Array.isArray(v) ? v : v ? [v] : [];
  // Speakers
  const speakers = arr(event.speakers).map((s: any) => {
    let photoPath = s.photoUrl || '';
    if (photoPath && !photoPath.startsWith('/')) photoPath = '/' + photoPath;
    if (photoPath.startsWith('/wwwroot/')) photoPath = photoPath.replace('/wwwroot', '');
    return {
      name: s.name || '',
      bio: s.bio || '',
      photoUrl: photoPath,
      image: null,
      imagePreview: photoPath ? `${API_URL}${photoPath}` : '',
    };
  });
  // FAQs
  let faqs: { question: string; answer: string }[] = [];
  if (Array.isArray(event.faqs)) {
    faqs = event.faqs.map((f: any) => ({
      question: f.question || '',
      answer: f.answer || '',
    }));
  } else if (event.faqs && typeof event.faqs === 'object') {
    faqs = [{
      question: event.faqs.question || '',
      answer: event.faqs.answer || '',
    }];
  }
  // Cover image
  let coverPath = event.coverImage || '';
  if (coverPath && !coverPath.startsWith('/')) coverPath = '/' + coverPath;
  if (coverPath.startsWith('/wwwroot/')) coverPath = coverPath.replace('/wwwroot', '');
  if (!coverPath.startsWith('/uploads/covers/') && coverPath) {
    coverPath = coverPath.replace(/^\/+/,'').replace(/^uploads\/covers\//,'');
    coverPath = '/uploads/covers/' + coverPath;
  }
  const coverImageUrl = coverPath ? `${API_URL}${coverPath}` : '';
  // Vibe video
  let vibePath = event.vibeVideoUrl || '';
  if (vibePath && !vibePath.startsWith('/')) vibePath = '/' + vibePath;
  if (vibePath.startsWith('/wwwroot/')) vibePath = vibePath.replace('/wwwroot', '');
  const vibeVideoUrl = vibePath ? `${API_URL}${vibePath}` : '';
  // Description image src fix (use same logic as EventLivePreview)
  function processDescriptionHtml(html: string | undefined): string {
    if (!html) return '<span style="color:#bbb">[Description]</span>';
    return html.replace(
      /<img([^>]+)src=['"](?!(?:https?:|data:))\/?(uploads|wwwroot\/uploads)?\/?([^'">]+)['"]/gi,
      (
        match: string,
        pre: string,
        folder: string,
        path: string
      ) => {
        let cleanPath = path.replace(/^wwwroot\//, '').replace(/^uploads\//, '');
        return `<img${pre}src="${API_URL}/uploads/${cleanPath}"`;
      }
    );
  }
  let description = processDescriptionHtml(event.description || '');
  // Return mapped event
  return {
    ...event,
    speakers,
    faqs,
    coverImageUrl,
    vibeVideoUrl,
    description,
    isPaid: event.isPaid ?? event.isPaidEvent ?? false,
    price: event.price ?? event.ticketPrice ?? 0,
  };
};

const ViewEventPage = () => {
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id ?? null;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    fetch(`${API_URL}/api/events/${eventId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch event");
        return res.json();
      })
      .then((data) => {
        setEvent(mapEventData(data));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-indigo-100">
        <div className="p-8 text-center text-lg font-semibold text-gray-700 bg-white/80 rounded-xl shadow-lg border border-orange-100 animate-pulse">
          Loading event details...
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-indigo-100">
        <div className="p-8 text-center text-lg font-semibold text-red-600 bg-white/80 rounded-xl shadow-lg border border-red-100">
          {error}
        </div>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-indigo-100">
        <div className="p-8 text-center text-lg font-semibold text-gray-500 bg-white/80 rounded-xl shadow-lg border border-gray-100">
          No event found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-indigo-100 py-6 px-0 flex flex-col items-center">
      <div
        className="w-full"
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <div
          className="w-full rounded-3xl shadow-2xl border border-orange-100/60 bg-white/70 backdrop-blur-md p-0 md:p-2 lg:p-6 transition-all duration-300 hover:shadow-[0_8px_40px_#f59e4299]"
          style={{
            boxShadow: '0 8px 40px 0 rgba(80, 80, 120, 0.10), 0 1.5px 8px 0 #f59e4299',
          }}
        >
          <EventLivePreview event={event} />
        </div>
      </div>
    </div>
  );
};

export default ViewEventPage;