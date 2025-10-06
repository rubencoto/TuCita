using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TuCita.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSedeReferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_agenda_turnos_sedes_sede_id",
                table: "agenda_turnos");

            migrationBuilder.DropForeignKey(
                name: "FK_citas_sedes_sede_id",
                table: "citas");

            migrationBuilder.DropTable(
                name: "medico_sede");

            migrationBuilder.DropTable(
                name: "perfil_recepcion");

            migrationBuilder.DropTable(
                name: "sedes");

            migrationBuilder.DropIndex(
                name: "IX_citas_sede_id",
                table: "citas");

            migrationBuilder.DropIndex(
                name: "IX_agenda_turnos_sede_id",
                table: "agenda_turnos");

            migrationBuilder.DropColumn(
                name: "sede_id",
                table: "citas");

            migrationBuilder.DropColumn(
                name: "sede_id",
                table: "agenda_turnos");

            migrationBuilder.AddColumn<string>(
                name: "ciudad",
                table: "perfil_medico",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "direccion",
                table: "perfil_medico",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<double>(
                name: "latitud",
                table: "perfil_medico",
                type: "double",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "longitud",
                table: "perfil_medico",
                type: "double",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pais",
                table: "perfil_medico",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "provincia",
                table: "perfil_medico",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ciudad",
                table: "perfil_medico");

            migrationBuilder.DropColumn(
                name: "direccion",
                table: "perfil_medico");

            migrationBuilder.DropColumn(
                name: "latitud",
                table: "perfil_medico");

            migrationBuilder.DropColumn(
                name: "longitud",
                table: "perfil_medico");

            migrationBuilder.DropColumn(
                name: "pais",
                table: "perfil_medico");

            migrationBuilder.DropColumn(
                name: "provincia",
                table: "perfil_medico");

            migrationBuilder.AddColumn<uint>(
                name: "sede_id",
                table: "citas",
                type: "int unsigned",
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.AddColumn<uint>(
                name: "sede_id",
                table: "agenda_turnos",
                type: "int unsigned",
                nullable: false,
                defaultValue: 0u);

            migrationBuilder.CreateTable(
                name: "sedes",
                columns: table => new
                {
                    id = table.Column<uint>(type: "int unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    activa = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ciudad = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    direccion = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    nombre = table.Column<string>(type: "varchar(120)", maxLength: 120, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    pais = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    provincia = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    telefono = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sedes", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "medico_sede",
                columns: table => new
                {
                    medico_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    sede_id = table.Column<uint>(type: "int unsigned", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medico_sede", x => new { x.medico_id, x.sede_id });
                    table.ForeignKey(
                        name: "FK_medico_sede_perfil_medico_medico_id",
                        column: x => x.medico_id,
                        principalTable: "perfil_medico",
                        principalColumn: "usuario_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_medico_sede_sedes_sede_id",
                        column: x => x.sede_id,
                        principalTable: "sedes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "perfil_recepcion",
                columns: table => new
                {
                    usuario_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    sede_id = table.Column<uint>(type: "int unsigned", nullable: false),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perfil_recepcion", x => x.usuario_id);
                    table.ForeignKey(
                        name: "FK_perfil_recepcion_sedes_sede_id",
                        column: x => x.sede_id,
                        principalTable: "sedes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_perfil_recepcion_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_citas_sede_id",
                table: "citas",
                column: "sede_id");

            migrationBuilder.CreateIndex(
                name: "IX_agenda_turnos_sede_id",
                table: "agenda_turnos",
                column: "sede_id");

            migrationBuilder.CreateIndex(
                name: "IX_medico_sede_sede_id",
                table: "medico_sede",
                column: "sede_id");

            migrationBuilder.CreateIndex(
                name: "IX_perfil_recepcion_sede_id",
                table: "perfil_recepcion",
                column: "sede_id");

            migrationBuilder.CreateIndex(
                name: "IX_sedes_nombre",
                table: "sedes",
                column: "nombre",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_agenda_turnos_sedes_sede_id",
                table: "agenda_turnos",
                column: "sede_id",
                principalTable: "sedes",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_citas_sedes_sede_id",
                table: "citas",
                column: "sede_id",
                principalTable: "sedes",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
