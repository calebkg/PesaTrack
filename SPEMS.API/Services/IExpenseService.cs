using SPEMS.API.Models.DTOs;

namespace SPEMS.API.Services;

public interface IExpenseService
{
    Task<IEnumerable<ExpenseDto>> GetExpensesAsync(string userId, ExpenseFiltersDto? filters = null);
    Task<ExpenseDto?> GetExpenseByIdAsync(string userId, string expenseId);
    Task<ExpenseDto> CreateExpenseAsync(string userId, CreateExpenseRequestDto request);
    Task<ExpenseDto> UpdateExpenseAsync(string userId, string expenseId, UpdateExpenseRequestDto request);
    Task<bool> DeleteExpenseAsync(string userId, string expenseId);
    Task<ExpenseSummaryDto> GetExpenseSummaryAsync(string userId, string? month = null);
}