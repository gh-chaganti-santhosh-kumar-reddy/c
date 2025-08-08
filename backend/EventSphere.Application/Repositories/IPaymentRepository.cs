using System.Threading.Tasks;
using EventSphere.Application.Dtos.Payments;

namespace EventSphere.Application.Repositories
{
    public interface IPaymentRepository
    {
        Task<PaymentResponseDto> CreatePaymentIntentAsync(PaymentRequestDto request);
        Task<CheckoutSessionResponseDto> CreateCheckoutSessionAsync(CheckoutSessionRequestDto request);
    }
}
