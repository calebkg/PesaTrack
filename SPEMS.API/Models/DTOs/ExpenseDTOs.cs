using System.ComponentModel.DataAnnotations;

namespace SPEMS.API.Models.DTOs;

public class CreateExpenseRequestDto
{
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = string.Empty;
    
    public List<string>? Tags { get; set; }
}

public class UpdateExpenseRequestDto
{
    [Range(0.01, double.MaxValue)]
    public decimal? Amount { get; set; }
    
    [StringLength(100)]
    public string? Category { get; set; }
    
    public DateTime? Date { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(3)]
    public string? Currency { get; set; }
    
    public List<string>? Tags { get; set; }
}

public class ExpenseDto
{
    public string Id { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Currency { get; set; } = string.Empty;
    public List<string>? Tags { get; set; }
    public string? Receipt { get; set; }
}

public class ExpenseFiltersDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Category { get; set; }
    public string? Search { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public List<string>? Tags { get; set; }
}

public class ExpenseSummaryDto
{
    public int TotalExpenses { get; set; }
    public decimal TotalAmount { get; set; }
    public Dictionary<string, decimal> CategoryBreakdown { get; set; } = new();
    public List<MonthlyTrendDto> MonthlyTrend { get; set; } = new();
}

public class MonthlyTrendDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}