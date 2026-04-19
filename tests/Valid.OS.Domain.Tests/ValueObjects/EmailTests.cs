using Valid.OS.Domain.Exceptions;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Domain.Tests.ValueObjects;

public sealed class EmailTests
{
    [Fact]
    public void Create_TrimsNormalizesAndLowercases()
    {
        var email = Email.Create("  User@ValidLocal.com ");

        Assert.Equal("user@validlocal.com", email.Value);
    }

    [Fact]
    public void Create_RejectsEmpty()
    {
        var ex = Assert.Throws<DomainException>(() => Email.Create(""));
        Assert.NotEmpty(ex.Message);
    }

    [Fact]
    public void Create_RejectsWhitespaceOnly()
    {
        Assert.Throws<DomainException>(() => Email.Create("   "));
    }

    [Fact]
    public void Create_RejectsWithoutAt()
    {
        Assert.Throws<DomainException>(() => Email.Create("userexample.com"));
    }

    [Fact]
    public void Create_RejectsWithoutDomain()
    {
        Assert.Throws<DomainException>(() => Email.Create("user@"));
    }

    [Fact]
    public void Create_RejectsWithoutTld()
    {
        Assert.Throws<DomainException>(() => Email.Create("user@nodot"));
    }

    [Fact]
    public void Create_SameNormalizedValue_AreEqualByValue()
    {
        var a = Email.Create("  User@ValidLocal.com ");
        var b = Email.Create("user@validlocal.com");

        Assert.Equal(a, b);
        Assert.True(a == b);
        Assert.False(a != b);
    }
}
