using System.Threading.Tasks;
using EventSphere.Application.Dtos.Payments;
using Microsoft.Extensions.Configuration;
using Stripe;
using Stripe.Checkout;
using backend.Data; // Add this for AppDbContext

namespace EventSphere.Infrastructure.Repositories
{
    public class PaymentRepository : EventSphere.Application.Repositories.IPaymentRepository
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _dbContext;

        public PaymentRepository(IConfiguration configuration, AppDbContext dbContext)
        {
            _configuration = configuration;
            _dbContext = dbContext;
        }

        public async Task<PaymentResponseDto> CreatePaymentIntentAsync(PaymentRequestDto request)
        {
            var eventDetails = await _dbContext.Events.FindAsync((int)request.EventId);
            if (eventDetails == null)
                throw new KeyNotFoundException($"Event with ID {request.EventId} not found.");
            var correctAmount = eventDetails.Price * request.TicketCount;

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(correctAmount * 100), // Convert to paise/cents
                Currency = "inr",
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                },
                Metadata = new Dictionary<string, string>
                {
                    { "userId", request.UserId },
                    { "eventId", request.EventId.ToString() },
                    { "ticketCount", request.TicketCount.ToString() }
                }
            };

            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);

            return new PaymentResponseDto { ClientSecret = paymentIntent.ClientSecret };
        }

        public async Task<CheckoutSessionResponseDto> CreateCheckoutSessionAsync(CheckoutSessionRequestDto request)
        {
            var eventDetails = await _dbContext.Events.FindAsync((int)request.EventId);
            if (eventDetails == null)
                throw new KeyNotFoundException($"Event with ID {request.EventId} not found.");

            if (eventDetails.Price == null)
                throw new InvalidOperationException($"Event with ID {request.EventId} does not have a valid price.");
            var correctAmount = eventDetails.Price.Value * request.TicketCount;

            // Ensure SuccessUrl and CancelUrl are valid URLs
            string successUrl = string.IsNullOrWhiteSpace(request.SuccessUrl) ? "http://localhost:3000/payment-success" : request.SuccessUrl;
            string cancelUrl = string.IsNullOrWhiteSpace(request.CancelUrl) ? "http://localhost:3000/payment-cancel" : request.CancelUrl;

            // Diagnostic: throw if URLs are not valid
            if (!successUrl.StartsWith("http://") && !successUrl.StartsWith("https://"))
                throw new InvalidOperationException($"SuccessUrl is invalid: '{successUrl}'");
            if (!cancelUrl.StartsWith("http://") && !cancelUrl.StartsWith("https://"))
                throw new InvalidOperationException($"CancelUrl is invalid: '{cancelUrl}'");

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = request.Currency ?? "inr",
                            UnitAmount = (long)(correctAmount * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "Event Registration"
                            }
                        },
                        Quantity = 1
                    }
                },
                Mode = "payment",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                Metadata = new Dictionary<string, string>
                {
                    { "userId", request.UserId },
                    { "eventId", request.EventId.ToString() },
                    { "ticketCount", request.TicketCount.ToString() }
                }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);

            return new CheckoutSessionResponseDto { Url = session.Url };
        }
    }
}
