using System.Linq.Expressions;

namespace Valid.OS.Domain.Specifications;

internal sealed class ReplaceParameterVisitor : ExpressionVisitor
{
    private readonly ParameterExpression _source;
    private readonly ParameterExpression _target;

    public ReplaceParameterVisitor(ParameterExpression source, ParameterExpression target)
    {
        _source = source;
        _target = target;
    }

    protected override Expression VisitParameter(ParameterExpression node)
    {
        return node == _source ? _target : base.VisitParameter(node);
    }
}
