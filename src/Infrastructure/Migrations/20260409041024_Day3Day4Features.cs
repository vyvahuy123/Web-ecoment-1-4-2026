using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Day3Day4Features : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_product_images_products_ProductId1",
                table: "product_images");

            migrationBuilder.DropIndex(
                name: "IX_product_images_ProductId1",
                table: "product_images");

            migrationBuilder.DropColumn(
                name: "ProductId1",
                table: "product_images");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ProductId1",
                table: "product_images",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_product_images_ProductId1",
                table: "product_images",
                column: "ProductId1");

            migrationBuilder.AddForeignKey(
                name: "FK_product_images_products_ProductId1",
                table: "product_images",
                column: "ProductId1",
                principalTable: "products",
                principalColumn: "id");
        }
    }
}
