using Microsoft.AspNetCore.Mvc;
using EventSphere.Application.Dtos.Payments;
using EventSphere.Application.Interfaces;
using Microsoft.Extensions.Configuration;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("create-payment-intent")]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] PaymentRequestDto request)
    {
        if (request == null)
            return BadRequest(new { success = false, message = "Invalid payment request." });

        var response = await _paymentService.CreatePaymentIntentAsync(request);
        return Ok(new { clientSecret = response.ClientSecret });
    }

    [HttpPost("create-checkout-session")]
    public async Task<IActionResult> CreateCheckoutSession([FromBody] CheckoutSessionRequestDto request)
    {
        // Remove request.Amount check, since amount is now calculated on backend
        if (request == null || request.EventId <= 0 || request.TicketCount <= 0)
            return BadRequest(new { success = false, message = "Invalid checkout session request." });

        // Ensure SuccessUrl and CancelUrl are valid URLs
        if (string.IsNullOrWhiteSpace(request.SuccessUrl))
            request.SuccessUrl = "http://localhost:3000/payment-success";
        if (string.IsNullOrWhiteSpace(request.CancelUrl))
            request.CancelUrl = "http://localhost:3000/payment-cancel";

        var response = await _paymentService.CreateCheckoutSessionAsync(request);
        return Ok(new { url = response.Url });
    }
}
