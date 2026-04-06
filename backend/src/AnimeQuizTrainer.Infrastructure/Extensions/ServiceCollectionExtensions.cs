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
        services.AddScoped<ISeriesRepository, SeriesRepository>();
        services.AddScoped<IAnimeRepository, AnimeRepository>();
        services.AddScoped<IOpeningRepository, OpeningRepository>();
        services.AddScoped<IArtistRepository, ArtistRepository>();
        services.AddScoped<ITagRepository, TagRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IProgressRepository, ProgressRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Services
        services.AddScoped<JwtService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IFranchiseService, FranchiseService>();
        services.AddScoped<ISeriesService, SeriesService>();
        services.AddScoped<IAnimeService, AnimeService>();
        services.AddScoped<IOpeningService, OpeningService>();
        services.AddScoped<IArtistService, ArtistService>();
        services.AddScoped<ITagService, TagService>();
        services.AddScoped<IQuizService, QuizService>();
        services.AddScoped<IProgressService, ProgressService>();

        return services;
    }
}
