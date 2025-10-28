using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TuCita.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateSqlServer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "especialidades",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    creado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_especialidades", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<decimal>(type: "decimal(20,0)", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nombre = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    creado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    email_normalizado = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false, computedColumnSql: "LOWER([email])", stored: true),
                    password_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    nombre = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    apellido = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    telefono = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    activo = table.Column<bool>(type: "bit", nullable: false),
                    token_recuperacion = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    token_recuperacion_expira = table.Column<DateTime>(type: "datetime2(6)", nullable: true),
                    creado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "perfil_medico",
                columns: table => new
                {
                    usuario_id = table.Column<long>(type: "bigint", nullable: false),
                    numero_licencia = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true),
                    biografia = table.Column<string>(type: "NVARCHAR(MAX)", nullable: true),
                    direccion = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    creado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perfil_medico", x => x.usuario_id);
                    table.ForeignKey(
                        name: "FK_perfil_medico_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perfil_paciente",
                columns: table => new
                {
                    usuario_id = table.Column<long>(type: "bigint", nullable: false),
                    fecha_nacimiento = table.Column<DateOnly>(type: "date", nullable: true),
                    identificacion = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    telefono_emergencia = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    creado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perfil_paciente", x => x.usuario_id);
                    table.ForeignKey(
                        name: "FK_perfil_paciente_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "roles_usuarios",
                columns: table => new
                {
                    usuario_id = table.Column<long>(type: "bigint", nullable: false),
                    rol_id = table.Column<decimal>(type: "decimal(20,0)", nullable: false),
                    asignado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles_usuarios", x => new { x.usuario_id, x.rol_id });
                    table.ForeignKey(
                        name: "FK_roles_usuarios_roles_rol_id",
                        column: x => x.rol_id,
                        principalTable: "roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_roles_usuarios_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "agenda_turnos",
                columns: table => new
                {
                    id = table.Column<decimal>(type: "decimal(20,0)", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    medico_id = table.Column<long>(type: "bigint", nullable: false),
                    inicio = table.Column<DateTime>(type: "datetime2(6)", nullable: false),
                    fin = table.Column<DateTime>(type: "datetime2(6)", nullable: false),
                    estado = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    creado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agenda_turnos", x => x.id);
                    table.ForeignKey(
                        name: "FK_agenda_turnos_perfil_medico_medico_id",
                        column: x => x.medico_id,
                        principalTable: "perfil_medico",
                        principalColumn: "usuario_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "medico_especialidad",
                columns: table => new
                {
                    medico_id = table.Column<long>(type: "bigint", nullable: false),
                    especialidad_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medico_especialidad", x => new { x.medico_id, x.especialidad_id });
                    table.ForeignKey(
                        name: "FK_medico_especialidad_especialidades_especialidad_id",
                        column: x => x.especialidad_id,
                        principalTable: "especialidades",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_medico_especialidad_perfil_medico_medico_id",
                        column: x => x.medico_id,
                        principalTable: "perfil_medico",
                        principalColumn: "usuario_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "citas",
                columns: table => new
                {
                    id = table.Column<decimal>(type: "decimal(20,0)", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    turno_id = table.Column<decimal>(type: "decimal(20,0)", nullable: false),
                    medico_id = table.Column<long>(type: "bigint", nullable: false),
                    paciente_id = table.Column<long>(type: "bigint", nullable: false),
                    estado = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    motivo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    inicio = table.Column<DateTime>(type: "datetime2(6)", nullable: false),
                    fin = table.Column<DateTime>(type: "datetime2(6)", nullable: false),
                    creado_por = table.Column<long>(type: "bigint", nullable: false),
                    creado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_citas", x => x.id);
                    table.ForeignKey(
                        name: "FK_citas_agenda_turnos_turno_id",
                        column: x => x.turno_id,
                        principalTable: "agenda_turnos",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_citas_perfil_medico_medico_id",
                        column: x => x.medico_id,
                        principalTable: "perfil_medico",
                        principalColumn: "usuario_id");
                    table.ForeignKey(
                        name: "FK_citas_perfil_paciente_paciente_id",
                        column: x => x.paciente_id,
                        principalTable: "perfil_paciente",
                        principalColumn: "usuario_id");
                    table.ForeignKey(
                        name: "FK_citas_usuarios_creado_por",
                        column: x => x.creado_por,
                        principalTable: "usuarios",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "diagnosticos",
                columns: table => new
                {
                    id = table.Column<decimal>(type: "decimal(20,0)", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    cita_id = table.Column<decimal>(type: "decimal(20,0)", nullable: false),
                    codigo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    descripcion = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    creado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_diagnosticos", x => x.id);
                    table.ForeignKey(
                        name: "FK_diagnosticos_citas_cita_id",
                        column: x => x.cita_id,
                        principalTable: "citas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notas_clinicas",
                columns: table => new
                {
                    id = table.Column<decimal>(type: "decimal(20,0)", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    cita_id = table.Column<decimal>(type: "decimal(20,0)", nullable: false),
                    medico_id = table.Column<long>(type: "bigint", nullable: false),
                    paciente_id = table.Column<long>(type: "bigint", nullable: false),
                    nota = table.Column<string>(type: "NVARCHAR(MAX)", nullable: false),
                    creado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notas_clinicas", x => x.id);
                    table.ForeignKey(
                        name: "FK_notas_clinicas_citas_cita_id",
                        column: x => x.cita_id,
                        principalTable: "citas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_notas_clinicas_perfil_medico_medico_id",
                        column: x => x.medico_id,
                        principalTable: "perfil_medico",
                        principalColumn: "usuario_id");
                    table.ForeignKey(
                        name: "FK_notas_clinicas_perfil_paciente_paciente_id",
                        column: x => x.paciente_id,
                        principalTable: "perfil_paciente",
                        principalColumn: "usuario_id");
                });

            migrationBuilder.CreateTable(
                name: "notificaciones",
                columns: table => new
                {
                    id = table.Column<decimal>(type: "decimal(20,0)", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    usuario_id = table.Column<long>(type: "bigint", nullable: false),
                    cita_id = table.Column<decimal>(type: "decimal(20,0)", nullable: true),
                    canal = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    tipo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    contenido = table.Column<string>(type: "NVARCHAR(MAX)", nullable: true),
                    enviada = table.Column<bool>(type: "bit", nullable: false),
                    error = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    creado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false),
                    enviada_en = table.Column<DateTime>(type: "datetime2(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notificaciones", x => x.id);
                    table.ForeignKey(
                        name: "FK_notificaciones_citas_cita_id",
                        column: x => x.cita_id,
                        principalTable: "citas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_notificaciones_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "recetas",
                columns: table => new
                {
                    id = table.Column<decimal>(type: "decimal(20,0)", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    cita_id = table.Column<decimal>(type: "decimal(20,0)", nullable: false),
                    indicaciones = table.Column<string>(type: "NVARCHAR(MAX)", nullable: true),
                    creado_en = table.Column<DateTime>(type: "datetime2(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recetas", x => x.id);
                    table.ForeignKey(
                        name: "FK_recetas_citas_cita_id",
                        column: x => x.cita_id,
                        principalTable: "citas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "receta_items",
                columns: table => new
                {
                    id = table.Column<decimal>(type: "decimal(20,0)", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    receta_id = table.Column<decimal>(type: "decimal(20,0)", nullable: false),
                    medicamento = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    dosis = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    frecuencia = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    duracion = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true),
                    notas = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_receta_items", x => x.id);
                    table.ForeignKey(
                        name: "FK_receta_items_recetas_receta_id",
                        column: x => x.receta_id,
                        principalTable: "recetas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AgendaTurnos_Medico_Inicio_Estado",
                table: "agenda_turnos",
                columns: new[] { "medico_id", "inicio", "estado" });

            migrationBuilder.CreateIndex(
                name: "IX_citas_creado_por",
                table: "citas",
                column: "creado_por");

            migrationBuilder.CreateIndex(
                name: "IX_Citas_Medico_Inicio",
                table: "citas",
                columns: new[] { "medico_id", "inicio" });

            migrationBuilder.CreateIndex(
                name: "IX_Citas_Paciente_Inicio",
                table: "citas",
                columns: new[] { "paciente_id", "inicio" });

            migrationBuilder.CreateIndex(
                name: "IX_citas_turno_id",
                table: "citas",
                column: "turno_id");

            migrationBuilder.CreateIndex(
                name: "IX_diagnosticos_cita_id",
                table: "diagnosticos",
                column: "cita_id");

            migrationBuilder.CreateIndex(
                name: "IX_especialidades_nombre",
                table: "especialidades",
                column: "nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_medico_especialidad_especialidad_id",
                table: "medico_especialidad",
                column: "especialidad_id");

            migrationBuilder.CreateIndex(
                name: "IX_notas_clinicas_cita_id",
                table: "notas_clinicas",
                column: "cita_id");

            migrationBuilder.CreateIndex(
                name: "IX_notas_clinicas_medico_id",
                table: "notas_clinicas",
                column: "medico_id");

            migrationBuilder.CreateIndex(
                name: "IX_notas_clinicas_paciente_id",
                table: "notas_clinicas",
                column: "paciente_id");

            migrationBuilder.CreateIndex(
                name: "IX_notificaciones_cita_id",
                table: "notificaciones",
                column: "cita_id");

            migrationBuilder.CreateIndex(
                name: "IX_notificaciones_usuario_id",
                table: "notificaciones",
                column: "usuario_id");

            migrationBuilder.CreateIndex(
                name: "IX_receta_items_receta_id",
                table: "receta_items",
                column: "receta_id");

            migrationBuilder.CreateIndex(
                name: "IX_recetas_cita_id",
                table: "recetas",
                column: "cita_id");

            migrationBuilder.CreateIndex(
                name: "IX_roles_nombre",
                table: "roles",
                column: "nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_roles_usuarios_rol_id",
                table: "roles_usuarios",
                column: "rol_id");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_email_normalizado",
                table: "usuarios",
                column: "email_normalizado",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "diagnosticos");

            migrationBuilder.DropTable(
                name: "medico_especialidad");

            migrationBuilder.DropTable(
                name: "notas_clinicas");

            migrationBuilder.DropTable(
                name: "notificaciones");

            migrationBuilder.DropTable(
                name: "receta_items");

            migrationBuilder.DropTable(
                name: "roles_usuarios");

            migrationBuilder.DropTable(
                name: "especialidades");

            migrationBuilder.DropTable(
                name: "recetas");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropTable(
                name: "citas");

            migrationBuilder.DropTable(
                name: "agenda_turnos");

            migrationBuilder.DropTable(
                name: "perfil_paciente");

            migrationBuilder.DropTable(
                name: "perfil_medico");

            migrationBuilder.DropTable(
                name: "usuarios");
        }
    }
}
