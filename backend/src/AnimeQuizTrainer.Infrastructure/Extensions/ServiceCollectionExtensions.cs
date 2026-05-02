using AnimeQuizTrainer.Application.Interfaces;
using AnimeQuizTrainer.Application.Services;
using AnimeQuizTrainer.Infrastructure.Data;
using AnimeQuizTrainer.Infrastructure.Repositories;
using AnimeQuizTrainer.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AnimeQuizTrainer.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped<IFranchiseRepository, FranchiseRepository>();
        services.AddScoped<IAnimeRepository, AnimeRepository>();
        services.AddScoped<IAnimeEntryRepository, AnimeEntryRepository>();
        services.AddScoped<ISongRepository, SongRepository>();
        services.AddScoped<IArtistRepository, ArtistRepository>();
        services.AddScoped<ITagRepository, TagRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IProgressRepository, ProgressRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Services
        services.AddScoped<JwtService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IFranchiseService, FranchiseService>();
        services.AddScoped<IAnimeService, AnimeService>();
        services.AddScoped<IAnimeEntryService, AnimeEntryService>();
        services.AddScoped<ISongService, SongService>();
        services.AddScoped<IArtistService, ArtistService>();
        services.AddScoped<ITagService, TagService>();
        services.AddScoped<IQuizService, QuizService>();
        services.AddScoped<IProgressService, ProgressService>();

        return services;
    }
}
