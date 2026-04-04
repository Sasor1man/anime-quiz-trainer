using AnimeQuizTrainer.Application.DTOs.Anime;
using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeQuizTrainer.API.Controllers;

/// <summary>Anime management.</summary>
[ApiController]
[Route("api/[controller]")]
public class AnimeController(IAnimeService animeService) : ControllerBase
{
    /// <summary>Get a paged list of anime with tags.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<AnimeDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList(
        [FromQuery] string? filterText,
        [FromQuery] string? sorting,
        [FromQuery] int skipCount = 0,
        [FromQuery] int maxResultCount = 10,
        CancellationToken ct = default) =>
        Ok(await animeService.GetListAsync(filterText, sorting, skipCount, maxResultCount, ct));

    /// <summary>Get anime by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AnimeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await animeService.GetByIdAsync(id, ct));

    /// <summary>Create anime (admin only).</summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(AnimeDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateAnimeRequest request, CancellationToken ct)
    {
        var result = await animeService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update anime (admin only).</summary>
    [Authorize]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AnimeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAnimeRequest request, CancellationToken ct) =>
        Ok(await animeService.UpdateAsync(id, request, ct));

    /// <summary>Delete anime (admin only).</summary>
    [Authorize]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await animeService.DeleteAsync(id, ct);
        return NoContent();
    }
}
