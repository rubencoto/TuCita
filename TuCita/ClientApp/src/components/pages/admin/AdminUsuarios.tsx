import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Edit, Power, Trash2, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import adminUsuariosService, { Usuario, CrearUsuarioDto, ActualizarUsuarioDto } from '@/services/api/admin/adminUsuariosService';
import adminEspecialidadesService from '@/services/api/admin/adminEspecialidadesService';

const estadoColors: Record<string, string> = {
  Activo: 'bg-green-100 text-green-800',
  Inactivo: 'bg-gray-100 text-gray-800',
};

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  DOCTOR: 'bg-blue-100 text-blue-800',
  PACIENTE: 'bg-teal-100 text-teal-800',
  RECEPCION: 'bg-orange-100 text-orange-800',
};

export function AdminUsuarios() {
  // State para datos
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [paginaActual, setPaginaActual] = useState(1);
  const [especialidades, setEspecialidades] = useState<Array<{ id: number; nombre: string }>>([]);

  // State para filtros
  const [filterRole, setFilterRole] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State para modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [emailError, setEmailError] = useState('');

  // State para confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    roles: [] as string[],
    numeroLicencia: '',
    biografia: '',
    direccion: '',
    especialidadesIds: [] as number[],
    identificacion: '',
    fechaNacimiento: '',
    telefonoEmergencia: '',
    activo: true
  });

  // Cargar especialidades al montar
  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        const result = await adminEspecialidadesService.getAllEspecialidades();
        setEspecialidades(result);
      } catch (error) {
        console.error('Error al cargar especialidades:', error);
      }
    };
    cargarEspecialidades();
  }, []);

  // Cargar usuarios cuando cambian los filtros
  useEffect(() => {
    cargarUsuarios();
  }, [searchQuery, filterRole, filterStatus, paginaActual]);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const resultado = await adminUsuariosService.getUsuarios({
        busqueda: searchQuery || undefined,
        rol: filterRole !== 'Todos' ? filterRole : undefined,
        activo: filterStatus !== 'Todos' ? (filterStatus === 'Activo') : undefined,
        pagina: paginaActual,
        tamanoPagina: 10
      });
      
      setUsuarios(resultado.usuarios);
      setTotalUsuarios(resultado.total);
      setTotalPaginas(resultado.totalPaginas);
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios', {
        description: error.response?.data?.message || 'Ocurrió un error al cargar los datos'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleEspecialidadToggle = (especialidadId: number) => {
    setFormData(prev => ({
      ...prev,
      especialidadesIds: prev.especialidadesIds.includes(especialidadId)
        ? prev.especialidadesIds.filter(id => id !== especialidadId)
        : [...prev.especialidadesIds, especialidadId]
    }));
  };

  const handleEmailChange = async (email: string) => {
    setFormData({ ...formData, email });
    
    if (email.length > 3) {
      try {
        const existe = await adminUsuariosService.existeEmail(email, editingUser?.id);
        setEmailError(existe ? 'Este email ya está registrado' : '');
      } catch (error) {
        console.error('Error al verificar email:', error);
      }
    } else {
      setEmailError('');
    }
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      roles: [],
      numeroLicencia: '',
      biografia: '',
      direccion: '',
      especialidadesIds: [],
      identificacion: '',
      fechaNacimiento: '',
      telefonoEmergencia: '',
      activo: true
    });
    setEmailError('');
    setShowModal(true);
  };

  const handleEditUser = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono || '',
      roles: user.roles,
      numeroLicencia: user.numeroLicencia || '',
      biografia: '',
      direccion: '',
      especialidadesIds: [],
      identificacion: user.identificacion || '',
      fechaNacimiento: user.fechaNacimiento || '',
      telefonoEmergencia: '',
      activo: user.activo
    });
    setEmailError('');
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!formData.apellido.trim()) {
      toast.error('El apellido es requerido');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('El email es requerido');
      return;
    }
    if (formData.roles.length === 0) {
      toast.error('Debe asignar al menos un rol');
      return;
    }
    if (emailError) {
      toast.error('Por favor corrija el email');
      return;
    }

    try {
      setLoading(true);

      if (editingUser) {
        // Actualizar usuario existente
        const updateData: ActualizarUsuarioDto = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono || undefined,
          roles: formData.roles,
          activo: formData.activo,
          numeroLicencia: formData.numeroLicencia || undefined,
          biografia: formData.biografia || undefined,
          direccion: formData.direccion || undefined,
          especialidadesIds: formData.especialidadesIds.length > 0 ? formData.especialidadesIds : undefined,
          identificacion: formData.identificacion || undefined,
          fechaNacimiento: formData.fechaNacimiento || undefined,
          telefonoEmergencia: formData.telefonoEmergencia || undefined,
        };

        await adminUsuariosService.updateUsuario(editingUser.id, updateData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        const createData: CrearUsuarioDto = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          telefono: formData.telefono || undefined,
          roles: formData.roles,
          numeroLicencia: formData.numeroLicencia || undefined,
          biografia: formData.biografia || undefined,
          direccion: formData.direccion || undefined,
          especialidadesIds: formData.especialidadesIds.length > 0 ? formData.especialidadesIds : undefined,
          identificacion: formData.identificacion || undefined,
          fechaNacimiento: formData.fechaNacimiento || undefined,
          telefonoEmergencia: formData.telefonoEmergencia || undefined,
        };

        await adminUsuariosService.createUsuario(createData);
        toast.success('Usuario creado exitosamente', {
          description: 'Contraseña temporal asignada: TuCita2024!'
        });
      }

      setShowModal(false);
      cargarUsuarios();
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
      toast.error('Error al guardar usuario', {
        description: error.response?.data?.message || 'Ocurrió un error al guardar'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      await adminUsuariosService.cambiarEstado(userId, !currentActive);
      toast.success(`Usuario ${!currentActive ? 'activado' : 'desactivado'} exitosamente`);
      cargarUsuarios();
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al cambiar estado', {
        description: error.response?.data?.message || 'Ocurrió un error'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await adminUsuariosService.deleteUsuario(userToDelete);
      toast.success('Usuario eliminado exitosamente');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      cargarUsuarios();
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar usuario', {
        description: error.response?.data?.message || 'Ocurrió un error al eliminar'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de usuarios</h2>
          <p className="text-sm text-gray-500 mt-1">Administra todos los usuarios del sistema</p>
        </div>
        <Button
          onClick={handleNewUser}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo usuario
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre o correo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los roles</SelectItem>
                <SelectItem value="PACIENTE">Paciente</SelectItem>
                <SelectItem value="DOCTOR">Doctor</SelectItem>
                <SelectItem value="RECEPCION">Recepción</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los estados</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nombre completo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Correo</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Roles</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha creación</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
                    </td>
                  </tr>
                ) : usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  usuarios.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.nombreCompleto}</p>
                          {user.especialidades && user.especialidades.length > 0 && (
                            <p className="text-xs text-gray-500">{user.especialidades.join(', ')}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{user.email}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.map(role => (
                            <Badge key={role} className={roleColors[role]}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={user.activo ? estadoColors.Activo : estadoColors.Inactivo}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(user.creadoEn).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleActive(user.id, user.activo)}
                            title={user.activo ? 'Desactivar' : 'Activar'}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setUserToDelete(user.id);
                              setDeleteDialogOpen(true);
                            }}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 mt-4">
              <div className="text-sm text-gray-500">
                Mostrando {usuarios.length} de {totalUsuarios} usuarios
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual(prev => prev - 1)}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Página {paginaActual} de {totalPaginas}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaActual === totalPaginas}
                  onClick={() => setPaginaActual(prev => prev + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit User Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar usuario' : 'Crear nuevo usuario'}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Actualiza los datos del usuario. Los cambios se aplicarán inmediatamente.' 
                : 'Completa los datos del usuario. Se asignará una contraseña temporal: TuCita2024!'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Personal Data */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Datos personales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={emailError ? 'border-red-500' : ''}
                  />
                  {emailError && (
                    <p className="text-sm text-red-500 mt-1">{emailError}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* System Roles */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Roles del sistema *</h3>
              <div className="space-y-3">
                {['PACIENTE', 'DOCTOR', 'RECEPCION', 'ADMIN'].map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      id={role}
                      checked={formData.roles.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role)}
                    />
                    <Label htmlFor={role} className="cursor-pointer">
                      {role}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor-specific fields */}
            {formData.roles.includes('DOCTOR') && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Información médica</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="numeroLicencia">Número de licencia médica</Label>
                      <Input
                        id="numeroLicencia"
                        value={formData.numeroLicencia}
                        onChange={(e) => setFormData({ ...formData, numeroLicencia: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="biografia">Biografía</Label>
                      <Input
                        id="biografia"
                        value={formData.biografia}
                        onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                        placeholder="Breve descripción profesional"
                      />
                    </div>
                    <div>
                      <Label htmlFor="direccion">Dirección de consultorio</Label>
                      <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Especialidades</Label>
                      <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                        {especialidades.map((esp) => (
                          <div key={esp.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`esp-${esp.id}`}
                              checked={formData.especialidadesIds.includes(esp.id)}
                              onCheckedChange={() => handleEspecialidadToggle(esp.id)}
                            />
                            <Label htmlFor={`esp-${esp.id}`} className="cursor-pointer">
                              {esp.nombre}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Paciente-specific fields */}
            {formData.roles.includes('PACIENTE') && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Información del paciente</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="identificacion">Identificación (DNI/Pasaporte)</Label>
                      <Input
                        id="identificacion"
                        value={formData.identificacion}
                        onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                      <Input
                        id="fechaNacimiento"
                        type="date"
                        value={formData.fechaNacimiento}
                        onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefonoEmergencia">Teléfono de emergencia</Label>
                      <Input
                        id="telefonoEmergencia"
                        value={formData.telefonoEmergencia}
                        onChange={(e) => setFormData({ ...formData, telefonoEmergencia: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {editingUser && (
              <>
                <Separator />
                <div>
                  <Label htmlFor="activo">Estado</Label>
                  <Select 
                    value={formData.activo ? 'Activo' : 'Inactivo'} 
                    onValueChange={(val: string) => setFormData({ ...formData, activo: val === 'Activo' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveUser} 
              className="bg-teal-600 hover:bg-teal-700"
              disabled={loading || !!emailError}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                editingUser ? 'Actualizar usuario' : 'Crear usuario'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
              {usuarios.find(u => u.id === userToDelete)?.roles.includes('PACIENTE') && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Nota: Si el usuario tiene citas asociadas, no podrá ser eliminado.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
