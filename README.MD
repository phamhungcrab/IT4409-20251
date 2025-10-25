Online Examination System
Welcome to the Online Examination System – a full‑stack platform for creating, managing and conducting exams over the web. It provides role‑based access for administrators, teachers and students, and supports automated scoring, real‑time monitoring and rigorous audit logging. The solution is built with React on the frontend, ASP.NET Core Web API with SignalR on the backend, and SQL Server as the database.
This README describes the project structure, features, setup and deployment instructions so that contributors can quickly get started.
Table of Contents
1.	Project Features
2.	Folder Structure
3.	Database Schema & SQL
4.	Installation
5.	Running Locally
6.	Deployment
7.	Contributing
8.	Security Notes
9.	License
Project Features
The system is designed to support the following capabilities, satisfying both functional and non‑functional requirements documented in the design specification:
•	Role‑Based Access: Separate interfaces and permissions for ADMIN, TEACHER, STUDENT roles.
•	User Management: Administrators can create/modify users, assign roles, manage subjects and classes.
•	Question Bank: Teachers can create, update and delete questions of type single choice, multiple choice and essay. Options and correct answers are stored in a structured and queryable way, with import/export support.
•	Exam Lifecycle: Teachers create exams with start and end times (UTC), assign questions, randomize question and option order per student, and publish when ready. Questions are snapshotted at publish time to ensure immutability.
•	Student Examination Flow: Students authenticate, start assigned exams, receive a materialized set of questions (with per‑student randomization). A server‑authoritative timer runs via SignalR; responses are auto‑saved and automatically submitted on timeout.
•	Grading & Results: Objective questions are auto‑graded with optional partial scoring for multiple choice; essays are manually graded. Scores combine into a final result, which can be viewed and exported.
•	Real‑Time Monitoring: Teachers monitor live participants, view progress and remaining time, and broadcast announcements to a class or exam via SignalR.
•	Audit Logging: Critical actions (publishing an exam, grading, account changes) are captured in an immutable audit table for traceability. Timestamps are stored in UTC and time‑zone conversions occur in the application layer[1].
•	Performance & Scalability: The system targets p95 API response times under 250 ms (excellent according to industry benchmarks[2]), supports 100–300 concurrent examinees per room, and uses database normalization (3NF) to reduce redundancy[3].
•	Security: Passwords are hashed using modern algorithms (Argon2id or bcrypt with work factors ≥10) and salted[4]. Transport uses HTTPS/WSS and CORS whitelisting; secrets are provided via environment variables.
Folder Structure
The repository follows a monorepo layout. At the top level you will find separate folders for the backend API, frontend client, database scripts and documentation. A .gitignore file ensures that secrets, compiled binaries and other transient files are excluded from version control.
├── api/                          # ASP.NET Core Web API
│   ├── Controllers/              # API controllers (auth, users, exams, results...)
│   ├── Data/                     # DbContext, entity configurations, seeds
│   ├── Hubs/                     # SignalR hubs for timer, announcements, monitoring
│   ├── Models/                   # Entity classes, DTOs
│   ├── Services/                 # Business logic, grading, randomization
│   ├── Migrations/               # EF Core migration files
│   ├── Program.cs                # Entry point and services registration
│   ├── appsettings.json          # Non‑secret configuration (connection names, logging)
│   └── ...
├── client/                       # React single‑page application
│   ├── public/                   # Static files and HTML template
│   ├── src/
│   │   ├── components/           # Reusable UI components (forms, tables, timer)
│   │   ├── pages/                # Route pages (login, dashboard, exam room, admin)
│   │   ├── hooks/                # Custom React hooks (auth, API, timer)
│   │   ├── services/             # API client wrappers, authentication helpers
│   │   ├── i18n/                 # Localization files (ready for internationalization)
│   │   └── index.tsx            # Frontend entry point
│   ├── package.json              # Frontend dependencies and scripts
│   └── ...
├── db/
│   ├── schema.sql                # SQL script to create tables, indexes, constraints
│   ├── seed.sql                  # Optional: insert sample data for development/testing
│   └── README.md                 # Notes on using the SQL scripts
├── docs/
│   ├── design/                   # Design agent outputs: glossary, ERD, logical schema
│   ├── contracts/                # Policies for randomization, timing, grading, retention
│   ├── evidence/                 # Evidence ledger and artefacts (see Evidence.md)
│   ├── report.pdf                # Comprehensive report (10–20 pages)
│   └── rubric_matrix.md          # Mapping of rubric criteria to deliverables
├── tests/
│   ├── api/                      # Unit and integration tests for backend
│   ├── client/                   # Unit tests for frontend components
│   └── load/                     # Load and performance tests
├── .github/
│   └── workflows/               # CI/CD pipeline definitions (GitHub Actions)
├── .env.example                  # Example environment variables (copy to .env)
├── .gitignore                    # Ignore build outputs, secrets, environment files
├── docker-compose.yml            # Development environment (API, SQL Server, client)
├── README.md                     # You are reading it!
└── LICENSE                       # Project license (e.g., MIT)
Important Files
•	db/schema.sql – Contains the SQL DDL statements to create the relational database schema, including tables, indexes, foreign key constraints and enumerations. You can import this file directly into SQL Server if you prefer not to use EF Core migrations. It follows third normal form to eliminate redundancy[3].
•	docker-compose.yml – Defines services for the API, client and SQL Server. Running docker compose up spins up a complete local environment.
•	.env.example – Template for setting environment variables (database connection string, JWT secret, CORS origins). Copy to .env and fill in the values.
•	.gitignore – Lists files and patterns to exclude from version control: bin/, obj/, node_modules/, .env, compiled artifacts, log files, etc.
Database Schema & SQL
The database schema is designed around the domain glossary defined in the design document. Key entities include User, Subject, Class, Question, Option, Exam, QuestionExam (snapshotted question assignments), ExamStudent (exam assignment per student), StudentQuestion (per‑student randomization and answers), Score, Announcement and AuditEvent. Relationships are enforced via foreign keys, and enumerations such as user roles, question types and exam statuses are implemented using lookup tables or CHECK constraints.
All date/time columns use datetime2(3) and store values in UTC[1]. Passwords are hashed with modern algorithms (Argon2id or bcrypt) and salted[4]. The schema includes indexes on hot paths (e.g., lookups by user, exam, class) to meet performance targets (p95 < 250 ms[2]).
To create the database using the SQL script:
# Ensure SQL Server is running (see docker compose instructions)
# Use sqlcmd or your preferred client to run the script
sqlcmd -S localhost -U sa -P <YourStrong@Passw0rd> -d master -i db/schema.sql

# Optionally seed data
sqlcmd -S localhost -U sa -P <YourStrong@Passw0rd> -d OnlineExamDb -i db/seed.sql
Alternatively, you can let EF Core migrations create the schema automatically when the API starts. The migrations are located in the api/Migrations folder.
Installation
Prerequisites
•	Node.js (≥ 18) and npm or yarn – for the React client.
•	.NET SDK (≥ 8.0) – for the backend API.
•	SQL Server 2019/2022 or Docker (to run SQL Server in a container).
•	Git – to clone the repository.
Clone the Repository
git clone https://github.com/your-username/online-examination-system.git
cd online-examination-system
Configure Environment Variables
Copy the example environment file and edit the values:
cp .env.example .env

# Edit .env in your editor of choice and set:
# - DATABASE_CONNECTION_STRING (e.g., "Server=localhost,1433;Database=OnlineExamDb;User Id=sa;Password=YourStrong@Passw0rd;")
# - JWT_SECRET (random long string)
# - ALLOWED_ORIGINS (comma‑separated list of frontend URLs)
# - SIGNALR_BACKPLANE (optional; e.g., Redis connection string when scaling out)
Install Dependencies
# Backend dependencies
cd api
dotnet restore
cd ..

# Frontend dependencies
cd client
npm install  # or yarn install
cd ..
Running Locally
There are two ways to run the system locally: using Docker (recommended) or running each component manually.
Option 1: Docker Compose
Use the provided docker-compose.yml to spin up SQL Server, API and frontend simultaneously:
docker compose up
The services will be available at:
•	API – https://localhost:5001 (Swagger at /swagger)
•	Frontend – https://localhost:3000
•	SQL Server – Port 1433 (credentials defined in .env or compose file)
To tear down the environment:
docker compose down
Option 2: Manual Startup
If you prefer to run services individually:
1.	Start SQL Server (locally installed or in Docker).
2.	Apply migrations or import db/schema.sql.
3.	Start the backend API:
cd api
dotnet run
1.	In a separate terminal, start the frontend:
cd client
npm start  # or yarn start
The application will be accessible at the URLs shown above.
Deployment
For production deployment you should:
1.	Build Docker Images – Create images for the API and client:
# Build API image
docker build -t online-exam-api:latest ./api

# Build client image
docker build -t online-exam-client:latest ./client
1.	Push Images – Push to a container registry (e.g., Docker Hub, GitHub Packages, Azure Container Registry).
2.	Provision Infrastructure – Choose a cloud provider (DigitalOcean, Azure, AWS). Create a managed SQL Server instance or use Azure SQL/Database for PostgreSQL. Configure VM or container service to host API and client.
3.	Secure Traffic – Use a reverse proxy (e.g., Nginx, Traefik) with TLS certificates to serve the API and client over HTTPS. Configure WSS for SignalR and restrict allowed origins.
4.	Configure Secrets – Store connection strings, JWT secret and other sensitive data in a secret manager (Azure Key Vault, AWS Secrets Manager). Do not commit secrets to version control.
5.	CI/CD – Use GitHub Actions (see .github/workflows/) to automate build and deployment. The pipeline can build images, run tests, and deploy to your target environment when a pull request is merged into main.
6.	Monitoring & Scaling – Enable application logging and monitoring. Use horizontal scaling (e.g., Azure Web App scale‑out or Kubernetes with a Redis backplane for SignalR) to support more concurrent examinees. Keep p95 latency under 250 ms by adding indexes and caching hot queries[2].
Contributing
Contributions are welcome! Please follow these guidelines:
•	Fork the repository and create a feature branch (git checkout -b feature/your-feature).
•	Write descriptive commit messages and open a pull request against the main branch. Each PR must be reviewed by at least one other contributor.
•	Do not commit secrets, .env files or compiled artifacts. Ensure .gitignore filters out these items.
•	Run dotnet test and frontend unit tests before submitting your PR.
•	Update documentation (design docs, policies, README) if your changes affect architecture or data models.
Security Notes
•	Password Handling – Passwords are hashed using Argon2id or bcrypt with a work factor of at least 10 and salted[4]. Do not log raw passwords or store them in plain text.
•	Timestamps – All times are stored in UTC and converted to local time at the client; this prevents ambiguity across time zones[1].
•	Data Privacy – Personally identifiable information (PII) such as email addresses and student codes should be encrypted or masked when logged. Audit logs record user actions without exposing sensitive data.
•	Secrets Management – Place secrets in environment variables or a secret manager; never commit them to the repository. The .env.example file documents required variables without values.
License
This project is licensed under the MIT License – see the LICENSE file for details.
________________________________________
[1] Dates and Times in SQL Server: AT TIME ZONE
https://dzone.com/articles/dates-and-times-in-sql-server-at-time-zone
[2] Odown Blog | API Response Time Standards: What's Good, Bad, and Unacceptable
https://odown.com/blog/api-response-time-standards/
[3] Database normalization description - Microsoft 365 Apps | Microsoft Learn
https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/access/database-normalization-description
[4] Password Storage - OWASP Cheat Sheet Series
https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html


PHẠM NGỌC HƯNG 20235342

online-examination-system/
├── api/                                  # ASP.NET Core Web API
│   ├── Controllers/                      # REST controllers
│   │   ├── AuthController.cs             # Login, refresh tokens
│   │   ├── UsersController.cs            # CRUD users, roles
│   │   ├── SubjectsController.cs         # CRUD subjects
│   │   ├── ClassesController.cs          # CRUD classes and student assignments
│   │   ├── QuestionsController.cs        # CRUD questions and options
│   │   ├── ExamsController.cs            # Exam creation, assignment, publish
│   │   ├── ExamSessionController.cs      # Start exam, autosave, submit
│   │   ├── ResultsController.cs          # Retrieve results, export reports
│   │   ├── MonitoringController.cs       # Real‑time monitoring endpoints
│   │   └── AnnouncementsController.cs    # Broadcast announcements
│   ├── Hubs/                             # SignalR hubs
│   │   ├── ExamHub.cs                    # Hub for per‑exam timer and events
│   │   └── MonitoringHub.cs              # Live dashboard updates
│   ├── Models/                           # Domain entities and DTOs
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Role.cs                   # Enum mapping for Admin/Teacher/Student
│   │   │   ├── Subject.cs
│   │   │   ├── Class.cs
│   │   │   ├── Question.cs
│   │   │   ├── Option.cs
│   │   │   ├── Exam.cs
│   │   │   ├── QuestionExam.cs           # Snapshotted question assignments
│   │   │   ├── ExamStudent.cs            # Student–exam assignment & status
│   │   │   ├── StudentQuestion.cs        # Per‑student randomization & answers
│   │   │   ├── Answer.cs                 # Stores answer content (structured)
│   │   │   ├── Score.cs                  # Records auto/manual grading per student
│   │   │   ├── Announcement.cs
│   │   │   └── AuditEvent.cs             # Audit logs of critical actions
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequest.cs
│   │   │   │   ├── LoginResponse.cs
│   │   │   │   └── RefreshTokenRequest.cs
│   │   │   ├── User/
│   │   │   │   ├── CreateUserRequest.cs
│   │   │   │   └── UserResponse.cs
│   │   │   ├── Question/
│   │   │   │   ├── CreateQuestionRequest.cs
│   │   │   │   └── QuestionResponse.cs
│   │   │   ├── Exam/
│   │   │   │   ├── CreateExamRequest.cs
│   │   │   │   ├── PublishExamRequest.cs
│   │   │   │   └── ExamResponse.cs
│   │   │   ├── ExamSession/
│   │   │   │   ├── StartExamRequest.cs
│   │   │   │   ├── SaveAnswerRequest.cs
│   │   │   │   └── SubmitExamRequest.cs
│   │   │   └── Result/
│   │   │       ├── GradeRequest.cs
│   │   │       └── ResultResponse.cs
│   │   └── Enumerations/
│   │       ├── QuestionType.cs
│   │       ├── ExamStatus.cs             # InProgress, Completed, Expired
│   │       └── MultiChoiceScoringPolicy.cs
│   ├── Services/                         # Business logic
│   │   ├── Interfaces/
│   │   │   ├── IAuthService.cs
│   │   │   ├── IQuestionService.cs
│   │   │   ├── IExamService.cs
│   │   │   ├── IGradingService.cs
│   │   │   ├── IMonitoringService.cs
│   │   │   └── IAuditService.cs
│   │   ├── AuthService.cs
│   │   ├── QuestionService.cs
│   │   ├── ExamService.cs
│   │   ├── GradingService.cs
│   │   ├── MonitoringService.cs
│   │   └── AuditService.cs
│   ├── Data/                             # EF Core context and configurations
│   │   ├── ApplicationDbContext.cs
│   │   ├── Configurations/
│   │   │   ├── UserConfiguration.cs
│   │   │   ├── SubjectConfiguration.cs
│   │   │   ├── ClassConfiguration.cs
│   │   │   ├── QuestionConfiguration.cs
│   │   │   ├── OptionConfiguration.cs
│   │   │   ├── ExamConfiguration.cs
│   │   │   ├── QuestionExamConfiguration.cs
│   │   │   ├── ExamStudentConfiguration.cs
│   │   │   ├── StudentQuestionConfiguration.cs
│   │   │   ├── AnswerConfiguration.cs
│   │   │   ├── ScoreConfiguration.cs
│   │   │   ├── AnnouncementConfiguration.cs
│   │   │   └── AuditEventConfiguration.cs
│   │   └── SeedData.cs                   # Initial seed data for dev environment
│   ├── Migrations/                       # EF migrations (auto‑generated)
│   │   └── 20251024_InitialCreate.cs
│   ├── Helpers/
│   │   ├── PasswordHasher.cs             # Use Argon2id/bcrypt
│   │   ├── RandomizationHelper.cs        # Question/option shuffling
│   │   └── PartialScoringHelper.cs       # Multi‑choice scoring logic
│   ├── Middleware/
│   │   ├── ExceptionMiddleware.cs        # Global error handling
│   │   └── AuditMiddleware.cs            # Records audit events
│   ├── Program.cs                        # WebApplication builder (minimal API)
│   ├── appsettings.json                  # Non‑secret config (connection names)
│   ├── appsettings.Development.json
│   └── api.csproj
├── client/                               # React SPA
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── routes.tsx                    # Route definitions
│   │   ├── components/
│   │   │   ├── Layout.tsx                # Common page layout
│   │   │   ├── Sidebar.tsx               # Navigation menu
│   │   │   ├── Timer.tsx                 # Exam countdown timer
│   │   │   ├── QuestionCard.tsx          # Renders question & options
│   │   │   ├── OptionList.tsx
│   │   │   ├── ResultTable.tsx
│   │   │   └── AnnouncementBanner.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ExamListPage.tsx
│   │   │   ├── ExamRoomPage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts                # Authentication & JWT handling
│   │   │   ├── useApi.ts                 # Axios wrapper with interceptors
│   │   │   ├── useExam.ts                # Manages exam state and autosave
│   │   │   ├── useTimer.ts               # Timer logic (SignalR integration)
│   │   │   └── useAnnouncements.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── questionService.ts
│   │   │   ├── examService.ts
│   │   │   ├── resultService.ts
│   │   │   └── monitoringService.ts
│   │   ├── i18n/
│   │   │   └── en.json                   # Default language file
│   │   ├── styles/
│   │   │   └── Tailwind.config.js        # Or your chosen CSS framework config
│   │   └── utils/
│   │       ├── validateInputs.ts         # Form validation helpers
│   │       └── formatting.ts             # Date/time formatting, UTC→local
│   ├── .eslintrc.js
│   ├── tsconfig.json
│   ├── vite.config.ts                    # Or webpack configuration
│   ├── package.json
│   └── yarn.lock or package-lock.json
├── db/
│   ├── schema.sql                        # SQL DDL for creating the database schema
│   ├── seed.sql                          # Inserts sample subjects, classes, users, questions
│   └── README.md                         # Instructions on running the SQL scripts
├── docs/
│   ├── design/
│   │   ├── glossary.md                   # Domain glossary definitions
│   │   ├── erd.mmd                       # Mermaid ER diagram
│   │   ├── logical_schema.md             # Table definitions, constraints, indexes
│   │   └── rationale.md                  # Design rationale and trade‑offs
│   ├── contracts/
│   │   ├── randomization.md
│   │   ├── snapshot_policy.md
│   │   ├── grading_policy.md
│   │   ├── timing_policy.md
│   │   ├── security_policy.md
│   │   └── retention_policy.md
│   ├── evidence/
│   │   ├── Evidence.md                   # Evidence ledger template
│   │   └── screenshots/                  # Collected screenshots for rubric proof
│   ├── report.pdf                        # Final project report (10–20 pages)
│   └── rubric_matrix.md                  # Mapping of rubric items to deliverables
├── tests/
│   ├── api/
│   │   ├── AuthControllerTests.cs
│   │   ├── ExamsControllerTests.cs
│   │   ├── ResultsControllerTests.cs
│   │   ├── GradingServiceTests.cs
│   │   ├── MonitoringHubTests.cs
│   │   └── TestFixtures/
│   │       └── TestDbContextFactory.cs
│   ├── client/
│   │   ├── pages/
│   │   │   ├── LoginPage.test.tsx
│   │   │   ├── ExamListPage.test.tsx
│   │   │   └── ExamRoomPage.test.tsx
│   │   ├── components/
│   │   │   ├── Timer.test.tsx
│   │   │   ├── QuestionCard.test.tsx
│   │   │   └── ResultTable.test.tsx
│   │   └── hooks/
│   │       └── useTimer.test.ts
│   ├── load/
│   │   └── load_test.js                  # k6 or JMeter script for performance testing
│   └── README.md                         # How to run the tests
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Build, test and lint for every PR
│       └── cd.yml                        # Optional: deploy to cloud on merge to main
├── .env.example                          # Template for environment variables
├── .gitignore                            # Specifies files not to commit (bin/, obj/, node_modules/, .env, etc.)
├── docker-compose.yml                    # Compose services: API, client, SQL Server
├── LICENSE                               # Choose MIT, Apache‑2.0 or similar
└── README.md                             # Project overview and setup instructions (already written)



note:
- .NET > 6.0 https://dotnet.microsoft.com/en-us/download


