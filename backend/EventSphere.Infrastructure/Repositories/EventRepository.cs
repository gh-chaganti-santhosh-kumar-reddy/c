using System.Collections.Generic;
using System.Threading.Tasks;
using EventSphere.Application.Repositories;
using EventSphere.Domain.Entities;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using EventSphere.Application.Dtos;
using EventSphere.Domain.Enums;


namespace EventSphere.Infrastructure.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly AppDbContext _context;
        public EventRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Event?> GetEventByIdAsync(int id)
        {
            return await _context.Events
                .Include(e => e.Speakers)
                .Include(e => e.Occurrences)
                .Include(e => e.Faqs)
                .Include(e => e.Media)
                .FirstOrDefaultAsync(e => e.EventId == id);
        }

        public async Task<IEnumerable<Event>> GetAllEventsAsync()
        {
            return await _context.Events
                .Include(e => e.Speakers)
                .Include(e => e.Occurrences)
                .ToListAsync();
        }

        public async Task AddEventAsync(Event ev)
        {
            _context.Events.Add(ev);
            // Explicitly add EventMedia to context to guarantee persistence
            if (ev.Media != null)
            {
                foreach (var media in ev.Media)
                {
                    _context.EventMedias.Add(media);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task UpdateEventAsync(Event ev)
        {
            // --- Update Occurrences: Remove all and re-add new, resetting OccurrenceId ---
            if (ev.Occurrences != null)
            {
                var existingOccurrences = _context.EventOccurrences.Where(o => o.EventId == ev.EventId);
                _context.EventOccurrences.RemoveRange(existingOccurrences);
                foreach (var occ in ev.Occurrences)
                {
                    occ.EventId = ev.EventId;
                    occ.OccurrenceId = 0; // Prevent identity insert error
                    _context.EventOccurrences.Add(occ);
                }
            }

            // --- Update Speakers ---
            if (ev.Speakers != null)
            {
                var existingSpeakers = _context.EventSpeakers.Where(s => s.EventId == ev.EventId);
                _context.EventSpeakers.RemoveRange(existingSpeakers);
                foreach (var speaker in ev.Speakers)
                {
                    speaker.EventId = ev.EventId;
                    speaker.SpeakerId = 0; // Prevent identity insert error
                    _context.EventSpeakers.Add(speaker);
                }
            }

            // --- Update FAQs ---
            if (ev.Faqs != null)
            {
                var existingFaqs = _context.EventFaqs.Where(f => f.EventId == ev.EventId);
                _context.EventFaqs.RemoveRange(existingFaqs);
                foreach (var faq in ev.Faqs)
                {
                    faq.EventId = ev.EventId;
                    faq.FaqId = 0; // Prevent identity insert error
                    _context.EventFaqs.Add(faq);
                }
            }

            _context.Events.Update(ev);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteEventAsync(int id)
        {
            var ev = await _context.Events.FindAsync(id);
            if (ev != null)
            {
                _context.Events.Remove(ev);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> GetRegistrationCountForEventAsync(int eventId)
        {
            return await _context.Registration.CountAsync(r => r.EventId == eventId);
        }

        public async Task<IEnumerable<Event>> FilterEventsAsync(EventFilterDto filter)
        {
            var query = _context.Events.AsQueryable();

            if (!string.IsNullOrEmpty(filter.Location))
            {
                var pattern = $"%{filter.Location.ToLower()}%";
                query = query.Where(e => EF.Functions.Like((e.Location ?? "").ToLower(), pattern));
            }

            if (!string.IsNullOrEmpty(filter.Price))
            {
                if (filter.Price.Equals("free", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(e => e.Price == 0 || e.Price == null);
                }
                else if (filter.Price.Equals("paid", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(e => e.Price > 0);
                }
            }

            if (filter.Date.HasValue)
                query = query.Where(e => filter.Date.Value >= e.EventStart && filter.Date.Value <= e.EventEnd);

            if (!string.IsNullOrEmpty(filter.Category))
            {
                var standardCategories = new List<string>
    {
        "Music", "Tech", "Health", "Education", "Business", "Conference", "Exhibitions"
    };

                if (filter.Category.Equals("others", StringComparison.OrdinalIgnoreCase))
                {
                    // Return all events whose category is NOT in the standard set
                    query = query.Where(e => e.Category != null && !standardCategories.Contains(e.Category));
                }
                else
                {
                    // Return events matching the given category
                    query = query.Where(e => e.Category == filter.Category);
                }
            }

            if (!string.IsNullOrEmpty(filter.RecurrenceType))
            {
                if (filter.RecurrenceType.Equals("onetime", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(e => e.RecurrenceType == "None");
                }
                else if (filter.RecurrenceType.Equals("multiple", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(e => e.RecurrenceType != null && e.RecurrenceType != "None");
                }
                else
                {
                    query = query.Where(e => e.RecurrenceType == filter.RecurrenceType);
                }
            }

            if (!string.IsNullOrEmpty(filter.EventType))
            {
            if (filter.EventType.Equals("online", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(e => e.EventType == EventSphere.Domain.Enums.EventType.Online);
            }
            else if (filter.EventType.Equals("offline", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(e => e.EventType != EventSphere.Domain.Enums.EventType.Online);
            }
            }
            return await query
                .Include(e => e.Speakers)
                .Include(e => e.Occurrences)
                .ToListAsync();
        }

        public async Task<Dictionary<int, int>> GetRegistrationCountsForEventsAsync(List<int> eventIds)
        {
            return await _context.Registration
                .Where(r => eventIds.Contains(r.EventId))
                .GroupBy(r => r.EventId)
                .Select(g => new
                {
                    EventId = g.Key,
                    Count = g.Count()
                })
                .ToDictionaryAsync(g => g.EventId, g => g.Count);
        }

        public async Task<int?> GetEventEditCountAsync(int eventId)
        {
            return await _context.Events
                .Where(e => e.EventId == eventId)
                .Select(e => (int?)e.EditEventCount)
                .FirstOrDefaultAsync();
        }
        
        public async Task<List<int>> GetRegisteredEventIdsByUserIdAsync(int userId)
{
    return await _context.Registration
        .Where(r => r.UserId == userId)
        .Select(r => r.EventId)
        .Distinct()
        .ToListAsync();
}



    }
}
