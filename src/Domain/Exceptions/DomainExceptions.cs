namespace Domain.Exceptions;

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}

public class NotFoundException : DomainException
{
    public NotFoundException(string name, object key)
        : base($"Entity '{name}' với key '{key}' không tìm thấy.") { }
}

public class BusinessRuleException : DomainException
{
    public BusinessRuleException(string message) : base(message) { }
}

public class UnauthorizedException : DomainException
{
    public UnauthorizedException() : base("Không có quyền truy cập.") { }
    public UnauthorizedException(string message) : base(message) { }
}
