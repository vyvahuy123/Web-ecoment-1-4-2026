using Microsoft.EntityFrameworkCore.Migrations;
#nullable disable
namespace Infrastructure.Migrations
{
    public partial class FixCartItemUniqueIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_cart_items_cart_id_product_id",
                table: "cart_items");

            migrationBuilder.CreateIndex(
                name: "IX_cart_items_cart_id_product_id_variant_id",
                table: "cart_items",
                columns: new[] { "cart_id", "product_id", "variant_id" },
                unique: true,
                filter: "[variant_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_cart_items_cart_id_product_id_no_variant",
                table: "cart_items",
                columns: new[] { "cart_id", "product_id" },
                unique: true,
                filter: "[variant_id] IS NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "IX_cart_items_cart_id_product_id_variant_id", table: "cart_items");
            migrationBuilder.DropIndex(name: "IX_cart_items_cart_id_product_id_no_variant", table: "cart_items");
            migrationBuilder.CreateIndex(name: "IX_cart_items_cart_id_product_id", table: "cart_items", columns: new[] { "cart_id", "product_id" }, unique: true);
        }
    }
}