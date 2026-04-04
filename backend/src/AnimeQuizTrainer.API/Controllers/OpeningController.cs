using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Opening;
using AnimeQuizTrainer.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeQuizTrainer.API.Controllers;

/// <summary>Opening management.</summary>
[ApiController]
[Route("api/[controller]")]
public class OpeningController(IOpeningService openingService) : ControllerBase
{
    /// <summary>Get a paged list of openings.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<OpeningDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList(
        [FromQuery] string? filterText,
        [FromQuery] string? sorting,
        [FromQuery] int skipCount = 0,
        [FromQuery] int maxResultCount = 10,
        CancellationToken ct = default) =>
        Ok(await openingService.GetListAsync(filterText, sorting, skipCount, maxResultCount, ct));

    /// <summary>Get opening by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(OpeningDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await openingService.GetByIdAsync(id, ct));

    /// <summary>Get a paged list of openings for a specific anime.</summary>
    [HttpGet("by-anime/{animeId:guid}")]
    [ProducesResponseType(typeof(PagedResult<OpeningDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetListByAnime(
        Guid animeId,
        [FromQuery] string? filterText,
        [FromQuery] string? sorting,
        [FromQuery] int skipCount = 0,
        [FromQuery] int maxResultCount = 10,
        CancellationToken ct = default) =>
        Ok(await openingService.GetListByAnimeIdAsync(animeId, filterText, sorting, skipCount, maxResultCount, ct));

    /// <summary>Create an opening (admin only).</summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(OpeningDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateOpeningRequest request, CancellationToken ct)
    {
        var result = await openingService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update an opening (admin only).</summary>
    [Authorize]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(OpeningDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOpeningRequest request, CancellationToken ct) =>
        Ok(await openingService.UpdateAsync(id, request, ct));

    /// <summary>Delete an opening (admin only).</summary>
    [Authorize]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await openingService.DeleteAsync(id, ct);
        return NoContent();
    }
}
