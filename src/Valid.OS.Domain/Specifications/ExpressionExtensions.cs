using System.Linq.Expressions;

namespace Valid.OS.Domain.Specifications;

internal static class ExpressionExtensions
{
    public static Expression<Func<T, bool>> And<T>(
        this Expression<Func<T, bool>> left,
        Expression<Func<T, bool>> right)
    {
        var parameter = left.Parameters[0];
        var visitor = new ReplaceParameterVisitor(right.Parameters[0], parameter);
        var rightBody = visitor.Visit(right.Body)
            ?? throw new InvalidOperationException("Não foi possível combinar as expressões.");

        var body = Expression.AndAlso(left.Body, rightBody);
        return Expression.Lambda<Func<T, bool>>(body, parameter);
    }
}
