using SPEMS.API.Models.DTOs;

namespace SPEMS.API.Services;

public interface IBudgetService
{
    Task<IEnumerable<BudgetDto>> GetBudgetsAsync(string userId, string? month = null);
    Task<BudgetDto?> GetBudgetByIdAsync(string userId, string budgetId);
    Task<BudgetDto> CreateBudgetAsync(string userId, CreateBudgetRequestDto request);
    Task<BudgetDto> UpdateBudgetAsync(string userId, string budgetId, UpdateBudgetRequestDto request);
    Task<bool> DeleteBudgetAsync(string userId, string budgetId);
    Task<BudgetSummaryDto> GetBudgetSummaryAsync(string userId, string? month = null);
}