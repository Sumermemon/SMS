using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SchoolManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "system_settings",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    site_name = table.Column<string>(type: "text", nullable: false),
                    site_tagline = table.Column<string>(type: "text", nullable: true),
                    logo_url = table.Column<string>(type: "text", nullable: true),
                    contact_email = table.Column<string>(type: "text", nullable: true),
                    contact_phone = table.Column<string>(type: "text", nullable: true),
                    address = table.Column<string>(type: "text", nullable: true),
                    footer_text = table.Column<string>(type: "text", nullable: true),
                    facebook_url = table.Column<string>(type: "text", nullable: true),
                    twitter_url = table.Column<string>(type: "text", nullable: true),
                    instagram_url = table.Column<string>(type: "text", nullable: true),
                    linked_in_url = table.Column<string>(type: "text", nullable: true),
                    you_tube_url = table.Column<string>(type: "text", nullable: true),
                    git_hub_url = table.Column<string>(type: "text", nullable: true),
                    smtp_host = table.Column<string>(type: "text", nullable: true),
                    smtp_port = table.Column<int>(type: "integer", nullable: false),
                    smtp_username = table.Column<string>(type: "text", nullable: true),
                    smtp_password = table.Column<string>(type: "text", nullable: true),
                    smtp_sender_email = table.Column<string>(type: "text", nullable: true),
                    smtp_sender_name = table.Column<string>(type: "text", nullable: true),
                    smtp_enable_ssl = table.Column<bool>(type: "boolean", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_by = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_system_settings", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "system_settings");
        }
    }
}
