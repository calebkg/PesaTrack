using Microsoft.EntityFrameworkCore;
using SPEMS.API.Data;
using SPEMS.API.Models;
using SPEMS.API.Models.DTOs;

namespace SPEMS.API.Services;

public class BudgetService : IBudgetService
{
    private readonly ApplicationDbContext _context;

    public BudgetService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BudgetDto>> GetBudgetsAsync(string userId, string? month = null)
    {
        var query = _context.Budgets.Where(b => b.UserId == userId);

        if (!string.IsNullOrEmpty(month))
            query = query.Where(b => b.Month == month);

        var budgets = await query.OrderBy(b => b.Category).ToListAsync();
        var budgetDtos = new List<BudgetDto>();

        foreach (var budget in budgets)
        {
            var spent = await GetSpentAmountForBudget(userId, budget.Category, budget.Month);
            budgetDtos.Add(MapToDto(budget, spent));
        }

        return budgetDtos;
    }

    public async Task<BudgetDto?> GetBudgetByIdAsync(string userId, string budgetId)
    {
        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId);

        if (budget == null)
            return null;

        var spent = await GetSpentAmountForBudget(userId, budget.Category, budget.Month);
        return MapToDto(budget, spent);
    }

    public async Task<BudgetDto> CreateBudgetAsync(string userId, CreateBudgetRequestDto request)
    {
        // Check if budget already exists for this category and month
        var existingBudget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.UserId == userId && b.Category == request.Category && b.Month == request.Month);

        if (existingBudget != null)
            throw new InvalidOperationException("Budget already exists for this category and month");

        var budget = new Budget
        {
            Category = request.Category,
            Amount = request.Amount,
            Month = request.Month,
            Currency = request.Currency,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();

        var spent = await GetSpentAmountForBudget(userId, budget.Category, budget.Month);
        return MapToDto(budget, spent);
    }

    public async Task<BudgetDto> UpdateBudgetAsync(string userId, string budgetId, UpdateBudgetRequestDto request)
    {
        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId);

        if (budget == null)
            throw new NotFoundException("Budget not found");

        if (request.Amount.HasValue)
            budget.Amount = request.Amount.Value;

        if (!string.IsNullOrEmpty(request.Category))
            budget.Category = request.Category;

        if (!string.IsNullOrEmpty(request.Month))
            budget.Month = request.Month;

        if (!string.IsNullOrEmpty(request.Currency))
            budget.Currency = request.Currency;

        budget.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var spent = await GetSpentAmountForBudget(userId, budget.Category, budget.Month);
        return MapToDto(budget, spent);
    }

    public async Task<bool> DeleteBudgetAsync(string userId, string budgetId)
    {
        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId);

        if (budget == null)
            return false;

        _context.Budgets.Remove(budget);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<BudgetSummaryDto> GetBudgetSummaryAsync(string userId, string? month = null)
    {
        var query = _context.Budgets.Where(b => b.UserId == userId);

        if (!string.IsNullOrEmpty(month))
            query = query.Where(b => b.Month == month);

        var budgets = await query.ToListAsync();
        var totalBudget = budgets.Sum(b => b.Amount);
        var totalSpent = 0m;
        var categoryBreakdown = new Dictionary<string, BudgetCategoryDataDto>();

        foreach (var budget in budgets)
        {
            var spent = await GetSpentAmountForBudget(userId, budget.Category, budget.Month);
            totalSpent += spent;

            var remaining = budget.Amount - spent;
            var percentage = budget.Amount > 0 ? (spent / budget.Amount) * 100 : 0;
            var status = percentage > 100 ? "over" : percentage > 80 ? "warning" : "good";

            categoryBreakdown[budget.Category] = new BudgetCategoryDataDto
            {
                Budgeted = budget.Amount,
                Spent = spent,
                Remaining = remaining,
                Percentage = percentage,
                Status = status
            };
        }

        var budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        return new BudgetSummaryDto
        {
            TotalBudget = totalBudget,
            TotalSpent = totalSpent,
            TotalRemaining = totalBudget - totalSpent,
            BudgetUtilization = budgetUtilization,
            CategoryBreakdown = categoryBreakdown
        };
    }

    private async Task<decimal> GetSpentAmountForBudget(string userId, string category, string month)
    {
        var year = int.Parse(month.Split('-')[0]);
        var monthNum = int.Parse(month.Split('-')[1]);

        return await _context.Expenses
            .Where(e => e.UserId == userId && 
                       e.Category == category && 
                       e.Date.Year == year && 
                       e.Date.Month == monthNum)
            .SumAsync(e => e.Amount);
    }

    private static BudgetDto MapToDto(Budget budget, decimal spent)
    {
        var remaining = budget.Amount - spent;
        var percentage = budget.Amount > 0 ? (spent / budget.Amount) * 100 : 0;

        return new BudgetDto
        {
            Id = budget.Id,
            Category = budget.Category,
            Amount = budget.Amount,
            Month = budget.Month,
            UserId = budget.UserId,
            CreatedAt = budget.CreatedAt,
            UpdatedAt = budget.UpdatedAt,
            Currency = budget.Currency,
            Spent = spent,
            Remaining = remaining,
            Percentage = percentage
        };
    }
}