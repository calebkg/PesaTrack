using System.ComponentModel.DataAnnotations;

namespace SPEMS.API.Models;

public class UserPreferences
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(10)]
    public string Theme { get; set; } = "light"; // light, dark
    
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    public bool BudgetAlerts { get; set; } = true;
    public bool MonthlyReports { get; set; } = true;
    public bool ExpenseReminders { get; set; } = false;
    
    [StringLength(10)]
    public string Language { get; set; } = "en";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public virtual ApplicationUser User { get; set; } = null!;
}