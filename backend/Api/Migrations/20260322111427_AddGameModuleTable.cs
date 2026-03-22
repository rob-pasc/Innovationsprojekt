using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGameModuleTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SaveGames_PhishingAttempts_AttemptId",
                table: "SaveGames");

            migrationBuilder.RenameColumn(
                name: "AttemptId",
                table: "SaveGames",
                newName: "GameModuleId");

            migrationBuilder.RenameIndex(
                name: "IX_SaveGames_AttemptId",
                table: "SaveGames",
                newName: "IX_SaveGames_GameModuleId");

            // Clear existing SaveGames rows — their AttemptId values are now invalid as GameModuleId FKs.
            // This is safe in dev; GameModule seeds are recreated on next app startup.
            migrationBuilder.Sql("DELETE FROM \"SaveGames\";");

            migrationBuilder.CreateTable(
                name: "GameModules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Paths = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameModules", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_SaveGames_GameModules_GameModuleId",
                table: "SaveGames",
                column: "GameModuleId",
                principalTable: "GameModules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SaveGames_GameModules_GameModuleId",
                table: "SaveGames");

            migrationBuilder.DropTable(
                name: "GameModules");

            migrationBuilder.RenameColumn(
                name: "GameModuleId",
                table: "SaveGames",
                newName: "AttemptId");

            migrationBuilder.RenameIndex(
                name: "IX_SaveGames_GameModuleId",
                table: "SaveGames",
                newName: "IX_SaveGames_AttemptId");

            migrationBuilder.AddForeignKey(
                name: "FK_SaveGames_PhishingAttempts_AttemptId",
                table: "SaveGames",
                column: "AttemptId",
                principalTable: "PhishingAttempts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
