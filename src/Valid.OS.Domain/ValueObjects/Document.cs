using Valid.OS.Domain.Exceptions;
using Valid.OS.Domain.Primitives;

namespace Valid.OS.Domain.ValueObjects;

public sealed class Document : ValueObject
{
    private Document(DocumentType type, string value)
    {
        Type = type;
        Value = value;
    }

    public DocumentType Type { get; }

    /// <summary>Dígitos apenas, sem máscara.</summary>
    public string Value { get; }

    public static Document Create(string? input)
    {
        var digits = ExtractDigits(input);

        if (digits.Length == 11)
        {
            if (!IsValidCpf(digits))
            {
                throw new DomainException("CPF inválido.");
            }

            return new Document(DocumentType.Cpf, digits);
        }

        if (digits.Length == 14)
        {
            if (!IsValidCnpj(digits))
            {
                throw new DomainException("CNPJ inválido.");
            }

            return new Document(DocumentType.Cnpj, digits);
        }

        throw new DomainException("Documento deve ter 11 dígitos (CPF) ou 14 (CNPJ).");
    }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Type;
        yield return Value;
    }

    private static string ExtractDigits(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            throw new DomainException("Documento não pode ser vazio.");
        }

        var digits = new string(input.Where(char.IsDigit).ToArray());

        if (digits.Length == 0)
        {
            throw new DomainException("Documento não pode ser vazio.");
        }

        return digits;
    }

    private static bool IsValidCpf(string cpf)
    {
        if (cpf.Length != 11 || cpf.Distinct().Count() == 1)
        {
            return false;
        }

        var firstVerifier = ComputeCpfVerifierDigit(cpf, 9, 10);
        if (cpf[9] - '0' != firstVerifier)
        {
            return false;
        }

        var secondVerifier = ComputeCpfVerifierDigit(cpf, 10, 11);
        return cpf[10] - '0' == secondVerifier;
    }

    private static int ComputeCpfVerifierDigit(string cpf, int length, int initialWeight)
    {
        var sum = 0;
        for (var i = 0; i < length; i++)
        {
            sum += (cpf[i] - '0') * (initialWeight - i);
        }

        var remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }

    private static bool IsValidCnpj(string cnpj)
    {
        if (cnpj.Length != 14 || cnpj.Distinct().Count() == 1)
        {
            return false;
        }

        var weights1 = new[] { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
        var weights2 = new[] { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };

        var first = ComputeCnpjVerifierDigit(cnpj, weights1);
        if (cnpj[12] - '0' != first)
        {
            return false;
        }

        var second = ComputeCnpjVerifierDigit(cnpj, weights2);
        return cnpj[13] - '0' == second;
    }

    private static int ComputeCnpjVerifierDigit(string cnpj, int[] weights)
    {
        var sum = 0;
        for (var i = 0; i < weights.Length; i++)
        {
            sum += (cnpj[i] - '0') * weights[i];
        }

        var remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
}
