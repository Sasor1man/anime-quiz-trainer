using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Tag;
using AnimeQuizTrainer.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnimeQuizTrainer.API.Controllers;

/// <summary>Tag management.</summary>
[ApiController]
[Route("api/[controller]")]
public class TagController(ITagService tagService) : ControllerBase
{
    /// <summary>Get a paged list of tags.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<TagDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetList(
        [FromQuery] string? filterText,
        [FromQuery] string? sorting,
        [FromQuery] int skipCount = 0,
        [FromQuery] int maxResultCount = 10,
        CancellationToken ct = default) =>
        Ok(await tagService.GetListAsync(filterText, sorting, skipCount, maxResultCount, ct));

    /// <summary>Create a tag (admin only).</summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(TagDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateTagRequest request, CancellationToken ct)
    {
        var result = await tagService.CreateAsync(request, ct);
        return Created(string.Empty, result);
    }

    /// <summary>Update a tag (admin only).</summary>
    [Authorize]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TagDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateTagRequest request, CancellationToken ct) =>
        Ok(await tagService.UpdateAsync(id, request, ct));

    /// <summary>Delete a tag (admin only).</summary>
    [Authorize]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await tagService.DeleteAsync(id, ct);
        return NoContent();
    }
}
