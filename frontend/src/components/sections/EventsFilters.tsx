import React from "react";


interface EventsFiltersProps {
  filters: {
    location: string;
    online: boolean | null;
    paid: "paid" | "free" | null;
    price?: "paid" | "free" | null;
    category: string;
    recurrence: string;
    recurrenceType?: string;
    eventType?: string;
  };
  onChange: (filters: Partial<EventsFiltersProps["filters"]>) => void;
  categories: string[];
  eventTypes?: string[];
  locations?: string[];
  paidOptions?: string[];
  onlineOptions?: string[];
}


export default function EventsFilters({ filters, onChange, categories, eventTypes, locations, paidOptions, onlineOptions }: EventsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-center justify-center">
      {/* Location Filter (hidden if online is selected) */}
      {filters.online !== true && (
        locations && locations.length > 0 ? (
          <select
            value={filters.location}
            onChange={e => onChange({ location: e.target.value })}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="">Location</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={e => onChange({ location: e.target.value })}
            className="border rounded px-3 py-1 text-sm"
          />
        )
      )}

      {/* Online/Offline Filter */}
      {onlineOptions && onlineOptions.length > 0 ? (
        <select
          value={filters.online === null ? "" : filters.online ? "online" : "offline"}
          onChange={e => {
            const val = e.target.value;
            if (val === "online" || val === "offline") {
              onChange({ online: val === "online", eventType: val });
            } else {
              onChange({ online: null, eventType: "" });
            }
          }}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="">Online/Offline</option>
          {onlineOptions.map(opt => (
            <option key={opt} value={opt.toLowerCase()}>{opt}</option>
          ))}
        </select>
      ) : null}

      {/* Free/Paid Filter */}
      {paidOptions && paidOptions.length > 0 ? (
        <select
          value={filters.paid || ""}
          onChange={e => {
            const val = e.target.value;
            if (val === "paid" || val === "free") {
              // Send as 'price' to match backend API
              onChange({ price: val, paid: val });
            } else {
              onChange({ price: null, paid: null });
            }
          }}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="">free/paid</option>
          <option value="free">free</option>
          <option value="paid">paid</option>
        </select>
      ) : null}

      {/* Category Filter */}
      <select
        value={filters.category}
          onChange={e => {
            console.log("EventsFilters onChange called: category", e.target.value);
            onChange({ category: e.target.value });
          }}
        className="border rounded px-3 py-1 text-sm"
      >
        <option value="">Category</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Event Type Filter */}
      {eventTypes && eventTypes.length > 0 && (
        <select
          value={filters.eventType || ""}
          onChange={e => {
            console.log("EventsFilters onChange called: eventType", e.target.value);
            onChange({ eventType: e.target.value });
          }}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="">Event Type</option>
          {eventTypes && eventTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      )}

      {/* Recurrence Type Filter */}
      <select
        value={filters.recurrence}
        onChange={e => {
          const val = e.target.value;
          if (val === "onetime" || val === "multiple") {
            onChange({ recurrence: val, recurrenceType: val });
          } else {
            onChange({ recurrence: "", recurrenceType: "" });
          }
        }}
        className="border rounded px-3 py-1 text-sm"
      >
        <option value="">None</option>
        <option value="onetime">onetime</option>
        <option value="multiple">multiple</option>
      </select>
    </div>
  );
}
