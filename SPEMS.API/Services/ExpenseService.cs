using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using SPEMS.API.Data;
using SPEMS.API.Models;
using SPEMS.API.Models.DTOs;

namespace SPEMS.API.Services;

public class ExpenseService : IExpenseService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public ExpenseService(ApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ExpenseDto>> GetExpensesAsync(string userId, ExpenseFiltersDto? filters = null)
    {
        var query = _context.Expenses.Where(e => e.UserId == userId);

        if (filters != null)
        {
            if (filters.StartDate.HasValue)
                query = query.Where(e => e.Date >= filters.StartDate.Value);

            if (filters.EndDate.HasValue)
                query = query.Where(e => e.Date <= filters.EndDate.Value);

            if (!string.IsNullOrEmpty(filters.Category))
                query = query.Where(e => e.Category == filters.Category);

            if (!string.IsNullOrEmpty(filters.Search))
                query = query.Where(e => e.Description.Contains(filters.Search));

            if (filters.MinAmount.HasValue)
                query = query.Where(e => e.Amount >= filters.MinAmount.Value);

            if (filters.MaxAmount.HasValue)
                query = query.Where(e => e.Amount <= filters.MaxAmount.Value);
        }

        var expenses = await query.OrderByDescending(e => e.Date).ToListAsync();
        return expenses.Select(MapToDto);
    }

    public async Task<ExpenseDto?> GetExpenseByIdAsync(string userId, string expenseId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.UserId == userId);

        return expense != null ? MapToDto(expense) : null;
    }

    public async Task<ExpenseDto> CreateExpenseAsync(string userId, CreateExpenseRequestDto request)
    {
        var expense = new Expense
        {
            Amount = request.Amount,
            Category = request.Category,
            Date = request.Date,
            Description = request.Description,
            Currency = request.Currency,
            UserId = userId,
            Tags = request.Tags != null ? JsonConvert.SerializeObject(request.Tags) : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        return MapToDto(expense);
    }

    public async Task<ExpenseDto> UpdateExpenseAsync(string userId, string expenseId, UpdateExpenseRequestDto request)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.UserId == userId);

        if (expense == null)
            throw new NotFoundException("Expense not found");

        if (request.Amount.HasValue)
            expense.Amount = request.Amount.Value;

        if (!string.IsNullOrEmpty(request.Category))
            expense.Category = request.Category;

        if (request.Date.HasValue)
            expense.Date = request.Date.Value;

        if (!string.IsNullOrEmpty(request.Description))
            expense.Description = request.Description;

        if (!string.IsNullOrEmpty(request.Currency))
            expense.Currency = request.Currency;

        if (request.Tags != null)
            expense.Tags = JsonConvert.SerializeObject(request.Tags);

        expense.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(expense);
    }

    public async Task<bool> DeleteExpenseAsync(string userId, string expenseId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == expenseId && e.UserId == userId);

        if (expense == null)
            return false;

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<ExpenseSummaryDto> GetExpenseSummaryAsync(string userId, string? month = null)
    {
        var query = _context.Expenses.Where(e => e.UserId == userId);

        if (!string.IsNullOrEmpty(month))
        {
            var year = int.Parse(month.Split('-')[0]);
            var monthNum = int.Parse(month.Split('-')[1]);
            query = query.Where(e => e.Date.Year == year && e.Date.Month == monthNum);
        }

        var expenses = await query.ToListAsync();

        var categoryBreakdown = expenses
            .GroupBy(e => e.Category)
            .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));

        var monthlyTrend = expenses
            .GroupBy(e => new { e.Date.Year, e.Date.Month })
            .Select(g => new MonthlyTrendDto
            {
                Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                Amount = g.Sum(e => e.Amount)
            })
            .OrderBy(m => m.Month)
            .ToList();

        return new ExpenseSummaryDto
        {
            TotalExpenses = expenses.Count,
            TotalAmount = expenses.Sum(e => e.Amount),
            CategoryBreakdown = categoryBreakdown,
            MonthlyTrend = monthlyTrend
        };
    }

    private static ExpenseDto MapToDto(Expense expense)
    {
        return new ExpenseDto
        {
            Id = expense.Id,
            Amount = expense.Amount,
            Category = expense.Category,
            Date = expense.Date,
            Description = expense.Description,
            UserId = expense.UserId,
            CreatedAt = expense.CreatedAt,
            UpdatedAt = expense.UpdatedAt,
            Currency = expense.Currency,
            Tags = !string.IsNullOrEmpty(expense.Tags) 
                ? JsonConvert.DeserializeObject<List<string>>(expense.Tags) 
                : null,
            Receipt = expense.Receipt
        };
    }
}