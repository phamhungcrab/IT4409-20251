---Lệnh update database
Scaffold-DbContext "Server=34.92.183.10;Database=ExamSystemDB;User Id=sqlserver;Password=121233;TrustServerCertificate=True;MultipleActiveResultSets=true" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Entities -StartupProject "OnlineExam" -f -UseDatabaseNames -NoPluralize -Context CoreProjectContext

