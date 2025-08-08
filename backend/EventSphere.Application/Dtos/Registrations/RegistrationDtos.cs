using System;

namespace EventSphere.Application.Dtos.Registrations
{
    public class RegistrationDto
    {
        public int Id { get; set; }
        public long EventId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int TicketCount { get; set; }
        public string? PaymentIntentId { get; set; }
        public DateTime RegisteredAt { get; set; }
    }

    public class RegistrationRequestDto
    {
        public long EventId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int TicketCount { get; set; }
        public string? PaymentIntentId { get; set; }
    }
}
