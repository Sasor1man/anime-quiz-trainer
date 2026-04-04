using AnimeQuizTrainer.Application.DTOs.Auth;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Domain.Entities;
using AnimeQuizTrainer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class AuthService(
    IUserRepository users,
    IUnitOfWork uow,
    JwtService jwt,
    AppDbContext db) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await users.ExistsByEmailAsync(request.Email, ct))
            throw new InvalidOperationException("Email is already registered.");

        if (await users.ExistsByUsernameAsync(request.Username, ct))
            throw new InvalidOperationException("Username is already taken.");

        var user = new User
        {
            Username = request.Username,
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        await users.AddAsync(user, ct);
        await uow.SaveChangesAsync(ct);

        return await BuildAuthResponseAsync(user, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await users.GetByEmailAsync(request.Email, ct)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return await BuildAuthResponseAsync(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var token = await db.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken, ct)
            ?? throw new UnauthorizedAccessException("Refresh token not found.");

        if (!token.IsActive)
            throw new UnauthorizedAccessException("Refresh token has expired or been revoked.");

        token.RevokedAt = DateTime.UtcNow;
        await uow.SaveChangesAsync(ct);

        return await BuildAuthResponseAsync(token.User, ct);
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken ct = default)
    {
        var token = await db.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == refreshToken, ct);

        if (token is not null && token.RevokedAt is null)
        {
            token.RevokedAt = DateTime.UtcNow;
            await uow.SaveChangesAsync(ct);
        }
    }

    private async Task<AuthResponse> BuildAuthResponseAsync(User user, CancellationToken ct)
    {
        var (accessToken, expiresAt) = jwt.GenerateAccessToken(user);
        var refreshToken = jwt.GenerateRefreshToken(user.Id);

        await db.RefreshTokens.AddAsync(refreshToken, ct);
        await uow.SaveChangesAsync(ct);

        return new AuthResponse(
            accessToken,
            refreshToken.Token,
            expiresAt,
            new UserInfo(user.Id, user.Username, user.Email, user.IsAdmin));
    }
}
