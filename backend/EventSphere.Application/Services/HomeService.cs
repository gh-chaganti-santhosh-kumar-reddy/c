using EventSphere.Domain.Enums;
using backend.Interfaces;
using EventSphere.Domain.Entities;
using EventSphere.Application.Dtos;
using EventSphere.Application.Dtos.Events;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using EventSphere.Application.Repositories;
using EventSphere.Application.Helpers;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;

namespace backend.Services
{
    public class HomeService : IHomeService
    {

        private readonly IEventRepository _eventRepository;
        private readonly ILogger<HomeService> _logger;

        public HomeService(IEventRepository eventRepository, ILogger<HomeService> logger)
        {
            _eventRepository = eventRepository;
            _logger = logger;
        }

        public async Task<IEnumerable<EventCardDto>> GetUpcomingEventsAsync()
        {
            var now = DateTime.UtcNow;
            var events = (await _eventRepository.GetAllEventsAsync())
                .Where(e => e.EventStart >= now)
                .OrderBy(e => e.EventStart)
                .ToList();

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

        public async Task<IEnumerable<EventCardDto>> GetTrendingEventsAsync()
        {
            var now = DateTime.UtcNow;
            var events = (await _eventRepository.GetAllEventsAsync())
                .Where(e => e.EventStart >= now)
                .ToList();

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

            // Sort by registration count descending
            return eventCardDtos.OrderByDescending(e => e.RegistrationCount).ToList();
        }

        public async Task<IEnumerable<EventCardDto>> FilterEventsAsync(EventFilterDto filter)
        {
            var events = await _eventRepository.FilterEventsAsync(filter);

            var now = DateTime.UtcNow;
            events = events
                .Where(e => e.EventStart >= now)
                .OrderBy(e => e.EventStart)
                .ToList();


            var eventIds = events.Select(e => e.EventId).ToList();
            var registrationCountsDict = await _eventRepository.GetRegistrationCountsForEventsAsync(eventIds);

            return events.Select(e => new EventCardDto
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
                RegistrationCount = registrationCountsDict.TryGetValue(e.EventId, out var count) ? count : 0
            }).ToList();
        }



    }
}