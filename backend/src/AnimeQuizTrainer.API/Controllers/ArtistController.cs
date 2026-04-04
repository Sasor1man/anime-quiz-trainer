using AnimeQuizTrainer.Application.DTOs.Artist;
using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeQuizTrainer.API.Controllers;

/// <summary>Artist / band management.</summary>
[ApiController]
[Route("api/[controller]")]
public class ArtistController(IArtistService artistService) : ControllerBase
{
    /// <summary>Get a paged list of artists.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ArtistDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList(
        [FromQuery] string? filterText,
        [FromQuery] string? sorting,
        [FromQuery] int skipCount = 0,
        [FromQuery] int maxResultCount = 10,
        CancellationToken ct = default) =>
        Ok(await artistService.GetListAsync(filterText, sorting, skipCount, maxResultCount, ct));

    /// <summary>Get artist by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ArtistDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await artistService.GetByIdAsync(id, ct));

    /// <summary>Create an artist (admin only).</summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(ArtistDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateArtistRequest request, CancellationToken ct)
    {
        var result = await artistService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update an artist (admin only).</summary>
    [Authorize]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ArtistDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateArtistRequest request, CancellationToken ct) =>
        Ok(await artistService.UpdateAsync(id, request, ct));

    /// <summary>Delete an artist (admin only).</summary>
    [Authorize]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await artistService.DeleteAsync(id, ct);
        return NoContent();
    }
}
