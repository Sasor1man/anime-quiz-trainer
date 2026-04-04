using System.Security.Claims;
using AnimeQuizTrainer.Application.DTOs.Progress;
using AnimeQuizTrainer.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeQuizTrainer.API.Controllers;

/// <summary>User progress for learning openings.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgressController(IProgressService progressService) : ControllerBase
{
    /// <summary>Summary stats: total in progress, due for review today, new available.</summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(UserProgressSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(CancellationToken ct) =>
        Ok(await progressService.GetSummaryAsync(GetUserId(), ct));

    /// <summary>Detailed per-opening progress for the current user.</summary>
    [HttpGet("openings")]
    [ProducesResponseType(typeof(IEnumerable<OpeningProgressDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOpeningsProgress(CancellationToken ct) =>
        Ok(await progressService.GetOpeningsProgressAsync(GetUserId(), ct));

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException());
}
