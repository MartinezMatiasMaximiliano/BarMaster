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

        public DatabaseTransactionManager(ICurrentDbContext currentDbContext)
        {
            _currentDbContext = currentDbContext;
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
                await transaction.RollbackAsync();
                throw new Exception(ex.Message);
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
                await transaction.RollbackAsync();
                throw new Exception(ex.Message);
            }
        }
    }
}
