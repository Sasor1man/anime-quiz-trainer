using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnimeQuizTrainer.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AnimeEntryHierarchy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Animes_Franchises_FranchiseId",
                table: "Animes");

            migrationBuilder.DropForeignKey(
                name: "FK_Animes_Series_SeriesId",
                table: "Animes");

            migrationBuilder.DropForeignKey(
                name: "FK_Openings_Animes_AnimeId",
                table: "Openings");

            migrationBuilder.DropColumn(
                name: "SeasonNumber",
                table: "Animes");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Animes");

            migrationBuilder.RenameColumn(
                name: "AnimeId",
                table: "Openings",
                newName: "AnimeEntryId");

            migrationBuilder.RenameIndex(
                name: "IX_Openings_AnimeId_OrderNumber",
                table: "Openings",
                newName: "IX_Openings_AnimeEntryId_OrderNumber");

            migrationBuilder.AlterColumn<string>(
                name: "NameEn",
                table: "Series",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Series",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<Guid>(
                name: "FranchiseId",
                table: "Animes",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateTable(
                name: "AnimeEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    TitleEn = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    AnimeId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnimeEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnimeEntries_Animes_AnimeId",
                        column: x => x.AnimeId,
                        principalTable: "Animes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnimeEntries_AnimeId",
                table: "AnimeEntries",
                column: "AnimeId");

            migrationBuilder.CreateIndex(
                name: "IX_AnimeEntries_Title",
                table: "AnimeEntries",
                column: "Title");

            migrationBuilder.AddForeignKey(
                name: "FK_Animes_Franchises_FranchiseId",
                table: "Animes",
                column: "FranchiseId",
                principalTable: "Franchises",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Animes_Series_SeriesId",
                table: "Animes",
                column: "SeriesId",
                principalTable: "Series",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Openings_AnimeEntries_AnimeEntryId",
                table: "Openings",
                column: "AnimeEntryId",
                principalTable: "AnimeEntries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
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

            migrationBuilder.DropForeignKey(
                name: "FK_Openings_AnimeEntries_AnimeEntryId",
                table: "Openings");

            migrationBuilder.DropTable(
                name: "AnimeEntries");

            migrationBuilder.RenameColumn(
                name: "AnimeEntryId",
                table: "Openings",
                newName: "AnimeId");

            migrationBuilder.RenameIndex(
                name: "IX_Openings_AnimeEntryId_OrderNumber",
                table: "Openings",
                newName: "IX_Openings_AnimeId_OrderNumber");

            migrationBuilder.AlterColumn<string>(
                name: "NameEn",
                table: "Series",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Series",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<Guid>(
                name: "FranchiseId",
                table: "Animes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SeasonNumber",
                table: "Animes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Animes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Openings_Animes_AnimeId",
                table: "Openings",
                column: "AnimeId",
                principalTable: "Animes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
