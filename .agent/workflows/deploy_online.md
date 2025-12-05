---
description: Deploy OnlineExam backend to a cloud host (Render) and use Swagger for API testing
---

# 🚀 Deploy OnlineExam Backend Online

## 1️⃣ Prepare the project
- **Pull the latest code** from the repository.
- Ensure the **.NET SDK** (or the runtime you use) is installed on the build machine.
- Verify the **connection strings** (SQL Server / MongoDB) are stored in environment variables, not hard‑coded.
- Enable **CORS** for the domain you will host (e.g., `https://myexamapp.com`).

## 2️⃣ Create a production configuration file
```json
// appsettings.Production.json
{
  "ConnectionStrings": {
    "Default": "Server=${DB_SERVER};Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASS};"
  },
  "AllowedHosts": "*",
  "Cors": {
    "Origins": ["https://myexamapp.com"]
  }
}
```
- Add this file to the project and **exclude it from source control** (add to `.gitignore`).
- In `Program.cs` load the configuration with `builder.Configuration.AddJsonFile("appsettings.Production.json", optional: true);`.

## 3️⃣ Containerise (Docker) – optional but recommended
Create a `Dockerfile` at the project root:
```Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["OnlineExamBe/OnlineExamBe.csproj", "OnlineExamBe/"]
RUN dotnet restore "OnlineExamBe/OnlineExamBe.csproj"
COPY . .
WORKDIR "/src/OnlineExamBe"
RUN dotnet build "OnlineExamBe.csproj" -c Release -o /app/build
RUN dotnet publish "OnlineExamBe.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "OnlineExamBe.dll"]
```
Build & push the image to a container registry (Docker Hub, GitHub Packages, etc.).

## 4️⃣ Deploy to Render (or any PaaS)
1. **Create a new Web Service** on Render and link the Git repository.
2. Choose **Docker** as the runtime (if you created a Dockerfile) or **.NET** if you prefer the native build.
3. Set the **environment variables** (`DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASS`).
4. Set the **Start Command** (for Docker it’s automatic; for .NET use `dotnet OnlineExamBe.dll`).
5. Enable **HTTPS** and add your custom domain.

## 5️⃣ Test the API with Swagger
- After deployment, open `https://<your‑service>.onrender.com/swagger/index.html`.
- Use the **Authorize** button to obtain a JWT (login via `/api/Auth/login`).
- Test each endpoint (Auth, Class, Exam, Result, etc.).
- If you need a client SDK, click **"Generate client"** in the top‑right of Swagger UI (choose C#, TypeScript, etc.).

## 6️⃣ What to change in API calls for production
| Area | Development | Production |
|------|-------------|------------|
| Base URL | `http://localhost:5000` | `https://<your‑service>.onrender.com` |
| JWT expiration | short (15 min) for testing | longer (1 h) + refresh token endpoint (`/api/Auth/refresh-token`) |
| CORS | `*` (allow all) | specific domain(s) |
| Logging | Console only | File + structured logging (Serilog) |

## 7️⃣ Ongoing maintenance
- **Monitor logs** on Render → *Logs* tab.
- Set up **health checks** (`/healthz`) to auto‑restart on failures.
- Keep **Swagger** up‑to‑date: any change in controllers automatically reflects after rebuilding.
- When adding new endpoints, add **summary/description** attributes so Swagger docs stay clear.

---
*This workflow gives you a clear path from local development to a live, cloud‑hosted API that you can interact with via the Swagger UI you just opened.*
