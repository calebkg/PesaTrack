using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using SPEMS.API.Data;
using SPEMS.API.Models;
using SPEMS.API.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace SPEMS.API.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;
    private readonly IMapper _mapper;
    private readonly ApplicationDbContext _context;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        IMapper mapper,
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
        _mapper = mapper;
        _context = context;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new UnauthorizedAccessException("Invalid email or password");

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
            throw new UnauthorizedAccessException("Invalid email or password");

        var token = await GenerateJwtTokenAsync(user);
        var refreshToken = GenerateRefreshToken();

        var userDto = await MapUserToDto(user);

        return new AuthResponseDto
        {
            User = userDto,
            Token = token,
            RefreshToken = refreshToken
        };
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            throw new InvalidOperationException("User with this email already exists");

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            Name = request.Name,
            CreatedAt = DateTime.UtcNow,
            IsVerified = true,
            Currency = "USD"
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

        // Create default user preferences
        var preferences = new UserPreferences
        {
            UserId = user.Id,
            Theme = "light",
            Currency = "USD",
            BudgetAlerts = true,
            MonthlyReports = true,
            ExpenseReminders = false,
            Language = "en"
        };

        _context.UserPreferences.Add(preferences);
        await _context.SaveChangesAsync();

        var token = await GenerateJwtTokenAsync(user);
        var refreshToken = GenerateRefreshToken();

        var userDto = await MapUserToDto(user);

        return new AuthResponseDto
        {
            User = userDto,
            Token = token,
            RefreshToken = refreshToken
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        // In a real implementation, you would validate the refresh token
        // For now, we'll just return a new token
        throw new NotImplementedException("Refresh token functionality not implemented");
    }

    public async Task<UserDto> UpdateProfileAsync(string userId, UpdateProfileRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User not found");

        if (!string.IsNullOrEmpty(request.Name))
            user.Name = request.Name;

        if (!string.IsNullOrEmpty(request.Email))
            user.Email = request.Email;

        if (!string.IsNullOrEmpty(request.Currency))
            user.Currency = request.Currency;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

        return await MapUserToDto(user);
    }

    public async Task<bool> VerifyEmailAsync(string userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return false;

        var result = await _userManager.ConfirmEmailAsync(user, token);
        return result.Succeeded;
    }

    public async Task<bool> ResetPasswordAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return false;

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        // In a real implementation, you would send an email with the reset link
        // For now, we'll just return true
        return true;
    }

    private async Task<string> GenerateJwtTokenAsync(ApplicationUser user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expiryInMinutes = int.Parse(jwtSettings["ExpiryInMinutes"]!);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Email, user.Email!),
            new("currency", user.Currency)
        };

        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryInMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        return Guid.NewGuid().ToString();
    }

    private async Task<UserDto> MapUserToDto(ApplicationUser user)
    {
        var preferences = await _context.UserPreferences.FirstOrDefaultAsync(p => p.UserId == user.Id);
        
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            Name = user.Name,
            CreatedAt = user.CreatedAt,
            IsVerified = user.IsVerified,
            Currency = user.Currency,
            Avatar = user.Avatar,
            Preferences = new UserPreferencesDto
            {
                Theme = preferences?.Theme ?? "light",
                Currency = preferences?.Currency ?? user.Currency,
                Language = preferences?.Language ?? "en",
                Notifications = new NotificationSettingsDto
                {
                    BudgetAlerts = preferences?.BudgetAlerts ?? true,
                    MonthlyReports = preferences?.MonthlyReports ?? true,
                    ExpenseReminders = preferences?.ExpenseReminders ?? false
                }
            }
        };
    }
}

public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}