using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Auth;
using OnlineExam.Application.Interfaces.Websocket;
using OnlineExam.Application.Services;
using OnlineExam.Application.Services.Auth;
using OnlineExam.Application.Services.Base;
using OnlineExam.Application.Services.Websocket;
using OnlineExam.Application.Settings;
using OnlineExam.Domain.Entities;
using OnlineExam.Domain.Interfaces;
using OnlineExam.Infrastructure.Data;
using OnlineExam.Infrastructure.Repositories;
using OnlineExam.Middleware;
using System.Text;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Explicitly listen on HTTPS 7239 and HTTP 7238 (for plain WS during local dev)
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenLocalhost(7239, listenOptions =>
    {
        listenOptions.UseHttps();
    });
    options.ListenLocalhost(7238); // plain HTTP for ws://
});


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Session", new OpenApiSecurityScheme
    {
        Name = "Session",
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Description = "Session token header"
    });
    c.AddServer(new OpenApiServer
    {
        Url = "https://localhost:7239"

    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
         {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Session"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Đăng ký DbContext
builder.Services.AddDbContext<ExamSystemDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql =>
        {
            // Avoid timeout when generating/inserting QuestionExam/ExamStudent
            sql.CommandTimeout(120);
        }
    ));

//Gui email
builder.Services.AddMemoryCache();
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("Smtp"));

//session
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(option =>
{
    option.IdleTimeout = TimeSpan.FromMinutes(30);
    option.Cookie.IsEssential = true;
});
builder.Services.AddHttpContextAccessor();




builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped(typeof(ICrudService<>), typeof(CrudService<>));
builder.Services.AddScoped<IAuthService,AuthService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<IUserService,UserService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IExamBlueprintService, ExamBlueprintService>();
builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<IExamGradingService, ExamGradingService>();
builder.Services.AddSingleton<IExamAnswerCache, ExamAnswerCache>();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFE", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://it4409-20251-frontend.onrender.com") // Add your allowed origins
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Important for Session/Cookies if used, though token is usually Header 'Session'
    });
});

var app = builder.Build();

app.UseCors("AllowFE");

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseSwagger();
app.UseSwaggerUI();


app.UseWebSockets();

//app.UseMiddleware<SessionMiddleware>();

app.UseSession();

app.UseAuthentication();

app.UseAuthorization();

app.UseMiddleware<ExamWebSocketMiddleware>();

app.UseRouting();

app.MapControllers();

app.Run();
