using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class SplitGameModuleTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Rename the existing PhishingDetective module to PhishingEmailQuiz
            migrationBuilder.Sql(
                "UPDATE \"GameModules\" SET \"Type\" = 'PhishingEmailQuiz' WHERE \"Type\" = 'PhishingDetective';"
            );

            // Insert the new PhishingEmailForensics module row
            migrationBuilder.Sql(
                "INSERT INTO \"GameModules\" (\"Id\", \"Type\", \"Paths\") " +
                "VALUES ('cccccccc-0000-0000-0000-000000000002', 'PhishingEmailForensics', NULL) " +
                "ON CONFLICT (\"Id\") DO NOTHING;"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "DELETE FROM \"GameModules\" WHERE \"Id\" = 'cccccccc-0000-0000-0000-000000000002';"
            );

            migrationBuilder.Sql(
                "UPDATE \"GameModules\" SET \"Type\" = 'PhishingDetective' WHERE \"Type\" = 'PhishingEmailQuiz';"
            );
        }
    }
}
