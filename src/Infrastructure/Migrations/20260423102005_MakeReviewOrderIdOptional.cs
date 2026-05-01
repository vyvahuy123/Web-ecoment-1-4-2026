using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeReviewOrderIdOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_reviews_product_id_user_id_order_id",
                table: "reviews");

            migrationBuilder.AlterColumn<Guid>(
                name: "order_id",
                table: "reviews",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_product_id_user_id_order_id",
                table: "reviews",
                columns: new[] { "product_id", "user_id", "order_id" },
                unique: true,
                filter: "[order_id] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_reviews_product_id_user_id_order_id",
                table: "reviews");

            migrationBuilder.AlterColumn<Guid>(
                name: "order_id",
                table: "reviews",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_reviews_product_id_user_id_order_id",
                table: "reviews",
                columns: new[] { "product_id", "user_id", "order_id" },
                unique: true);
        }
    }
}
