
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SPEMS.API.Models
{
    public class ExchangeRates
    {
        public string BaseCurrency { get; set; }
        public Dictionary<string, double> Rates { get; set; }
    }

    public class ExchangeRateApiResponse
    {
        public string result { get; set; }
        public string base_code { get; set; }
        public Dictionary<string, double> conversion_rates { get; set; }
    }

    public class ApiException : System.Exception
    {
        public ApiException(string message) : base(message) { }
    }
}
