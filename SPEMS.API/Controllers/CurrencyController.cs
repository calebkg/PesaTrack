using Microsoft.AspNetCore.Mvc;
using SPEMS.API.Models.DTOs;
using SPEMS.API.Services;

namespace SPEMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CurrencyController : ControllerBase
{
    private readonly ICurrencyService _currencyService;

    public CurrencyController(ICurrencyService currencyService)
    {
        _currencyService = currencyService;
    }

    [HttpGet("supported")]
    public async Task<ActionResult<IEnumerable<CurrencyDto>>> GetSupportedCurrencies()
    {
        var currencies = await _currencyService.GetSupportedCurrenciesAsync();
        return Ok(currencies);
    }

    [HttpGet("rates/{baseCurrency}")]
    public async Task<ActionResult<ExchangeRatesDto>> GetExchangeRates(string baseCurrency)
    {
        var rates = await _currencyService.GetExchangeRatesAsync(baseCurrency);
        return Ok(rates);
    }

    [HttpPost("convert")]
    public async Task<ActionResult<CurrencyConversionDto>> ConvertCurrency([FromBody] ConvertCurrencyRequestDto request)
    {
        var conversion = await _currencyService.ConvertCurrencyAsync(request.From, request.To, request.Amount);
        return Ok(conversion);
    }
}

public class ConvertCurrencyRequestDto
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}