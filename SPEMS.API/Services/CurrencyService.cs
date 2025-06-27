using Newtonsoft.Json;
using SPEMS.API.Models.DTOs;

namespace SPEMS.API.Services;

public class CurrencyService : ICurrencyService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<CurrencyService> _logger;

    private static readonly List<CurrencyDto> SupportedCurrencies = new()
    {
        new() { Code = "USD", Name = "US Dollar", Symbol = "$", Flag = "🇺🇸" },
        new() { Code = "EUR", Name = "Euro", Symbol = "€", Flag = "🇪🇺" },
        new() { Code = "GBP", Name = "British Pound", Symbol = "£", Flag = "🇬🇧" },
        new() { Code = "KES", Name = "Kenyan Shilling", Symbol = "KSh", Flag = "🇰🇪" },
        new() { Code = "JPY", Name = "Japanese Yen", Symbol = "¥", Flag = "🇯🇵" },
        new() { Code = "CAD", Name = "Canadian Dollar", Symbol = "C$", Flag = "🇨🇦" },
        new() { Code = "AUD", Name = "Australian Dollar", Symbol = "A$", Flag = "🇦🇺" },
        new() { Code = "CHF", Name = "Swiss Franc", Symbol = "CHF", Flag = "🇨🇭" },
        new() { Code = "CNY", Name = "Chinese Yuan", Symbol = "¥", Flag = "🇨🇳" },
        new() { Code = "INR", Name = "Indian Rupee", Symbol = "₹", Flag = "🇮🇳" }
    };

    // Fallback exchange rates
    private static readonly Dictionary<string, decimal> FallbackRates = new()
    {
        { "USD", 1.0m },
        { "EUR", 0.85m },
        { "GBP", 0.73m },
        { "KES", 150.25m },
        { "JPY", 110.15m },
        { "CAD", 1.25m },
        { "AUD", 1.35m },
        { "CHF", 0.92m },
        { "CNY", 6.45m },
        { "INR", 74.50m }
    };

    public CurrencyService(HttpClient httpClient, IConfiguration configuration, ILogger<CurrencyService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    // Parameterless constructor for design-time services (e.g., migrations)
    public CurrencyService() { }

    public Task<IEnumerable<CurrencyDto>> GetSupportedCurrenciesAsync()
    {
        return Task.FromResult<IEnumerable<CurrencyDto>>(SupportedCurrencies);
    }

    public async Task<ExchangeRatesDto> GetExchangeRatesAsync(string baseCurrency = "USD")
    {
        try
        {
            var apiUrl = _configuration["ExchangeRateApi:BaseUrl"];
            var response = await _httpClient.GetStringAsync($"{apiUrl}/{baseCurrency}");
            var data = JsonConvert.DeserializeObject<dynamic>(response);

            var rates = new Dictionary<string, decimal>();
            foreach (var rate in data.rates)
            {
                if (SupportedCurrencies.Any(c => c.Code == rate.Name))
                {
                    rates[rate.Name] = rate.Value;
                }
            }

            return new ExchangeRatesDto
            {
                BaseCurrency = baseCurrency,
                LastUpdated = DateTime.UtcNow,
                Rates = rates
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch exchange rates from API, using fallback rates");
            
            return new ExchangeRatesDto
            {
                BaseCurrency = baseCurrency,
                LastUpdated = DateTime.UtcNow,
                Rates = FallbackRates
            };
        }
    }

    public async Task<CurrencyConversionDto> ConvertCurrencyAsync(string from, string to, decimal amount)
    {
        if (from == to)
        {
            return new CurrencyConversionDto
            {
                From = from,
                To = to,
                Amount = amount,
                ConvertedAmount = amount,
                Rate = 1.0m
            };
        }

        var rates = await GetExchangeRatesAsync("USD");
        
        // Convert to USD first, then to target currency
        var usdAmount = from == "USD" ? amount : amount / rates.Rates.GetValueOrDefault(from, 1.0m);
        var convertedAmount = to == "USD" ? usdAmount : usdAmount * rates.Rates.GetValueOrDefault(to, 1.0m);
        var rate = convertedAmount / amount;

        return new CurrencyConversionDto
        {
            From = from,
            To = to,
            Amount = amount,
            ConvertedAmount = Math.Round(convertedAmount, 2),
            Rate = Math.Round(rate, 4)
        };
    }
}