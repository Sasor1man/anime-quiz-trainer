using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnimeQuizTrainer.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameSongsAndTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserOpeningProgresses");

            migrationBuilder.DropTable(
                name: "Openings");

            migrationBuilder.CreateTable(
                name: "Songs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AnimeEntryId = table.Column<Guid>(type: "uuid", nullable: false),
                    ArtistId = table.Column<Guid>(type: "uuid", nullable: false),
                    SongTitle = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    YoutubeUrl = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    OrderNumber = table.Column<int>(type: "integer", nullable: false),
                    Difficulty = table.Column<string>(type: "text", nullable: false),
                    StartTiming = table.Column<double>(type: "double precision", nullable: true),
                    ChorusTiming = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Songs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Songs_AnimeEntries_AnimeEntryId",
                        column: x => x.AnimeEntryId,
                        principalTable: "AnimeEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Songs_Artists_ArtistId",
                        column: x => x.ArtistId,
                        principalTable: "Artists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserSongProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SongId = table.Column<Guid>(type: "uuid", nullable: false),
                    EaseFactor = table.Column<double>(type: "double precision", nullable: false),
                    GapSize = table.Column<int>(type: "integer", nullable: false),
                    NextShowPosition = table.Column<long>(type: "bigint", nullable: true),
                    ReviewCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSongProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSongProgresses_Songs_SongId",
                        column: x => x.SongId,
                        principalTable: "Songs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserSongProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Songs_AnimeEntryId_Type_OrderNumber",
                table: "Songs",
                columns: new[] { "AnimeEntryId", "Type", "OrderNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Songs_ArtistId",
                table: "Songs",
                column: "ArtistId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSongProgresses_SongId",
                table: "UserSongProgresses",
                column: "SongId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSongProgresses_UserId_SongId",
                table: "UserSongProgresses",
                columns: new[] { "UserId", "SongId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserSongProgresses");

            migrationBuilder.DropTable(
                name: "Songs");

            migrationBuilder.CreateTable(
                name: "Openings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AnimeEntryId = table.Column<Guid>(type: "uuid", nullable: false),
                    ArtistId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChorusTiming = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Difficulty = table.Column<string>(type: "text", nullable: false),
                    OrderNumber = table.Column<int>(type: "integer", nullable: false),
                    SongTitle = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    StartTiming = table.Column<double>(type: "double precision", nullable: true),
                    YoutubeUrl = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Openings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Openings_AnimeEntries_AnimeEntryId",
                        column: x => x.AnimeEntryId,
                        principalTable: "AnimeEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Openings_Artists_ArtistId",
                        column: x => x.ArtistId,
                        principalTable: "Artists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserOpeningProgresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OpeningId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    EaseFactor = table.Column<double>(type: "double precision", nullable: false),
                    GapSize = table.Column<int>(type: "integer", nullable: false),
                    NextShowPosition = table.Column<long>(type: "bigint", nullable: true),
                    ReviewCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserOpeningProgresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserOpeningProgresses_Openings_OpeningId",
                        column: x => x.OpeningId,
                        principalTable: "Openings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserOpeningProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Openings_AnimeEntryId_OrderNumber",
                table: "Openings",
                columns: new[] { "AnimeEntryId", "OrderNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Openings_ArtistId",
                table: "Openings",
                column: "ArtistId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOpeningProgresses_OpeningId",
                table: "UserOpeningProgresses",
                column: "OpeningId");

            migrationBuilder.CreateIndex(
                name: "IX_UserOpeningProgresses_UserId_OpeningId",
                table: "UserOpeningProgresses",
                columns: new[] { "UserId", "OpeningId" },
                unique: true);
        }
    }
}
