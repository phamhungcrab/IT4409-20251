using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using OnlineExam.Application.Interfaces;
using OnlineExam.Application.Interfaces.Auth;
using OnlineExam.Application.Interfaces.PermissionFolder;
using OnlineExam.Application.Interfaces.PermissionService;
using OnlineExam.Application.Interfaces.Websocket;
using OnlineExam.Application.Services;
using OnlineExam.Application.Services.Auth;
using OnlineExam.Application.Services.Base;
using OnlineExam.Application.Services.PermissionFolder;
using OnlineExam.Application.Services.PermissionService;
using OnlineExam.Application.Services.Websocket;
using OnlineExam.Application.Settings;
using OnlineExam.Domain.Interfaces;
using OnlineExam.Infrastructure.Data;
using OnlineExam.Infrastructure.Policy.Handlers;
using OnlineExam.Infrastructure.Repositories;
using OnlineExam.Middleware;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
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
        Url = builder.Environment.IsDevelopment()
        ? "https://localhost:7239"
        : "https://it4409-20251.onrender.com"
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


builder.Services.AddSingleton<IAuthorizationHandler, InClassAuthorizationHandler>();
builder.Services.AddSingleton<IAuthorizationHandler, IsUserAuthorizationHandler>();
builder.Services.AddSingleton<IAuthorizationHandler, IsUserIdAuthorizationHandler>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped(typeof(ICrudService<>), typeof(CrudService<>));
builder.Services.AddScoped<IAuthService,AuthService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<IUserService,UserService>();
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IGroupPermissionService, GroupPermissionService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IUserPermissionService, UserPermissionService>();
builder.Services.AddScoped<IAboutService, AboutService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IExamBlueprintService, ExamBlueprintService>();
builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<IExamGradingService, ExamGradingService>();
builder.Services.AddSingleton<IExamAnswerCache, ExamAnswerCache>();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://www.manhhangmobile.store",
            "https://manhhangmobile.store",      // Development frontend
            "https://it4409-fe.vercel.app",   // Production frontend
            "https://adminexam-6c6ff.web.app"

            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseSwagger();
app.UseSwaggerUI();


app.UseHttpsRedirection();

app.UseWebSockets();

app.UseRouting();

app.UseCors("AllowFrontend");

app.UseMiddleware<SessionMiddleware>();

app.UseSession();

app.UseAuthentication();

app.UseAuthorization();

app.UseMiddleware<ExamWebSocketMiddleware>();

app.MapControllers();

app.Run();
