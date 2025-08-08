namespace EventSphere.Application.Dtos.Payments
{
    public class CheckoutSessionRequestDto
    {
        public long EventId { get; set; }
        public int TicketCount { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? SuccessUrl { get; set; }
        public string? CancelUrl { get; set; }
        public string? Currency { get; set; }
    }

    public class CheckoutSessionResponseDto
    {
        public string Url { get; set; } = string.Empty;
    }
}
