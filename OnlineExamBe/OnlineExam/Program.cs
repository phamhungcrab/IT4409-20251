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

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
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
        builder.Configuration.GetConnectionString("DefaultConnection")
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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    
}

app.UseHttpsRedirection();

app.UseWebSockets();

app.UseMiddleware<SessionMiddleware>();

app.UseSession();

app.UseAuthentication();

app.UseAuthorization();

app.UseMiddleware<ExamWebSocketMiddleware>();

app.UseRouting();

app.MapControllers();

app.Run();
