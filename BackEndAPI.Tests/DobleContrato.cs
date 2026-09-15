using System.Reflection;
using BackEndAPI.Tenancy.Services;
namespace BackEndAPI.Tests.Contratos;
public class DobleContrato : DispatchProxy
{
    public Func<MethodInfo, object?[], object?> Resolver = null!;
    protected override object? Invoke(MethodInfo? method, object?[]? args) => Resolver(method!, args!);
    public static T Crear<T>(Func<MethodInfo, object?[], object?> resolver) where T : class
    {
        var proxy = Create<T, DobleContrato>();
        ((DobleContrato)(object)proxy).Resolver = resolver;
        return proxy;
    }
}
public class TransaccionPrueba : IDatabaseTransactionManager
{
    public Task ExecuteAsync(Func<Task> action) => action();
    public Task<T> ExecuteAsync<T>(Func<Task<T>> action) => action();
}
