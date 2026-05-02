using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnimeQuizTrainer.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class FranchiseAndSeries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FranchiseId",
                table: "Animes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<int>(
                name: "SeasonNumber",
                table: "Animes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SeriesId",
                table: "Animes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Animes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Franchises",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    NameEn = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Franchises", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Series",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    NameEn = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    FranchiseId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                name: "IX_Animes_FranchiseId",
                table: "Animes",
                column: "FranchiseId");

            migrationBuilder.CreateIndex(
                name: "IX_Animes_SeriesId",
                table: "Animes",
                column: "SeriesId");

            migrationBuilder.CreateIndex(
                name: "IX_Franchises_Name",
                table: "Franchises",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Series_FranchiseId",
                table: "Series",
                column: "FranchiseId");

            // Remove any existing anime rows that have the placeholder FranchiseId (Guid.Empty),
            // since there is no matching Franchise and the FK constraint would fail.
            // Cascades to Openings, AnimeTags and UserOpeningProgresses.
            migrationBuilder.Sql("DELETE FROM \"Animes\" WHERE \"FranchiseId\" = '00000000-0000-0000-0000-000000000000';");

            migrationBuilder.AddForeignKey(
                name: "FK_Animes_Franchises_FranchiseId",
                table: "Animes",
                column: "FranchiseId",
                principalTable: "Franchises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Animes_Series_SeriesId",
                table: "Animes",
                column: "SeriesId",
                principalTable: "Series",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Animes_Franchises_FranchiseId",
                table: "Animes");

            migrationBuilder.DropForeignKey(
                name: "FK_Animes_Series_SeriesId",
                table: "Animes");

            migrationBuilder.DropTable(
                name: "Series");

            migrationBuilder.DropTable(
                name: "Franchises");

            migrationBuilder.DropIndex(
                name: "IX_Animes_FranchiseId",
                table: "Animes");

            migrationBuilder.DropIndex(
                name: "IX_Animes_SeriesId",
                table: "Animes");

            migrationBuilder.DropColumn(
                name: "FranchiseId",
                table: "Animes");

            migrationBuilder.DropColumn(
                name: "SeasonNumber",
                table: "Animes");

            migrationBuilder.DropColumn(
                name: "SeriesId",
                table: "Animes");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Animes");
        }
    }
}
