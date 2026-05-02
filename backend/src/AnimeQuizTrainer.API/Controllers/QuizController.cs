using System.Security.Claims;
using AnimeQuizTrainer.Application.DTOs.Quiz;
using AnimeQuizTrainer.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeQuizTrainer.API.Controllers;

/// <summary>Quiz — learn mode and test mode.</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuizController(IQuizService quizService) : ControllerBase
{
    /// <summary>
    /// Get the next song for learn mode (Anki-style spaced repetition).
    /// Returns 204 when all songs have been studied and nothing is due.
    /// </summary>
    [HttpGet("learn/next")]
    [ProducesResponseType(typeof(LearnNextResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> GetNextLearn(CancellationToken ct)
    {
        var result = await quizService.GetNextLearnAsync(GetUserId(), ct);
        return result is null ? NoContent() : Ok(result);
    }

    /// <summary>
    /// Submit a review result for a song.
    /// Quality: 0=Forgot, 1=Hard, 2=Medium, 3=Easy.
    /// </summary>
    [HttpPost("learn/review")]
    [ProducesResponseType(typeof(ReviewResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> SubmitReview([FromBody] ReviewRequest request, CancellationToken ct) =>
        Ok(await quizService.SubmitReviewAsync(GetUserId(), request, ct));

    /// <summary>
    /// Start test mode. Returns a list of songs with calculated timings.
    /// Test results are not persisted.
    /// </summary>
    [HttpPost("test/start")]
    [ProducesResponseType(typeof(TestStartResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> StartTest([FromBody] TestStartRequest request, CancellationToken ct) =>
        Ok(await quizService.StartTestAsync(request, ct));

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException());
}
