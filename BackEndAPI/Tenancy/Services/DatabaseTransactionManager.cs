namespace BackEndAPI.Tenancy.Services
{
    public interface IDatabaseTransactionManager
    {
        Task ExecuteAsync(Func<Task> action);
        Task<T> ExecuteAsync<T>(Func<Task<T>> action);
    }

    public class DatabaseTransactionManager : IDatabaseTransactionManager
    {
        private readonly ICurrentDbContext _currentDbContext;
        private readonly ILogger<DatabaseTransactionManager> _logger;

        public DatabaseTransactionManager(ICurrentDbContext currentDbContext, ILogger<DatabaseTransactionManager> logger)
        {
            _currentDbContext = currentDbContext;
            _logger = logger;
        }

        public async Task ExecuteAsync(Func<Task> action)
        {
            if (_currentDbContext.Db.Database.CurrentTransaction != null)
            {
                await action();
                return;
            }

            await using var transaction = await _currentDbContext.Db.Database.BeginTransactionAsync();
            try
            {
                await action();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Se hizo rollback de una transacción por una excepción");
                await transaction.RollbackAsync();
                // Se re-lanza la excepción original (con su tipo y stack trace intactos) en vez de
                // envolverla en un Exception genérico: así el logging de más arriba y cualquier
                // catch tipado aguas arriba siguen funcionando.
                throw;
            }
        }

        public async Task<T> ExecuteAsync<T>(Func<Task<T>> action)
        {
            if (_currentDbContext.Db.Database.CurrentTransaction != null)
            {
                return await action();
            }

            await using var transaction = await _currentDbContext.Db.Database.BeginTransactionAsync();
            try
            {
                var result = await action();
                await transaction.CommitAsync();
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Se hizo rollback de una transacción por una excepción");
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
