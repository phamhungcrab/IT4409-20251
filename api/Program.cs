using Api.Data;
using Api.Helpers;
using Api.Middleware;
using Api.Services;
using Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure EF Core with SQL Server.  The connection string is
// defined in appsettings.json.  Replace with your own server
// settings as necessary.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<PasswordHasher>();

// Register business services for dependency injection
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<IGradingService, GradingService>();
builder.Services.AddScoped<IMonitoringService, MonitoringService>();
builder.Services.AddScoped<IAuditService, AuditService>();

// Add SignalR for real-time communication
builder.Services.AddSignalR();

// Configure CORS to allow the React client during development
builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientPolicy", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetValue<string>("FrontendUrl") ?? "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add Swagger for API documentation in development
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();

// Global exception handling
app.UseMiddleware<ExceptionMiddleware>();

// Use CORS policy
app.UseCors("ClientPolicy");

// Authentication and authorization would go here (e.g., JWT)
// app.UseAuthentication();
app.UseAuthorization();

// Audit logging should occur after the request is processed
app.UseMiddleware<AuditMiddleware>();

app.MapControllers();

// Map SignalR hubs
app.MapHub<Api.Hubs.ExamHub>("/examHub");
app.MapHub<Api.Hubs.MonitoringHub>("/monitoringHub");

app.Run();