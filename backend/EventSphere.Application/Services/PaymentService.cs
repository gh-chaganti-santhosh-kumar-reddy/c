using System.Threading.Tasks;
using EventSphere.Application.Dtos.Payments;
using Microsoft.Extensions.Configuration;
using EventSphere.Application.Interfaces;
using Stripe;

namespace EventSphere.Application.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly EventSphere.Application.Repositories.IPaymentRepository _paymentRepository;

        public PaymentService(EventSphere.Application.Repositories.IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }

        public async Task<PaymentResponseDto> CreatePaymentIntentAsync(PaymentRequestDto request)
        {
            return await _paymentRepository.CreatePaymentIntentAsync(request);
        }

        public async Task<CheckoutSessionResponseDto> CreateCheckoutSessionAsync(CheckoutSessionRequestDto request)
        {
            return await _paymentRepository.CreateCheckoutSessionAsync(request);
        }
    }
}
