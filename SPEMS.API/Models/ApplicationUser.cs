using Microsoft.AspNetCore.Identity;

namespace SPEMS.API.Models;

public class ApplicationUser : IdentityUser
{
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsVerified { get; set; } = true;
    public string Currency { get; set; } = "USD";
    public string? Avatar { get; set; }
    
    // Navigation properties
    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public virtual UserPreferences? Preferences { get; set; }
}