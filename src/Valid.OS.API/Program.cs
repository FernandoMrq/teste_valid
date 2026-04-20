using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RabbitMQ.Client;
using Serilog;
using Valid.OS.API.Filters;
using Valid.OS.API.Middleware;
using Valid.OS.Application;
using Valid.OS.Infrastructure;
using Valid.OS.Infrastructure.Options;
using Valid.OS.Infrastructure.Persistence;

static string BuildRabbitMqConnectionString(RabbitMqOptions options)
{
    var user = Uri.EscapeDataString(options.User);
    var pass = Uri.EscapeDataString(options.Password);
    var vhost = string.IsNullOrWhiteSpace(options.VHost) ? "/" : options.VHost;
    var vhostSegment = vhost == "/" ? "%2F" : Uri.EscapeDataString(vhost);
    return $"amqp://{user}:{pass}@{options.Host}:5672/{vhostSegment}";
}

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, _, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

builder.Services.AddScoped<ValidationFilter>();
builder.Services.AddScoped<CurrentUserEnricherFilter>();

builder.Services.AddControllers(options =>
    {
        options.Filters.AddService<ValidationFilter>();
        options.Filters.AddService<CurrentUserEnricherFilter>();
    })
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Valid OS API",
        Version = "v1",
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT no header Authorization: Bearer {token}",
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer",
                },
            },
            Array.Empty<string>()
        },
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var keycloak = builder.Configuration.GetSection(KeycloakOptions.SectionName).Get<KeycloakOptions>()
    ?? throw new InvalidOperationException("Configuração Keycloak ausente.");

var postgresConnection = builder.Configuration.GetConnectionString("Postgres")
    ?? throw new InvalidOperationException("Connection string 'Postgres' is not configured.");
var mongoForHealth = builder.Configuration.GetSection(MongoOptions.SectionName).Get<MongoOptions>()
    ?? throw new InvalidOperationException("Configuração Mongo ausente.");
if (string.IsNullOrWhiteSpace(mongoForHealth.ConnectionString))
{
    throw new InvalidOperationException("Mongo:ConnectionString is not configured.");
}

var rabbitForHealth = builder.Configuration.GetSection(RabbitMqOptions.SectionName).Get<RabbitMqOptions>()
    ?? throw new InvalidOperationException("Configuração RabbitMq ausente.");
if (string.IsNullOrWhiteSpace(rabbitForHealth.Host))
{
    throw new InvalidOperationException("RabbitMq:Host is not configured.");
}

builder.Services.AddSingleton<IConnection>(sp =>
{
    var options = sp.GetRequiredService<IOptions<RabbitMqOptions>>().Value;
    var factory = new ConnectionFactory { Uri = new Uri(BuildRabbitMqConnectionString(options)) };
    return factory.CreateConnectionAsync().GetAwaiter().GetResult();
});

var keycloakOpenIdConfiguration = new Uri($"{keycloak.Authority.TrimEnd('/')}/.well-known/openid-configuration");

builder.Services.AddHealthChecks()
    .AddNpgSql(postgresConnection, name: "postgres")
    .AddMongoDb(mongoForHealth.ConnectionString, name: "mongodb")
    .AddRabbitMQ(name: "rabbitmq")
    .AddUrlGroup(keycloakOpenIdConfiguration, name: "keycloak");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = keycloak.Authority.TrimEnd('/');
        options.Audience = keycloak.Audience;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            NameClaimType = "preferred_username",
        };
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI();

app.UseSerilogRequestLogging();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health").AllowAnonymous();

app.MapControllers();

app.Run();
