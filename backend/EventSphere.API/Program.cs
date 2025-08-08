// Set Stripe API key globally
// Register PaymentService for dependency injection
using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using backend.Config;
using EventSphere.Infrastructure.Repositories;

using backend.Middleware;
using EventSphere.Application.Repositories;

var builder = WebApplication.CreateBuilder(args);
// Add CORS policy for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins(
                "http://localhost:3000", // Next.js default
                "http://localhost:5173"  // Vite/React default
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    );
});
builder.Services.AddScoped<EventSphere.Application.Interfaces.IPaymentService, EventSphere.Application.Services.PaymentService>();

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});
// Register DashboardService for DI
builder.Services.AddScoped<IBookmarkRepository, BookmarkRepository>();
builder.Services.AddScoped<EventSphere.Application.Interfaces.IBookmarkService, backend.Services.BookmarkService>();

builder.Services.AddScoped<EventSphere.Application.Interfaces.IDashboardService, EventSphere.Application.Services.DashboardService>();

// If your implementation is HomeService:
builder.Services.AddScoped<backend.Interfaces.IHomeService, backend.Services.HomeService>();

// Add JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        var jwtKey = builder.Configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 16)
            throw new InvalidOperationException("JWT key is missing or too short. Set a strong key (min 16 chars) in configuration.");
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtKey!))
        };
    });

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connectionString));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseInMemoryDatabase("EventSphereDb"));
}
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<backend.Interfaces.IEventService, backend.Services.EventService>();


// Register repositories for DI
builder.Services.AddScoped<EventSphere.Application.Repositories.IAuthRepository, EventSphere.Infrastructure.Repositories.AuthRepository>();
builder.Services.AddScoped<EventSphere.Application.Repositories.IEventRepository, EventSphere.Infrastructure.Repositories.EventRepository>();
builder.Services.AddScoped<EventSphere.Application.Interfaces.IDashboardService, EventSphere.Application.Services.DashboardService>();
builder.Services.AddScoped<EventSphere.Application.Repositories.IPaymentRepository, EventSphere.Infrastructure.Repositories.PaymentRepository>();

builder.Services.AddHostedService<HourlyEventCompletionService>();

// Set Stripe API key globally after builder is created and before app is built
var stripeSecretKey = builder.Configuration["Stripe:SecretKey"];
Stripe.StripeConfiguration.ApiKey = stripeSecretKey;


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

// Serve files from wwwroot
app.UseStaticFiles();

// Serve /uploads/* from wwwroot/uploads

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", "uploads")),
    RequestPath = "/uploads",
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "http://localhost:3000");
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
    }
});


// Register middlewares in recommended order
app.UseErrorHandlingMiddleware();
app.UseLoggingMiddleware();
app.UsePerformanceLoggingMiddleware();
app.UseRateLimitingMiddleware();
app.UseRequestValidationMiddleware();
app.UseJwtMiddleware();
app.UseResponseFormattingMiddleware();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
