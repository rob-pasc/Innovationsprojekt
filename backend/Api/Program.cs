using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
using Api.Application.Repositories;
using Api.Application.Services.AuthService;
using Api.Application.Services.RecoveryService;
using Api.Application.Services.GameService;
using Api.Domain.Entities;
using Api.Infrastructure;
using Api.Infrastructure.Persistence;
using Api.Infrastructure.Repositories;

// ────────────────────────────────────────────────────────────────────────────
// 1. LOAD ENVIRONMENT VARIABLES
// ────────────────────────────────────────────────────────────────────────────
try
{
    Env.Load();
    Console.WriteLine("✓ Loaded .env file");
}
catch (Exception ex)
{
    Console.WriteLine($"⚠ Warning: Error loading .env file: {ex.Message}");
}

var builder = WebApplication.CreateBuilder(args);

// ────────────────────────────────────────────────────────────────────────────
// 2. GET CONFIGURATION FROM ENVIRONMENT
// ────────────────────────────────────────────────────────────────────────────
var dbHost = Environment.GetEnvironmentVariable("DB_HOST")
    ?? throw new InvalidOperationException("DB_HOST environment variable not found");
var dbPort = Environment.GetEnvironmentVariable("DB_PORT") 
    ?? "5432";
var dbName = Environment.GetEnvironmentVariable("DB_NAME")
    ?? throw new InvalidOperationException("DB_NAME environment variable not found");
var dbUser = Environment.GetEnvironmentVariable("DB_USER")
    ?? throw new InvalidOperationException("DB_USER environment variable not found");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD")
    ?? throw new InvalidOperationException("DB_PASSWORD environment variable not found");
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
    ?? throw new InvalidOperationException("JWT_SECRET environment variable not found");

// Build connection string with timeout for remote databases
// Timeout=30 gives 30 seconds before timing out (default is 15)
var connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPassword};SSL Mode=Require;Timeout=30;";

Console.WriteLine($"\n═══════════════════════════════════════════════════════");
Console.WriteLine($"📡 Database Configuration");
Console.WriteLine($"═══════════════════════════════════════════════════════");
Console.WriteLine($"  Host: {dbHost}");
Console.WriteLine($"  Port: {dbPort}");
Console.WriteLine($"  Database: {dbName}");
Console.WriteLine($"  User: {dbUser}");
Console.WriteLine($"  JWT_SECRET: {jwtSecret.Length} characters");
Console.WriteLine($"  Connection Timeout: 30 seconds");
Console.WriteLine($"═══════════════════════════════════════════════════════\n");

// ────────────────────────────────────────────────────────────────────────────
// 3. CONFIGURE SERVICES
// ────────────────────────────────────────────────────────────────────────────
// Add DbContext with PostgreSQL
builder.Services.AddDbContext<InnovationsprojektDbContext>(options =>
    options.UseNpgsql(connectionString)
);
Console.WriteLine("✓ Configured DbContext with PostgreSQL");

// Add ASP.NET Core Identity with Role Support
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password Policy
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;

    // User Policy
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = false;
    options.SignIn.RequireConfirmedPhoneNumber = false;

    // Lockout Policy
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
})
.AddEntityFrameworkStores<InnovationsprojektDbContext>()
.AddDefaultTokenProviders();

Console.WriteLine("✓ Configured ASP.NET Core Identity");

// Add Authentication with JWT Bearer
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var key = Encoding.ASCII.GetBytes(jwtSecret);
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        RequireExpirationTime = true,
        ClockSkew = TimeSpan.Zero
    };
});

Console.WriteLine("✓ Configured JWT Authentication");

// Add Authorization
builder.Services.AddAuthorization();

// Add Custom Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IRecoveryService, RecoveryService>();
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<IPhishingAttemptRepository, PhishingAttemptRepository>();

Console.WriteLine("✓ Registered custom services (ITokenService, IAuthService)");

// Add Controllers
builder.Services.AddControllers();

// Add CORS
// B7 (known issue): AllowAnyOrigin is intentionally wide for local development.
// Before production, replace with .WithOrigins("https://your-frontend-domain.com")
// to prevent cross-origin requests from untrusted sources.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", corsBuilder =>
        corsBuilder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader());
});

Console.WriteLine("✓ Configured CORS\n");

// ────────────────────────────────────────────────────────────────────────────
// 4. BUILD APPLICATION
// ────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ────────────────────────────────────────────────────────────────────────────
// 5. CONFIGURE MIDDLEWARE PIPELINE
// ────────────────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Order matters: Authentication before Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

Console.WriteLine("✓ Configured middleware pipeline");

// ────────────────────────────────────────────────────────────────────────────
// 6. INITIALIZE DATABASE AND SEED DATA
// ────────────────────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<InnovationsprojektDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        Console.WriteLine("\n═══════════════════════════════════════════════════════");
        Console.WriteLine("📊 Database Initialization");
        Console.WriteLine("═══════════════════════════════════════════════════════");

        // Test database connection first
        Console.WriteLine("  Attempting to connect to database...");
        await context.Database.OpenConnectionAsync();
        Console.WriteLine("  ✓ Database connection successful!");

        // Run migrations
        Console.WriteLine("  Applying database migrations...");
        await context.Database.MigrateAsync();
        Console.WriteLine("  ✓ Migrations completed");

        // Seed initial data
        Console.WriteLine("  Seeding database with roles and test users...");
        await SeedDB.Initialize(userManager, roleManager);
        Console.WriteLine("  ✓ Database seeded");

        Console.WriteLine("═══════════════════════════════════════════════════════\n");
    }
    catch (TimeoutException timeoutEx)
    {
        Console.WriteLine($"\n✗ TIMEOUT ERROR: {timeoutEx.Message}");
        Console.WriteLine($"✗ Unable to connect to database at {dbHost}:{dbPort}");
        Console.WriteLine($"✗ Check that:");
        Console.WriteLine($"    - Database host is correct");
        Console.WriteLine($"    - Database is running and accessible");
        Console.WriteLine($"    - Network connection allows outbound to port 5432");
        Console.WriteLine($"    - Credentials are correct\n");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"\n✗ ERROR during database initialization:");
        Console.WriteLine($"  Message: {ex.Message}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"  Inner: {ex.InnerException.Message}");
        }
        Console.WriteLine($"\n  The app will start but database may not be available.\n");
    }
}

Console.WriteLine("═══════════════════════════════════════════════════════");
Console.WriteLine("🚀 Application Starting");
Console.WriteLine("═══════════════════════════════════════════════════════");
Console.WriteLine($"  Environment: {app.Environment.EnvironmentName}");
Console.WriteLine($"  Listening on: http://localhost:{Environment.GetEnvironmentVariable("API_PORT") ?? "5000"}");
Console.WriteLine($"  \n  API Endpoints:");
Console.WriteLine($"    POST   /api/auth/register");
Console.WriteLine($"    POST   /api/auth/login");
Console.WriteLine($"    GET    /api/auth/me  (requires auth)");
Console.WriteLine($"    GET    /api/protected/user-only");
Console.WriteLine($"    GET    /api/protected/admin-only");
Console.WriteLine("═══════════════════════════════════════════════════════\n");

app.Run();