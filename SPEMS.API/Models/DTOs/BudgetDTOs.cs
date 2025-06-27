using System.ComponentModel.DataAnnotations;

namespace SPEMS.API.Models.DTOs;

public class CreateBudgetRequestDto
{
    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }
    
    [Required]
    [StringLength(7)] // YYYY-MM format
    public string Month { get; set; } = string.Empty;
    
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = string.Empty;
}

public class UpdateBudgetRequestDto
{
    [Range(0.01, double.MaxValue)]
    public decimal? Amount { get; set; }
    
    [StringLength(100)]
    public string? Category { get; set; }
    
    [StringLength(7)]
    public string? Month { get; set; }
    
    [StringLength(3)]
    public string? Currency { get; set; }
}

public class BudgetDto
{
    public string Id { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Month { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Currency { get; set; } = string.Empty;
    public decimal Spent { get; set; }
    public decimal Remaining { get; set; }
    public decimal Percentage { get; set; }
}

public class BudgetSummaryDto
{
    public decimal TotalBudget { get; set; }
    public decimal TotalSpent { get; set; }
    public decimal TotalRemaining { get; set; }
    public decimal BudgetUtilization { get; set; }
    public Dictionary<string, BudgetCategoryDataDto> CategoryBreakdown { get; set; } = new();
}

public class BudgetCategoryDataDto
{
    public decimal Budgeted { get; set; }
    public decimal Spent { get; set; }
    public decimal Remaining { get; set; }
    public decimal Percentage { get; set; }
    public string Status { get; set; } = string.Empty; // good, warning, over
}