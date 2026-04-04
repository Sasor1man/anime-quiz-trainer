using AnimeQuizTrainer.Application.DTOs.Common;
using AnimeQuizTrainer.Application.DTOs.Tag;
using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Domain.Entities;

namespace AnimeQuizTrainer.Infrastructure.Services;

public class TagService(ITagRepository tags, IUnitOfWork uow) : ITagService
{
    public async Task<PagedResult<TagDto>> GetListAsync(
        string? filterText, string? sorting, int skipCount, int maxResultCount, CancellationToken ct = default)
    {
        var (items, total) = await tags.GetPagedAsync(filterText, sorting, skipCount, maxResultCount, ct);
        return new PagedResult<TagDto>(total, items.Select(ToDto));
    }

    public async Task<TagDto> CreateAsync(CreateTagRequest request, CancellationToken ct = default)
    {
        var tag = new Tag { Name = request.Name };
        await tags.AddAsync(tag, ct);
        await uow.SaveChangesAsync(ct);
        return ToDto(tag);
    }

    public async Task<TagDto> UpdateAsync(Guid id, CreateTagRequest request, CancellationToken ct = default)
    {
        var tag = await tags.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Tag {id} not found.");
        tag.Name = request.Name;
        tags.Update(tag);
        await uow.SaveChangesAsync(ct);
        return ToDto(tag);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var tag = await tags.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Tag {id} not found.");
        tags.Delete(tag);
        await uow.SaveChangesAsync(ct);
    }

    private static TagDto ToDto(Tag t) => new(t.Id, t.Name);
}
