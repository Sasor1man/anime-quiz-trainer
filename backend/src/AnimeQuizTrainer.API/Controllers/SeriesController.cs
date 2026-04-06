using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Series;
using AnimeQuizTrainer.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeQuizTrainer.API.Controllers;

/// <summary>Series management.</summary>
[ApiController]
[Route("api/[controller]")]
public class SeriesController(ISeriesService seriesService) : ControllerBase
{
    /// <summary>Get a paged list of series, optionally filtered by franchise.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<SeriesDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList(
        [FromQuery] Guid? franchiseId,
        [FromQuery] string? filterText,
        [FromQuery] string? sorting,
        [FromQuery] int skipCount = 0,
        [FromQuery] int maxResultCount = 10,
        CancellationToken ct = default) =>
        Ok(await seriesService.GetListAsync(franchiseId, filterText, sorting, skipCount, maxResultCount, ct));

    /// <summary>Get series by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SeriesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await seriesService.GetByIdAsync(id, ct));

    /// <summary>Create series (admin only).</summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(SeriesDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateSeriesRequest request, CancellationToken ct)
    {
        var result = await seriesService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update series (admin only).</summary>
    [Authorize]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SeriesDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateSeriesRequest request, CancellationToken ct) =>
        Ok(await seriesService.UpdateAsync(id, request, ct));

    /// <summary>Delete series (admin only).</summary>
    [Authorize]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await seriesService.DeleteAsync(id, ct);
        return NoContent();
    }
}
