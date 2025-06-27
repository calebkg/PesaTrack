namespace SPEMS.API.Services;

public interface IReportService
{
    Task<byte[]> GenerateExpenseReportAsync(string userId, string month);
    Task<byte[]> GenerateBudgetReportAsync(string userId, string month);
    Task<byte[]> GenerateComprehensiveReportAsync(string userId, string month);
}