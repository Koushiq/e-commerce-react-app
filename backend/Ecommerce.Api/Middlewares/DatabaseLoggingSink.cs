using System;
using System.Threading;
using Ecommerce.Domain.Entities;
using Ecommerce.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Serilog.Core;
using Serilog.Events;

namespace Ecommerce.Api.Middlewares;

public class DatabaseLoggingSink : ILogEventSink
{
    private static IServiceProvider? _serviceProvider;
    private static readonly AsyncLocal<bool> _isLogging = new();

    public static void Initialize(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public void Emit(LogEvent logEvent)
    {
        if (_isLogging.Value || logEvent.Level < LogEventLevel.Warning || _serviceProvider == null)
            return;

        try
        {
            _isLogging.Value = true;
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetService<EcommerceDbContext>();
            if (db != null)
            {
                var log = new AppLog
                {
                    Timestamp = logEvent.Timestamp.UtcDateTime,
                    Level = logEvent.Level.ToString(),
                    Message = logEvent.RenderMessage(),
                    Exception = logEvent.Exception?.ToString()
                };
                db.AppLogs.Add(log);
                db.SaveChanges();
            }
        }
        catch
        {
            // Ignore failure to prevent infinite log recursion
        }
        finally
        {
            _isLogging.Value = false;
        }
    }
}
