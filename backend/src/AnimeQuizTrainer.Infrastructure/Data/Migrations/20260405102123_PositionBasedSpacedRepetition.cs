using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnimeQuizTrainer.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class PositionBasedSpacedRepetition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastReviewedAt",
                table: "UserOpeningProgresses");

            migrationBuilder.DropColumn(
                name: "NextReviewAt",
                table: "UserOpeningProgresses");

            migrationBuilder.RenameColumn(
                name: "IntervalDays",
                table: "UserOpeningProgresses",
                newName: "GapSize");

            migrationBuilder.AddColumn<long>(
                name: "QuizPosition",
                table: "Users",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "NextShowPosition",
                table: "UserOpeningProgresses",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuizPosition",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "NextShowPosition",
                table: "UserOpeningProgresses");

            migrationBuilder.RenameColumn(
                name: "GapSize",
                table: "UserOpeningProgresses",
                newName: "IntervalDays");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastReviewedAt",
                table: "UserOpeningProgresses",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextReviewAt",
                table: "UserOpeningProgresses",
                type: "timestamp with time zone",
                nullable: true);
        }
    }
}
