using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPEMS.API.Models.DTOs;
using SPEMS.API.Services;
using System.Security.Claims;

namespace SPEMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BudgetsController : ControllerBase
{
    private readonly IBudgetService _budgetService;

    public BudgetsController(IBudgetService budgetService)
    {
        _budgetService = budgetService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BudgetDto>>> GetBudgets([FromQuery] string? month = null)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var budgets = await _budgetService.GetBudgetsAsync(userId, month);
        return Ok(budgets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetDto>> GetBudget(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var budget = await _budgetService.GetBudgetByIdAsync(userId, id);
        
        if (budget == null)
            return NotFound();
        
        return Ok(budget);
    }

    [HttpPost]
    public async Task<ActionResult<BudgetDto>> CreateBudget([FromBody] CreateBudgetRequestDto request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            var budget = await _budgetService.CreateBudgetAsync(userId, request);
            return CreatedAtAction(nameof(GetBudget), new { id = budget.Id }, budget);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BudgetDto>> UpdateBudget(string id, [FromBody] UpdateBudgetRequestDto request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            var budget = await _budgetService.UpdateBudgetAsync(userId, id, request);
            return Ok(budget);
        }
        catch (NotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBudget(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var result = await _budgetService.DeleteBudgetAsync(userId, id);
        
        if (!result)
            return NotFound();
        
        return NoContent();
    }

    [HttpGet("summary")]
    public async Task<ActionResult<BudgetSummaryDto>> GetBudgetSummary([FromQuery] string? month = null)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var summary = await _budgetService.GetBudgetSummaryAsync(userId, month);
        return Ok(summary);
    }
}