using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TuCita.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "especialidades",
                columns: table => new
                {
                    id = table.Column<uint>(type: "int unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    nombre = table.Column<string>(type: "varchar(120)", maxLength: 120, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_especialidades", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    id = table.Column<ulong>(type: "bigint unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    nombre = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "sedes",
                columns: table => new
                {
                    id = table.Column<uint>(type: "int unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    nombre = table.Column<string>(type: "varchar(120)", maxLength: 120, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    direccion = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ciudad = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    provincia = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    pais = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    telefono = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    activa = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sedes", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    id = table.Column<ulong>(type: "bigint unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    email = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    email_normalizado = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false, computedColumnSql: "LOWER(email)", stored: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    password_hash = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    nombre = table.Column<string>(type: "varchar(80)", maxLength: 80, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    apellido = table.Column<string>(type: "varchar(80)", maxLength: 80, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    telefono = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    activo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "perfil_medico",
                columns: table => new
                {
                    usuario_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    numero_licencia = table.Column<string>(type: "varchar(60)", maxLength: 60, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    biografia = table.Column<string>(type: "TEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
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
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "perfil_paciente",
                columns: table => new
                {
                    usuario_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    fecha_nacimiento = table.Column<DateOnly>(type: "date", nullable: true),
                    identificacion = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    telefono_emergencia = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "roles_usuarios",
                columns: table => new
                {
                    usuario_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    rol_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    asignado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
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
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "agenda_turnos",
                columns: table => new
                {
                    id = table.Column<ulong>(type: "bigint unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    medico_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    sede_id = table.Column<uint>(type: "int unsigned", nullable: false),
                    inicio = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    fin = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    estado = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
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
                    table.ForeignKey(
                        name: "FK_agenda_turnos_sedes_sede_id",
                        column: x => x.sede_id,
                        principalTable: "sedes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "medico_especialidad",
                columns: table => new
                {
                    medico_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    especialidad_id = table.Column<uint>(type: "int unsigned", nullable: false)
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
                name: "citas",
                columns: table => new
                {
                    id = table.Column<ulong>(type: "bigint unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    turno_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    medico_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    paciente_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    sede_id = table.Column<uint>(type: "int unsigned", nullable: false),
                    estado = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    motivo = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    inicio = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    fin = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    creado_por = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    actualizado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
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
                        principalColumn: "usuario_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_citas_perfil_paciente_paciente_id",
                        column: x => x.paciente_id,
                        principalTable: "perfil_paciente",
                        principalColumn: "usuario_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_citas_sedes_sede_id",
                        column: x => x.sede_id,
                        principalTable: "sedes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_citas_usuarios_creado_por",
                        column: x => x.creado_por,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "diagnosticos",
                columns: table => new
                {
                    id = table.Column<ulong>(type: "bigint unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    cita_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    codigo = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    descripcion = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
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
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "notas_clinicas",
                columns: table => new
                {
                    id = table.Column<ulong>(type: "bigint unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    cita_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    medico_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    paciente_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    nota = table.Column<string>(type: "TEXT", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
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
                        principalColumn: "usuario_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_notas_clinicas_perfil_paciente_paciente_id",
                        column: x => x.paciente_id,
                        principalTable: "perfil_paciente",
                        principalColumn: "usuario_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "notificaciones",
                columns: table => new
                {
                    id = table.Column<ulong>(type: "bigint unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    usuario_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    cita_id = table.Column<ulong>(type: "bigint unsigned", nullable: true),
                    canal = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tipo = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    contenido = table.Column<string>(type: "JSON", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    enviada = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    error = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    enviada_en = table.Column<DateTime>(type: "datetime(6)", nullable: true)
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
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "recetas",
                columns: table => new
                {
                    id = table.Column<ulong>(type: "bigint unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    cita_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    indicaciones = table.Column<string>(type: "TEXT", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    creado_en = table.Column<DateTime>(type: "datetime(6)", nullable: false)
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
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "receta_items",
                columns: table => new
                {
                    id = table.Column<ulong>(type: "bigint unsigned", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    receta_id = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    medicamento = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    dosis = table.Column<string>(type: "varchar(80)", maxLength: 80, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    frecuencia = table.Column<string>(type: "varchar(80)", maxLength: 80, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    duracion = table.Column<string>(type: "varchar(80)", maxLength: 80, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    notas = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
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
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_agenda_turnos_medico_id",
                table: "agenda_turnos",
                column: "medico_id");

            migrationBuilder.CreateIndex(
                name: "IX_agenda_turnos_sede_id",
                table: "agenda_turnos",
                column: "sede_id");

            migrationBuilder.CreateIndex(
                name: "IX_citas_creado_por",
                table: "citas",
                column: "creado_por");

            migrationBuilder.CreateIndex(
                name: "IX_citas_medico_id",
                table: "citas",
                column: "medico_id");

            migrationBuilder.CreateIndex(
                name: "IX_citas_paciente_id",
                table: "citas",
                column: "paciente_id");

            migrationBuilder.CreateIndex(
                name: "IX_citas_sede_id",
                table: "citas",
                column: "sede_id");

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
                name: "IX_medico_sede_sede_id",
                table: "medico_sede",
                column: "sede_id");

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
                name: "IX_perfil_recepcion_sede_id",
                table: "perfil_recepcion",
                column: "sede_id");

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
                name: "IX_sedes_nombre",
                table: "sedes",
                column: "nombre",
                unique: true);

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
                name: "medico_sede");

            migrationBuilder.DropTable(
                name: "notas_clinicas");

            migrationBuilder.DropTable(
                name: "notificaciones");

            migrationBuilder.DropTable(
                name: "perfil_recepcion");

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
                name: "sedes");

            migrationBuilder.DropTable(
                name: "usuarios");
        }
    }
}
