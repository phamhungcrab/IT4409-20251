# ===== Build stage =====
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .

# restore + publish đúng project Web API
RUN dotnet restore "./OnlineExam/OnlineExam.csproj"
RUN dotnet publish "./OnlineExam/OnlineExam.csproj" -c Release -o /app/publish

# ===== Runtime stage =====
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render cấp PORT -> ASP.NET listen theo PORT đó
ENV ASPNETCORE_URLS=http://0.0.0.0:$PORT
ENV ASPNETCORE_ENVIRONMENT=Production

# chạy đúng dll của project API
ENTRYPOINT ["dotnet", "OnlineExam.dll"]
