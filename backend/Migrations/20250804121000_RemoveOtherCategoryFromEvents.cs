using Microsoft.EntityFrameworkCore.Migrations;

namespace project.Migrations
{
    public partial class RemoveOtherCategoryFromEvents : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OtherCategory",
                table: "Events");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OtherCategory",
                table: "Events",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
