using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EventSphere.Application.Dtos;
using EventSphere.Application.Interfaces;
using EventSphere.Application.Repositories;
using EventSphere.Domain.Entities;
using EventSphere.Infrastructure.Repositories;

namespace EventSphere.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IEventRepository _eventRepository;


        public DashboardService(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;


        }

        public async Task<IEnumerable<EventCardDto>> GetCurrentOrganizedEventsAsync(int organizerId)
        {
            var events = (await _eventRepository.GetAllEventsAsync())
            .Where(e => e.OrganizerId == organizerId && e.IsCompleted == 0);

            var eventCardDtos = new List<EventCardDto>();

            foreach (var e in events)
            {
                var registrationCount = await _eventRepository.GetRegistrationCountForEventAsync(e.EventId);

                eventCardDtos.Add(new EventCardDto
                {
                    EventId = e.EventId,
                    Title = e.Title,
                    CoverImage = e.CoverImage,
                    Category = e.Category,
                    EventType = e.EventType,
                    Location = e.Location,
                    RegistrationDeadline = e.RegistrationDeadline,
                    EventStart = e.EventStart,
                    EventEnd = e.EventEnd,
                    Price = e.Price,
                    RegistrationCount = registrationCount
                });
            }

            return eventCardDtos;
        }

        public async Task<IEnumerable<EventCardDto>> GetPastOrganizedEventsAsync(int organizerId)
        {
            var events = (await _eventRepository.GetAllEventsAsync())
            .Where(e => e.OrganizerId == organizerId && e.IsCompleted == 1);

            var eventCardDtos = new List<EventCardDto>();

            foreach (var e in events)
            {
                var registrationCount = await _eventRepository.GetRegistrationCountForEventAsync(e.EventId);

                eventCardDtos.Add(new EventCardDto
                {
                    EventId = e.EventId,
                    Title = e.Title,
                    CoverImage = e.CoverImage,
                    Category = e.Category,
                    EventType = e.EventType,
                    Location = e.Location,
                    RegistrationDeadline = e.RegistrationDeadline,
                    EventStart = e.EventStart,
                    EventEnd = e.EventEnd,
                    Price = e.Price,
                    RegistrationCount = registrationCount
                });
            }

            return eventCardDtos;
        }

        public async Task<IEnumerable<EventCardDto>> GetCurrentAttendingEventsAsync(int userId)
{
    // 1. Get all event IDs user has registered for
    var registeredEventIds = await _eventRepository.GetRegisteredEventIdsByUserIdAsync(userId);

    // 2. Get full events and filter by IsCompleted == 0
    var events = (await _eventRepository.GetAllEventsAsync())
        .Where(e => registeredEventIds.Contains(e.EventId) && e.IsCompleted == 0);

    // 3. Create DTO list
    var eventCardDtos = new List<EventCardDto>();
    foreach (var e in events)
    {
        var registrationCount = await _eventRepository.GetRegistrationCountForEventAsync(e.EventId);

        eventCardDtos.Add(new EventCardDto
        {
            EventId = e.EventId,
            Title = e.Title,
            CoverImage = e.CoverImage,
            Category = e.Category,
            EventType = e.EventType,
            Location = e.Location,
            RegistrationDeadline = e.RegistrationDeadline,
            EventStart = e.EventStart,
            EventEnd = e.EventEnd,
            Price = e.Price,
            RegistrationCount = registrationCount
        });
    }

    return eventCardDtos;
}

public async Task<IEnumerable<EventCardDto>> GetPastAttendedEventsAsync(int userId)
{
    var registeredEventIds = await _eventRepository.GetRegisteredEventIdsByUserIdAsync(userId);

    var events = (await _eventRepository.GetAllEventsAsync())
        .Where(e => registeredEventIds.Contains(e.EventId) && e.IsCompleted == 1);

    var eventCardDtos = new List<EventCardDto>();
    foreach (var e in events)
    {
        var registrationCount = await _eventRepository.GetRegistrationCountForEventAsync(e.EventId);

        eventCardDtos.Add(new EventCardDto
        {
            EventId = e.EventId,
            Title = e.Title,
            CoverImage = e.CoverImage,
            Category = e.Category,
            EventType = e.EventType,
            Location = e.Location,
            RegistrationDeadline = e.RegistrationDeadline,
            EventStart = e.EventStart,
            EventEnd = e.EventEnd,
            Price = e.Price,
            RegistrationCount = registrationCount
        });
    }

    return eventCardDtos;
}



        
    }
}
