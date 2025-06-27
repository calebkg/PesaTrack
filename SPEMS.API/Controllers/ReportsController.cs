using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPEMS.API.Services;
using System.Security.Claims;

namespace SPEMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("expenses/{month}")]
    public async Task<ActionResult> GetExpenseReport(string month)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var report = await _reportService.GenerateExpenseReportAsync(userId, month);
        
        return File(report, "text/plain", $"expense-report-{month}.txt");
    }

    [HttpGet("budgets/{month}")]
    public async Task<ActionResult> GetBudgetReport(string month)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var report = await _reportService.GenerateBudgetReportAsync(userId, month);
        
        return File(report, "text/plain", $"budget-report-{month}.txt");
    }

    [HttpGet("comprehensive/{month}")]
    public async Task<ActionResult> GetComprehensiveReport(string month)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var report = await _reportService.GenerateComprehensiveReportAsync(userId, month);
        
        return File(report, "text/plain", $"comprehensive-report-{month}.txt");
    }
}