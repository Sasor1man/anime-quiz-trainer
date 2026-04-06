using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Franchise;
using AnimeQuizTrainer.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeQuizTrainer.API.Controllers;

/// <summary>Franchise management.</summary>
[ApiController]
[Route("api/[controller]")]
public class FranchiseController(IFranchiseService franchiseService) : ControllerBase
{
    /// <summary>Get a paged list of franchises.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<FranchiseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList(
        [FromQuery] string? filterText,
        [FromQuery] string? sorting,
        [FromQuery] int skipCount = 0,
        [FromQuery] int maxResultCount = 10,
        CancellationToken ct = default) =>
        Ok(await franchiseService.GetListAsync(filterText, sorting, skipCount, maxResultCount, ct));

    /// <summary>Get franchise by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(FranchiseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct) =>
        Ok(await franchiseService.GetByIdAsync(id, ct));

    /// <summary>Create franchise (admin only).</summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(FranchiseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateFranchiseRequest request, CancellationToken ct)
    {
        var result = await franchiseService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update franchise (admin only).</summary>
    [Authorize]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(FranchiseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateFranchiseRequest request, CancellationToken ct) =>
        Ok(await franchiseService.UpdateAsync(id, request, ct));

    /// <summary>Delete franchise (admin only).</summary>
    [Authorize]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await franchiseService.DeleteAsync(id, ct);
        return NoContent();
    }
}
