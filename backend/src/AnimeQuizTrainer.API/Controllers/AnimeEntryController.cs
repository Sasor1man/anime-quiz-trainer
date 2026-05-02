using AnimeQuizTrainer.Application.DTOs.AnimeEntry;
using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeQuizTrainer.API.Controllers;

/// <summary>AnimeEntry management (seasons, movies, OVAs, etc.).</summary>
[ApiController]
[Route("api/[controller]")]
public class AnimeEntryController(IAnimeEntryService animeEntryService) : ControllerBase
{
    /// <summary>Get a paged list of anime entries, optionally filtered by anime.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AnimeEntryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList(
        [FromQuery] Guid? animeId,
        [FromQuery] string? filterText,
        [FromQuery] string? sorting,
        [FromQuery] int skipCount = 0,
        [FromQuery] int maxResultCount = 10,
        CancellationToken ct = default) =>
        Ok(await animeEntryService.GetListAsync(animeId, filterText, sorting, skipCount, maxResultCount, ct));

    /// <summary>Get anime entry by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AnimeEntryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await animeEntryService.GetByIdAsync(id, ct));

    /// <summary>Create anime entry (admin only).</summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(AnimeEntryDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateAnimeEntryRequest request, CancellationToken ct)
    {
        var result = await animeEntryService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update anime entry (admin only).</summary>
    [Authorize]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AnimeEntryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAnimeEntryRequest request, CancellationToken ct) =>
        Ok(await animeEntryService.UpdateAsync(id, request, ct));

    /// <summary>Delete anime entry (admin only).</summary>
    [Authorize]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await animeEntryService.DeleteAsync(id, ct);
        return NoContent();
    }
}
