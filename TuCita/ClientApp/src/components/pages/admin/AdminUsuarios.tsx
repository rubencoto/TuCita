import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PhoneInput } from '@/components/ui/phone-input';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Search, Edit, Power, Trash2, Loader2, User, Stethoscope, UserCog } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import adminEspecialidadesService from '@/services/api/admin/adminEspecialidadesService';
import { 
  useAdminUsuarios,
  useAdminEspecialidades,
  useCreateUsuario,
  useUpdateUsuario,
  useCambiarEstadoUsuario,
  useDeleteUsuario
} from '@/hooks/queries';
import adminUsuariosService, { Usuario, CrearUsuarioDto, ActualizarUsuarioDto } from '@/services/api/admin/adminUsuariosService';

const estadoColors: Record<string, string> = {
  Activo: 'bg-green-100 text-green-800',
  Inactivo: 'bg-gray-100 text-gray-800',
};

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800',
  MEDICO: 'bg-blue-100 text-blue-800',
  PACIENTE: 'bg-teal-100 text-teal-800',
  RECEPCION: 'bg-orange-100 text-orange-800',
};

// Definición de roles con sus íconos y descripciones
const ROLES_INFO = {
  PACIENTE: {
    id: 1,
    nombre: 'PACIENTE',
    label: 'Paciente',
    icon: User,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    description: 'Usuario que agenda y asiste a citas médicas'
  },
  MEDICO: {
    id: 2,
    nombre: 'MEDICO',
    label: 'Médico',
    icon: Stethoscope,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Profesional de salud que atiende consultas'
  },
  ADMIN: {
    id: 3,
    nombre: 'ADMIN',
    label: 'Administrador',
    icon: UserCog,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Gestiona todo el sistema y usuarios'
  }
};

// Función para generar email automático basado en nombre, apellido y rol
const generarEmailAutomatico = (nombre: string, apellido: string, rol: string): string => {
  // Limpiar y normalizar strings (quitar espacios, convertir a minúsculas, quitar acentos)
  const limpiarTexto = (texto: string): string => {
    return texto
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/\s+/g, ''); // Quitar espacios
  };

  const nombreLimpio = limpiarTexto(nombre);
  const apellidoLimpio = limpiarTexto(apellido);

  if (!nombreLimpio || !apellidoLimpio) {
    return '';
  }

  if (rol === 'MEDICO') {
    return `dr.${nombreLimpio}${apellidoLimpio}@tucitaonline.org`;
  } else if (rol === 'ADMIN') {
    return `${nombreLimpio}${apellidoLimpio}@tucitaonline.org`;
  }
  
  return ''; // Para PACIENTE, el email se ingresa manualmente
};

export function AdminUsuarios() {
  // State para filtros
  const [filterRole, setFilterRole] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  
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
    rol: '',
    numeroLicencia: '',
    biografia: '',
    direccion: '',
    especialidadesIds: [] as number[],
    identificacion: '',
    fechaNacimiento: '',
    telefonoEmergencia: '',
    activo: true
  });

  // 🎯 REACT QUERY: Obtener usuarios con filtros
  const { data: usuariosData, isLoading: loading } = useAdminUsuarios({
    busqueda: searchQuery || undefined,
    rol: filterRole !== 'Todos' ? filterRole : undefined,
    activo: filterStatus !== 'Todos' ? (filterStatus === 'Activo') : undefined,
    pagina: paginaActual,
    tamanoPagina: 10
  });

  // 🎯 REACT QUERY: Obtener especialidades
  const { data: especialidades = [] } = useAdminEspecialidades();

  // 🎯 REACT QUERY: Mutations
  const createUsuario = useCreateUsuario();
  const updateUsuario = useUpdateUsuario();
  const cambiarEstado = useCambiarEstadoUsuario();
  const deleteUsuario = useDeleteUsuario();

  // Extract data with defaults
  const usuarios = usuariosData?.usuarios || [];
  const totalUsuarios = usuariosData?.total || 0;
  const totalPaginas = usuariosData?.totalPaginas || 1;

  // Reset page when filters change
  useEffect(() => {
    setPaginaActual(1);
  }, [searchQuery, filterRole, filterStatus]);

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
      rol: '', // CAMBIADO
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

  // Función para manejar cambio en nombre o apellido y regenerar email si aplica
  const handleNombreApellidoChange = (field: 'nombre' | 'apellido', value: string) => {
    const newFormData = { ...formData, [field]: value };
    
    // Si el rol es MEDICO o ADMIN, regenerar email automáticamente
    if (newFormData.rol === 'MEDICO' || newFormData.rol === 'ADMIN') {
      const emailGenerado = generarEmailAutomatico(
        newFormData.nombre, 
        newFormData.apellido, 
        newFormData.rol
      );
      newFormData.email = emailGenerado;
    }
    
    setFormData(newFormData);
    
    // Limpiar error de email si se está regenerando
    if (newFormData.rol === 'MEDICO' || newFormData.rol === 'ADMIN') {
      setEmailError('');
    }
  };

  // Función para manejar cambio de rol y regenerar email si aplica
  const handleRolChange = (nuevoRol: string) => {
    const newFormData = { ...formData, rol: nuevoRol };
    
    // Si el nuevo rol es MEDICO o ADMIN, generar email automáticamente
    if (nuevoRol === 'MEDICO' || nuevoRol === 'ADMIN') {
      const emailGenerado = generarEmailAutomatico(
        newFormData.nombre, 
        newFormData.apellido, 
        nuevoRol
      );
      newFormData.email = emailGenerado;
      setEmailError(''); // Limpiar errores previos
    } else if (nuevoRol === 'PACIENTE') {
      // Para pacientes, limpiar el email para que lo ingresen manualmente
      if (!editingUser) { // Solo limpiar si es usuario nuevo
        newFormData.email = '';
      }
    }
    
    setFormData(newFormData);
  };

  const handleEditUser = (user: Usuario) => {
    setEditingUser(user);
    
    // Quitar el prefijo "MED-" del número de licencia si existe
    let numeroLicenciaSinPrefijo = user.numeroLicencia || '';
    if (numeroLicenciaSinPrefijo.startsWith('MED-')) {
      numeroLicenciaSinPrefijo = numeroLicenciaSinPrefijo.substring(4); // Quitar "MED-"
    }
    
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono || '',
      rol: user.roles[0] || '', // CAMBIADO: tomar el primer rol del array
      numeroLicencia: numeroLicenciaSinPrefijo,
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
    // Validaciones básicas
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
    if (!formData.rol) {
      toast.error('Debe seleccionar un rol');
      return;
    }
    if (emailError) {
      toast.error('Por favor corrija el email');
      return;
    }

    // Validaciones específicas por rol
    if (formData.rol === 'MEDICO') {
      if (!formData.numeroLicencia.trim()) {
        toast.error('El número de licencia es requerido para médicos');
        return;
      }
      if (formData.especialidadesIds.length === 0) {
        toast.error('Debe seleccionar al menos una especialidad');
        return;
      }
    }

    if (formData.rol === 'PACIENTE') {
      if (!formData.identificacion.trim()) {
        toast.error('La identificación es requerida para pacientes');
        return;
      }
      if (!formData.fechaNacimiento) {
        toast.error('La fecha de nacimiento es requerida para pacientes');
        return;
      }
    }

    // Preparar datos
    const baseData: any = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      roles: [formData.rol],
    };

    if (formData.telefono) baseData.telefono = formData.telefono;

    if (formData.rol === 'MEDICO') {
      baseData.numeroLicencia = `MED-${formData.numeroLicencia}`;
      baseData.especialidadesIds = formData.especialidadesIds;
      if (formData.biografia) baseData.biografia = formData.biografia;
      if (formData.direccion) baseData.direccion = formData.direccion;
    }

    if (formData.rol === 'PACIENTE') {
      baseData.identificacion = formData.identificacion;
      baseData.fechaNacimiento = formData.fechaNacimiento;
      if (formData.telefonoEmergencia) baseData.telefonoEmergencia = formData.telefonoEmergencia;
    }

    // ✅ USAR MUTATIONS de React Query
    if (editingUser) {
      baseData.activo = formData.activo;
      updateUsuario.mutate(
        { id: editingUser.id, data: baseData as ActualizarUsuarioDto },
        { onSuccess: () => setShowModal(false) }
      );
    } else {
      createUsuario.mutate(
        baseData as CrearUsuarioDto,
        { onSuccess: () => setShowModal(false) }
      );
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    // ✅ USAR MUTATION de React Query
    cambiarEstado.mutate({ id: userId, activo: !currentActive });
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    // ✅ USAR MUTATION de React Query
    deleteUsuario.mutate(userToDelete, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    });
  };

  // ✅ Estado de submitting desde React Query
  const submitting = createUsuario.isPending || updateUsuario.isPending || cambiarEstado.isPending || deleteUsuario.isPending;

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
                <SelectItem value="MEDICO">Médico</SelectItem>
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

          {/* paginación */}
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

      {/* Create/Edit User Modal - MEJORADO CON ROL ÚNICO */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar usuario' : 'Crear nuevo usuario'}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Actualiza los datos del usuario. Los cambios se aplicarán inmediatamente.' 
                : 'Completa los datos del usuario. Se asignará una contraseña temporal: TuCita2024!'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Selección de Rol - NUEVO DISEÑO CON RADIO BUTTONS */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Tipo de usuario *</h3>
              <RadioGroup 
                value={formData.rol} 
                onValueChange={handleRolChange}
                className="grid grid-cols-3 gap-4"
              >
                {Object.values(ROLES_INFO).map((roleInfo) => {
                  const Icon = roleInfo.icon;
                  const isSelected = formData.rol === roleInfo.nombre;
                  
                  return (
                    <div key={roleInfo.nombre}>
                      <RadioGroupItem 
                        value={roleInfo.nombre} 
                        id={`role-${roleInfo.nombre}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`role-${roleInfo.nombre}`}
                        className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? `${roleInfo.bgColor} border-current ${roleInfo.color}` 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-8 w-8 mb-2 ${isSelected ? roleInfo.color : 'text-gray-400'}`} />
                        <span className={`font-semibold text-sm ${isSelected ? roleInfo.color : 'text-gray-700'}`}>
                          {roleInfo.label}
                        </span>
                        <span className="text-xs text-gray-500 text-center mt-1">
                          {roleInfo.description}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              {!formData.rol && (
                <p className="text-sm text-red-500 mt-2">Selecciona un tipo de usuario</p>
              )}
            </div>

            <Separator />

            {/* Datos Personales - SIEMPRE VISIBLE */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Datos personales</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleNombreApellidoChange('nombre', e.target.value)}
                    placeholder="Ej: Juan"
                  />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) => handleNombreApellidoChange('apellido', e.target.value)}
                    placeholder="Ej: Pérez"
                  />
                </div>
                
                {/* Email: Solo editable para PACIENTE, generado automáticamente para DOCTOR y ADMIN */}
                {formData.rol === 'PACIENTE' ? (
                  <div>
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className={emailError ? 'border-red-500' : ''}
                      placeholder="usuario@ejemplo.com"
                    />
                    {emailError && (
                      <p className="text-sm text-red-500 mt-1">{emailError}</p>
                    )}
                  </div>
                ) : formData.rol === 'MEDICO' || formData.rol === 'ADMIN' ? (
                  <div>
                    <Label htmlFor="email">
                      Correo electrónico * 
                      <span className="text-xs text-gray-500 ml-2">(Generado automáticamente)</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      readOnly
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                      placeholder={formData.rol === 'MEDICO' ? 'dr.nombre apellido@tucitaonline.org' : 'nombreapellido@tucitaonline.org'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.rol === 'MEDICO' 
                        ? 'El correo se genera automáticamente con el formato: dr.nombreapellido@tucitaonline.org'
                        : 'El correo se genera automáticamente con el formato: nombreapellido@tucitaonline.org'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="email">Correo electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value=""
                      disabled
                      className="bg-gray-50"
                      placeholder="Selecciona primero un tipo de usuario"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Primero selecciona el tipo de usuario
                    </p>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <PhoneInput
                    id="telefono"
                    value={formData.telefono}
                    onChange={(value) => setFormData({ ...formData, telefono: value })}
                  />
                </div>
              </div>
            </div>

            {/* Formulario específico para DOCTOR */}
            {formData.rol === 'MEDICO' && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Información médica</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="numeroLicencia">Número de licencia médica *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                          MED-
                        </span>
                        <Input
                          id="numeroLicencia"
                          value={formData.numeroLicencia}
                          onChange={(e) => setFormData({ ...formData, numeroLicencia: e.target.value })}
                          placeholder="12345"
                          className="pl-[60px]"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">El número de licencia siempre comienza con MED-</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="biografia">Biografía profesional</Label>
                        <Input
                          id="biografia"
                          value={formData.biografia}
                          onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                          placeholder="Ej: Especialista en cardiología..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="direccion">Dirección de consultorio</Label>
                        <Input
                          id="direccion"
                          value={formData.direccion}
                          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                          placeholder="Ej: Av. Central, Edificio Médico"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Especialidades médicas *</Label>
                      <div className="border rounded-lg p-4 mt-2 max-h-48 overflow-y-auto bg-gray-50">
                        {especialidades.length === 0 ? (
                          <p className="text-sm text-gray-500">No hay especialidades disponibles</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {especialidades.map((esp) => (
                              <div key={esp.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`esp-${esp.id}`}
                                  checked={formData.especialidadesIds.includes(esp.id)}
                                  onCheckedChange={() => handleEspecialidadToggle(esp.id)}
                                />
                                <Label htmlFor={`esp-${esp.id}`} className="cursor-pointer text-sm">
                                  {esp.nombre}
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {formData.especialidadesIds.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">Selecciona al menos una especialidad</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Formulario específico para PACIENTE */}
            {formData.rol === 'PACIENTE' && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Información del paciente</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="identificacion">Identificación (DNI/Cédula) *</Label>
                        <Input
                          id="identificacion"
                          value={formData.identificacion}
                          onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                          placeholder="Ej: 1-1234-5678"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fechaNacimiento">Fecha de nacimiento *</Label>
                        <Input
                          id="fechaNacimiento"
                          type="date"
                          value={formData.fechaNacimiento}
                          onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="telefonoEmergencia">Teléfono de emergencia</Label>
                      <Input
                        id="telefonoEmergencia"
                        value={formData.telefonoEmergencia}
                        onChange={(e) => setFormData({ ...formData, telefonoEmergencia: e.target.value })}
                        placeholder="Contacto de emergencia"
                      />
                      <p className="text-xs text-gray-500 mt-1">Número de familiar o contacto de emergencia</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Formulario específico para ADMIN */}
            {formData.rol === 'ADMIN' && (
              <>
                <Separator />
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <UserCog className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-purple-900">Rol de Administrador</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        Este usuario tendrá acceso completo al panel de administración y podrá gestionar 
                        todos los aspectos del sistema, incluyendo usuarios, citas y configuraciones.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Estado (solo al editar) */}
            {editingUser && (
              <>
                <Separator />
                <div>
                  <Label htmlFor="activo">Estado del usuario</Label>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Los usuarios inactivos no podrán iniciar sesión en el sistema
                  </p>
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
              disabled={loading || !!emailError || !formData.rol}
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
