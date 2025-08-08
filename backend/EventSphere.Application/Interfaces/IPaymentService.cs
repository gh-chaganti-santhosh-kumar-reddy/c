using System.Threading.Tasks;
using EventSphere.Application.Dtos.Payments;

namespace EventSphere.Application.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto> CreatePaymentIntentAsync(PaymentRequestDto request);
        Task<CheckoutSessionResponseDto> CreateCheckoutSessionAsync(CheckoutSessionRequestDto request);
    }
}
