using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnimeQuizTrainer.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSeriesNavigationFromFranchise : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Animes_Series_SeriesId",
                table: "Animes");

            migrationBuilder.DropTable(
                name: "Series");

            migrationBuilder.DropIndex(
                name: "IX_Animes_SeriesId",
                table: "Animes");

            migrationBuilder.DropColumn(
                name: "SeriesId",
                table: "Animes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SeriesId",
                table: "Animes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Series",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FranchiseId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    NameEn = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Series", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Series_Franchises_FranchiseId",
                        column: x => x.FranchiseId,
                        principalTable: "Franchises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Animes_SeriesId",
                table: "Animes",
                column: "SeriesId");

            migrationBuilder.CreateIndex(
                name: "IX_Series_FranchiseId",
                table: "Series",
                column: "FranchiseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Animes_Series_SeriesId",
                table: "Animes",
                column: "SeriesId",
                principalTable: "Series",
                principalColumn: "Id");
        }
    }
}
