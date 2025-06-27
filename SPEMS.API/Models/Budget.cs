using System.ComponentModel.DataAnnotations;

namespace SPEMS.API.Models;

public class Budget
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }
    
    [Required]
    [StringLength(7)] // Format: YYYY-MM
    public string Month { get; set; } = string.Empty;
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    // Navigation property
    public virtual ApplicationUser User { get; set; } = null!;
}