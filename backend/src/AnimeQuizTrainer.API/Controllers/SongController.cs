using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Song;
using AnimeQuizTrainer.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeQuizTrainer.API.Controllers;

/// <summary>Song management.</summary>
[ApiController]
[Route("api/[controller]")]
public class SongController(ISongService songService) : ControllerBase
{
    /// <summary>Get a paged list of songs.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<SongDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList(
        [FromQuery] string? filterText,
        [FromQuery] string? sorting,
        [FromQuery] int skipCount = 0,
        [FromQuery] int maxResultCount = 10,
        CancellationToken ct = default) =>
        Ok(await songService.GetListAsync(filterText, sorting, skipCount, maxResultCount, ct));

    /// <summary>Get song by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SongDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await songService.GetByIdAsync(id, ct));

    /// <summary>Get a paged list of songs for a specific anime entry.</summary>
    [HttpGet("by-anime-entry/{animeEntryId:guid}")]
    [ProducesResponseType(typeof(PagedResult<SongDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetListByAnimeEntry(
        Guid animeEntryId,
        [FromQuery] string? filterText,
        [FromQuery] string? sorting,
        [FromQuery] int skipCount = 0,
        [FromQuery] int maxResultCount = 10,
        CancellationToken ct = default) =>
        Ok(await songService.GetListByAnimeEntryIdAsync(animeEntryId, filterText, sorting, skipCount, maxResultCount, ct));

    /// <summary>Create a song (admin only).</summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(SongDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateSongRequest request, CancellationToken ct)
    {
        var result = await songService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update a song (admin only).</summary>
    [Authorize]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SongDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSongRequest request, CancellationToken ct) =>
        Ok(await songService.UpdateAsync(id, request, ct));

    /// <summary>Delete a song (admin only).</summary>
    [Authorize]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await songService.DeleteAsync(id, ct);
        return NoContent();
    }
}
