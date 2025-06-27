
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;
using System.Threading.Tasks;
using System.Net.Http;
using SPEMS.API.Models;

namespace SPEMS.API.Services
{
    public interface IExchangeRateService
    {
        Task<ExchangeRates> GetRatesAsync(string baseCurrency);
    }

    public class ExchangeRateService : IExchangeRateService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;
        private const string ApiKey = "YOUR_API_KEY"; // Replace with your actual API key
        private const string CacheKeyPrefix = "ExchangeRates_";

        public ExchangeRateService(HttpClient httpClient, IMemoryCache cache)
        {
            _httpClient = httpClient;
            _cache = cache;
        }

        public async Task<ExchangeRates> GetRatesAsync(string baseCurrency)
        {
            var cacheKey = $"{CacheKeyPrefix}{baseCurrency}";
            if (_cache.TryGetValue(cacheKey, out ExchangeRates rates))
            {
                return rates;
            }

            var url = $"https://v6.exchangerate-api.com/v6/{ApiKey}/latest/{baseCurrency}";
            var response = await _httpClient.GetAsync(url);

            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var apiResponse = JsonSerializer.Deserialize<ExchangeRateApiResponse>(content);

            if (apiResponse?.result != "success")
            {
                throw new ApiException("Failed to fetch exchange rates from the external API.");
            }

            var exchangeRates = new ExchangeRates
            {
                BaseCurrency = apiResponse.base_code,
                Rates = apiResponse.conversion_rates
            };
            
            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(System.TimeSpan.FromHours(4)); 

            _cache.Set(cacheKey, exchangeRates, cacheEntryOptions);

            return exchangeRates;
        }
    }
}
