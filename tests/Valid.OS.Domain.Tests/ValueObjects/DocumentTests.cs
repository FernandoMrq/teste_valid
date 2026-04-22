using Valid.OS.Domain.Exceptions;
using Valid.OS.Domain.ValueObjects;

namespace Valid.OS.Domain.Tests.ValueObjects;

public sealed class DocumentTests
{
    [Theory]
    [InlineData("111.444.777-35", "11144477735")]
    [InlineData("11144477735", "11144477735")]
    [InlineData("  111 444 777-35  ", "11144477735")]
    public void Create_WithValidCpf_NormalizesAndSetsType(string input, string expected)
    {
        var doc = Document.Create(input);

        Assert.Equal(DocumentType.Cpf, doc.Type);
        Assert.Equal(expected, doc.Value);
    }

    [Theory]
    [InlineData("11.222.333/0001-81", "11222333000181")]
    [InlineData("11222333000181", "11222333000181")]
    public void Create_WithValidCnpj_NormalizesAndSetsType(string input, string expected)
    {
        var doc = Document.Create(input);

        Assert.Equal(DocumentType.Cnpj, doc.Type);
        Assert.Equal(expected, doc.Value);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("abcd")]
    public void Create_WithEmptyOrNoDigits_Throws(string? input)
    {
        Assert.Throws<DomainException>(() => Document.Create(input));
    }

    [Theory]
    [InlineData("12345678900")] // 11 digits, invalid verifier
    [InlineData("11111111111")] // all same
    public void Create_WithInvalidCpf_Throws(string input)
    {
        Assert.Throws<DomainException>(() => Document.Create(input));
    }

    [Theory]
    [InlineData("12345678000199")] // 14 digits, invalid verifier
    [InlineData("11111111111111")] // all same
    public void Create_WithInvalidCnpj_Throws(string input)
    {
        Assert.Throws<DomainException>(() => Document.Create(input));
    }

    [Theory]
    [InlineData("123")]
    [InlineData("1234567890123456")]
    public void Create_WithUnsupportedLength_Throws(string input)
    {
        Assert.Throws<DomainException>(() => Document.Create(input));
    }

    [Fact]
    public void Equality_ByTypeAndValue()
    {
        var a = Document.Create("11144477735");
        var b = Document.Create("111.444.777-35");
        var c = Document.Create("11222333000181");

        Assert.Equal(a, b);
        Assert.True(a == b);
        Assert.NotEqual(a, c);
    }
}
