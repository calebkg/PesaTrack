using SPEMS.API.Models.DTOs;

namespace SPEMS.API.Services;

public interface ICurrencyService
{
    Task<IEnumerable<CurrencyDto>> GetSupportedCurrenciesAsync();
    Task<ExchangeRatesDto> GetExchangeRatesAsync(string baseCurrency = "USD");
    Task<CurrencyConversionDto> ConvertCurrencyAsync(string from, string to, decimal amount);
}

public class CurrencyDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public string Flag { get; set; } = string.Empty;
}

public class ExchangeRatesDto
{
    public string BaseCurrency { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; }
    public Dictionary<string, decimal> Rates { get; set; } = new();
}

public class CurrencyConversionDto
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal ConvertedAmount { get; set; }
    public decimal Rate { get; set; }
}