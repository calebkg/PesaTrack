using System.Text;

namespace SPEMS.API.Services;

public class ReportService : IReportService
{
    private readonly IExpenseService _expenseService;
    private readonly IBudgetService _budgetService;

    public ReportService(IExpenseService expenseService, IBudgetService budgetService)
    {
        _expenseService = expenseService;
        _budgetService = budgetService;
    }

    public async Task<byte[]> GenerateExpenseReportAsync(string userId, string month)
    {
        var summary = await _expenseService.GetExpenseSummaryAsync(userId, month);
        
        // In a real implementation, you would use a PDF library like iTextSharp
        // For now, we'll return a simple text report
        var report = new StringBuilder();
        report.AppendLine($"Expense Report for {month}");
        report.AppendLine($"Total Expenses: {summary.TotalExpenses}");
        report.AppendLine($"Total Amount: ${summary.TotalAmount:F2}");
        report.AppendLine();
        report.AppendLine("Category Breakdown:");
        
        foreach (var category in summary.CategoryBreakdown)
        {
            report.AppendLine($"  {category.Key}: ${category.Value:F2}");
        }

        return Encoding.UTF8.GetBytes(report.ToString());
    }

    public async Task<byte[]> GenerateBudgetReportAsync(string userId, string month)
    {
        var summary = await _budgetService.GetBudgetSummaryAsync(userId, month);
        
        var report = new StringBuilder();
        report.AppendLine($"Budget Report for {month}");
        report.AppendLine($"Total Budget: ${summary.TotalBudget:F2}");
        report.AppendLine($"Total Spent: ${summary.TotalSpent:F2}");
        report.AppendLine($"Total Remaining: ${summary.TotalRemaining:F2}");
        report.AppendLine($"Budget Utilization: {summary.BudgetUtilization:F1}%");
        report.AppendLine();
        report.AppendLine("Category Breakdown:");
        
        foreach (var category in summary.CategoryBreakdown)
        {
            report.AppendLine($"  {category.Key}:");
            report.AppendLine($"    Budgeted: ${category.Value.Budgeted:F2}");
            report.AppendLine($"    Spent: ${category.Value.Spent:F2}");
            report.AppendLine($"    Remaining: ${category.Value.Remaining:F2}");
            report.AppendLine($"    Status: {category.Value.Status}");
        }

        return Encoding.UTF8.GetBytes(report.ToString());
    }

    public async Task<byte[]> GenerateComprehensiveReportAsync(string userId, string month)
    {
        var expenseReport = await GenerateExpenseReportAsync(userId, month);
        var budgetReport = await GenerateBudgetReportAsync(userId, month);
        
        var report = new StringBuilder();
        report.AppendLine("COMPREHENSIVE FINANCIAL REPORT");
        report.AppendLine("================================");
        report.AppendLine();
        report.AppendLine(Encoding.UTF8.GetString(expenseReport));
        report.AppendLine();
        report.AppendLine("================================");
        report.AppendLine();
        report.AppendLine(Encoding.UTF8.GetString(budgetReport));

        return Encoding.UTF8.GetBytes(report.ToString());
    }
}