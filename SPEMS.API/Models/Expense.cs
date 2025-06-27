using System.ComponentModel.DataAnnotations;

namespace SPEMS.API.Models;

public class Expense
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
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
    public string UserId { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [Required]
    [StringLength(3)]
    public string Currency { get; set; } = "USD";
    
    public string? Tags { get; set; } // JSON string of tags
    public string? Receipt { get; set; } // File path or URL
    
    // Navigation property
    public virtual ApplicationUser User { get; set; } = null!;
}