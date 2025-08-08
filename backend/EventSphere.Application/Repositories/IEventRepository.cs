using System.Collections.Generic;
using System.Threading.Tasks;
using EventSphere.Domain.Entities;
using EventSphere.Application.Dtos;

namespace EventSphere.Application.Repositories
{
    public interface IEventRepository
    {
        Task<Event?> GetEventByIdAsync(int id);
        Task<IEnumerable<Event>> GetAllEventsAsync();
        Task AddEventAsync(Event ev);
        Task UpdateEventAsync(Event ev);
        Task DeleteEventAsync(int id);
        // Add more event-related methods as needed

        Task<int> GetRegistrationCountForEventAsync(int eventId);
        Task<IEnumerable<Event>> FilterEventsAsync(EventFilterDto filter);

        Task<Dictionary<int, int>> GetRegistrationCountsForEventsAsync(List<int> eventIds);

        Task<int?> GetEventEditCountAsync(int eventId);

        Task<List<int>> GetRegisteredEventIdsByUserIdAsync(int userId);


    }
}
