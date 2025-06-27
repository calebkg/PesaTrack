using System.ComponentModel.DataAnnotations;

namespace SPEMS.API.Models.DTOs;

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequestDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public UserDto User { get; set; } = null!;
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsVerified { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public UserPreferencesDto Preferences { get; set; } = null!;
}

public class UserPreferencesDto
{
    public string Theme { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public NotificationSettingsDto Notifications { get; set; } = null!;
    public string Language { get; set; } = string.Empty;
}

public class NotificationSettingsDto
{
    public bool BudgetAlerts { get; set; }
    public bool MonthlyReports { get; set; }
    public bool ExpenseReminders { get; set; }
}

public class UpdateProfileRequestDto
{
    [StringLength(100)]
    public string? Name { get; set; }
    
    [EmailAddress]
    public string? Email { get; set; }
    
    [StringLength(3)]
    public string? Currency { get; set; }
}