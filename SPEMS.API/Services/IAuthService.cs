using SPEMS.API.Models.DTOs;

namespace SPEMS.API.Services;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken);
    Task<UserDto> UpdateProfileAsync(string userId, UpdateProfileRequestDto request);
    Task<bool> VerifyEmailAsync(string userId, string token);
    Task<bool> ResetPasswordAsync(string email);
}