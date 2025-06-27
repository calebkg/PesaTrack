using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPEMS.API.Models.DTOs;
using SPEMS.API.Services;
using System.Security.Claims;

namespace SPEMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpenses([FromQuery] ExpenseFiltersDto? filters = null)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var expenses = await _expenseService.GetExpensesAsync(userId, filters);
        return Ok(expenses);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseDto>> GetExpense(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var expense = await _expenseService.GetExpenseByIdAsync(userId, id);
        
        if (expense == null)
            return NotFound();
        
        return Ok(expense);
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense([FromBody] CreateExpenseRequestDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var expense = await _expenseService.CreateExpenseAsync(userId, request);
        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(string id, [FromBody] UpdateExpenseRequestDto request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            var expense = await _expenseService.UpdateExpenseAsync(userId, id, request);
            return Ok(expense);
        }
        catch (NotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteExpense(string id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var result = await _expenseService.DeleteExpenseAsync(userId, id);
        
        if (!result)
            return NotFound();
        
        return NoContent();
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ExpenseSummaryDto>> GetExpenseSummary([FromQuery] string? month = null)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var summary = await _expenseService.GetExpenseSummaryAsync(userId, month);
        return Ok(summary);
    }

    [HttpGet("export")]
    public async Task<ActionResult> ExportExpenses([FromQuery] ExpenseFiltersDto? filters = null)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        var expenses = await _expenseService.GetExpensesAsync(userId, filters);
        
        // Convert to CSV or Excel format
        // For now, return JSON
        return Ok(expenses);
    }
}