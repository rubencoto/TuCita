using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuCita.Services;
using TuCita.DTOs.Admin;

namespace TuCita.Controllers.Api;

/// <summary>
/// Controlador para la administración de usuarios del sistema
/// Proporciona endpoints CRUD para gestionar usuarios y sus roles
/// Requiere autenticación con rol ADMIN
/// </summary>
[ApiController]
[Route("api/admin/usuarios")]
[Authorize(Roles = "ADMIN")]
public class AdminUsuariosController : ControllerBase
{
    private readonly IAdminUsuariosService _usuariosService;
    private readonly ILogger<AdminUsuariosController> _logger;

    /// <summary>
    /// Constructor del controlador de administración de usuarios
    /// </summary>
    public AdminUsuariosController(
        IAdminUsuariosService usuariosService,
        ILogger<AdminUsuariosController> logger)
    {
        _usuariosService = usuariosService;
        _logger = logger;
    }

    /// <summary>
    /// Obtiene todos los usuarios del sistema con filtros y paginación
    /// </summary>
    /// <param name="busqueda">Búsqueda por nombre, apellido o email</param>
    /// <param name="rol">Filtro por rol (PACIENTE, DOCTOR, ADMIN, RECEPCION)</param>
    /// <param name="activo">Filtro por estado activo</param>
    /// <param name="pagina">Número de página (default: 1)</param>
    /// <param name="tamanoPagina">Tamaño de página (default: 10)</param>
    /// <returns>Lista paginada de usuarios</returns>
    /// <response code="200">Lista de usuarios obtenida exitosamente</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet]
    public async Task<IActionResult> GetUsuarios(
        [FromQuery] string? busqueda = null,
        [FromQuery] string? rol = null,
        [FromQuery] bool? activo = null,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanoPagina = 10)
    {
        try
        {
            var filtros = new FiltrosUsuariosDto
            {
                Busqueda = busqueda,
                Rol = rol,
                Activo = activo,
                Pagina = pagina,
                TamanoPagina = tamanoPagina
            };

            var resultado = await _usuariosService.GetUsuariosAsync(filtros);
            return Ok(resultado);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener usuarios");
            return StatusCode(500, new { message = "Error al obtener usuarios", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene un usuario específico por ID
    /// </summary>
    /// <param name="id">ID del usuario</param>
    /// <returns>Datos completos del usuario</returns>
    /// <response code="200">Usuario encontrado</response>
    /// <response code="404">Usuario no encontrado</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUsuarioById(long id)
    {
        try
        {
            var usuario = await _usuariosService.GetUsuarioByIdAsync(id);

            if (usuario == null)
            {
                return NotFound(new { message = "Usuario no encontrado" });
            }

            return Ok(usuario);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener usuario {Id}", id);
            return StatusCode(500, new { message = "Error al obtener usuario", error = ex.Message });
        }
    }

    /// <summary>
    /// Crea un nuevo usuario en el sistema
    /// </summary>
    /// <param name="dto">Datos del nuevo usuario</param>
    /// <returns>Usuario creado</returns>
    /// <response code="201">Usuario creado exitosamente</response>
    /// <response code="400">Datos inválidos o email duplicado</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPost]
    public async Task<IActionResult> CreateUsuario([FromBody] CrearUsuarioDto dto)
    {
        try
        {
            // Validaciones básicas
            if (string.IsNullOrWhiteSpace(dto.Nombre))
            {
                return BadRequest(new { message = "El nombre es requerido" });
            }

            if (string.IsNullOrWhiteSpace(dto.Apellido))
            {
                return BadRequest(new { message = "El apellido es requerido" });
            }

            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(new { message = "El email es requerido" });
            }

            if (dto.Roles == null || !dto.Roles.Any())
            {
                return BadRequest(new { message = "Debe asignar al menos un rol" });
            }

            var usuario = await _usuariosService.CreateUsuarioAsync(dto);

            return CreatedAtAction(
                nameof(GetUsuarioById),
                new { id = usuario.Id },
                usuario
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al crear usuario");
            return StatusCode(500, new { message = "Error al crear usuario", error = ex.Message });
        }
    }

    /// <summary>
    /// Actualiza un usuario existente
    /// </summary>
    /// <param name="id">ID del usuario a actualizar</param>
    /// <param name="dto">Nuevos datos del usuario</param>
    /// <returns>Usuario actualizado</returns>
    /// <response code="200">Usuario actualizado exitosamente</response>
    /// <response code="400">Datos inválidos o email duplicado</response>
    /// <response code="404">Usuario no encontrado</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUsuario(long id, [FromBody] ActualizarUsuarioDto dto)
    {
        try
        {
            // Validaciones básicas
            if (string.IsNullOrWhiteSpace(dto.Nombre))
            {
                return BadRequest(new { message = "El nombre es requerido" });
            }

            if (string.IsNullOrWhiteSpace(dto.Apellido))
            {
                return BadRequest(new { message = "El apellido es requerido" });
            }

            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                return BadRequest(new { message = "El email es requerido" });
            }

            if (dto.Roles == null || !dto.Roles.Any())
            {
                return BadRequest(new { message = "Debe asignar al menos un rol" });
            }

            var usuario = await _usuariosService.UpdateUsuarioAsync(id, dto);
            return Ok(usuario);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("no encontrado"))
            {
                return NotFound(new { message = ex.Message });
            }
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar usuario {Id}", id);
            return StatusCode(500, new { message = "Error al actualizar usuario", error = ex.Message });
        }
    }

    /// <summary>
    /// Cambia el estado (activo/inactivo) de un usuario
    /// </summary>
    /// <param name="id">ID del usuario</param>
    /// <param name="dto">Nuevo estado</param>
    /// <returns>Resultado de la operación</returns>
    /// <response code="200">Estado cambiado exitosamente</response>
    /// <response code="404">Usuario no encontrado</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPatch("{id}/estado")]
    public async Task<IActionResult> CambiarEstadoUsuario(long id, [FromBody] CambiarEstadoUsuarioDto dto)
    {
        try
        {
            await _usuariosService.CambiarEstadoUsuarioAsync(id, dto.Activo);
            return Ok(new { message = $"Usuario {(dto.Activo ? "activado" : "desactivado")} exitosamente" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cambiar estado del usuario {Id}", id);
            return StatusCode(500, new { message = "Error al cambiar estado", error = ex.Message });
        }
    }

    /// <summary>
    /// Cambia la contraseña de un usuario
    /// </summary>
    /// <param name="id">ID del usuario</param>
    /// <param name="dto">Nueva contraseña</param>
    /// <returns>Resultado de la operación</returns>
    /// <response code="200">Contraseña cambiada exitosamente</response>
    /// <response code="400">Contraseña inválida</response>
    /// <response code="404">Usuario no encontrado</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpPatch("{id}/password")]
    public async Task<IActionResult> CambiarPassword(long id, [FromBody] CambiarPasswordAdminDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.NuevaPassword))
            {
                return BadRequest(new { message = "La contraseña es requerida" });
            }

            if (dto.NuevaPassword.Length < 6)
            {
                return BadRequest(new { message = "La contraseña debe tener al menos 6 caracteres" });
            }

            await _usuariosService.CambiarPasswordAsync(id, dto.NuevaPassword);
            return Ok(new { message = "Contraseña actualizada exitosamente" });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cambiar contraseña del usuario {Id}", id);
            return StatusCode(500, new { message = "Error al cambiar contraseña", error = ex.Message });
        }
    }

    /// <summary>
    /// Elimina un usuario del sistema
    /// </summary>
    /// <param name="id">ID del usuario a eliminar</param>
    /// <returns>Resultado de la operación</returns>
    /// <response code="204">Usuario eliminado exitosamente</response>
    /// <response code="400">No se puede eliminar porque tiene citas asociadas</response>
    /// <response code="404">Usuario no encontrado</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(long id)
    {
        try
        {
            await _usuariosService.DeleteUsuarioAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("no encontrado"))
            {
                return NotFound(new { message = ex.Message });
            }
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al eliminar usuario {Id}", id);
            return StatusCode(500, new { message = "Error al eliminar usuario", error = ex.Message });
        }
    }

    /// <summary>
    /// Verifica si existe un usuario con el email especificado
    /// </summary>
    /// <param name="email">Email a verificar</param>
    /// <param name="excludeId">ID a excluir de la búsqueda (para ediciones)</param>
    /// <returns>True si existe, false si no</returns>
    /// <response code="200">Resultado de la verificación</response>
    /// <response code="401">Usuario no autenticado o sin rol ADMIN</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("existe-email")]
    public async Task<IActionResult> ExisteEmail(
        [FromQuery] string email,
        [FromQuery] long? excludeId = null)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest(new { message = "El email es requerido" });
            }

            var existe = await _usuariosService.ExisteEmailAsync(email, excludeId);
            return Ok(new { existe });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al verificar existencia de email");
            return StatusCode(500, new { message = "Error al verificar email", error = ex.Message });
        }
    }
}
