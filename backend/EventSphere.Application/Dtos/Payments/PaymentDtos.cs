namespace EventSphere.Application.Dtos.Payments
{

    public class PaymentRequestDto
    {
        public long EventId { get; set; }
        public int TicketCount { get; set; }
        public string UserId { get; set; } = string.Empty; // Add this if you want to track the user
    }

    public class PaymentResponseDto
    {
        public string ClientSecret { get; set; } = string.Empty;
    }
}
