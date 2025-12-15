import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PhoneInput } from '@/components/ui/phone-input';
import { 
  User, 
  Mail, 
  Phone, 
  Upload,
  Save,
  Lock,
  AlertCircle,
  MapPin,
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import doctorProfileService from '@/services/api/doctor/doctorProfileService';
import { DoctorLayout } from '@/components/layout/doctor/DoctorLayout';
import { 
  useDoctorProfile, 
  useUpdateDoctorProfile, 
  useChangeDoctorPassword,
  useUploadDoctorAvatar,
  useEspecialidades 
} from '@/hooks/queries';

interface DoctorProfilePageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function DoctorProfilePage({ onNavigate, onLogout }: DoctorProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  // 🎯 React Query: Obtener perfil del doctor
  const { data: profile, isLoading } = useDoctorProfile();
  
  // 🎯 React Query: Obtener especialidades
  const { data: especialidades = [] } = useEspecialidades();
  
  // 🎯 React Query: Mutations
  const updateProfile = useUpdateDoctorProfile();
  const changePassword = useChangeDoctorPassword();
  const uploadAvatar = useUploadDoctorAvatar();
  
  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    nombre: profile?.nombre || '',
    apellido: profile?.apellido || '',
    email: profile?.email || '',
    telefono: profile?.telefono || '',
    numeroLicencia: profile?.numeroLicencia || '',
    biografia: profile?.biografia || '',
    direccion: profile?.direccion || '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // Actualizar formData cuando cambie el perfil
  if (profile && formData.nombre === '' && !isEditing) {
    setFormData({
      nombre: profile.nombre,
      apellido: profile.apellido,
      email: profile.email,
      telefono: profile.telefono || '',
      numeroLicencia: profile.numeroLicencia || '',
      biografia: profile.biografia || '',
      direccion: profile.direccion || '',
    });
  }

  const handleSaveProfile = async () => {
    // Validaciones
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      toast.error('Error de validación', {
        description: 'El nombre y apellido son obligatorios'
      });
      return;
    }

    if (!doctorProfileService.isValidEmail(formData.email)) {
      toast.error('Error de validación', {
        description: 'El formato del email no es válido'
      });
      return;
    }

    if (formData.telefono && !doctorProfileService.isValidPhone(formData.telefono)) {
      toast.error('Error de validación', {
        description: 'El formato del teléfono no es válido'
      });
      return;
    }

    updateProfile.mutate(formData, {
      onSuccess: () => {
        setIsEditing(false);
      }
    });
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const validation = doctorProfileService.validatePassword(passwords.new);
    if (!validation.valid) {
      toast.error('Contraseña inválida', {
        description: validation.message
      });
      return;
    }

    changePassword.mutate(
      {
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirmPassword: passwords.confirm
      },
      {
        onSuccess: () => {
          setShowPasswordDialog(false);
          setPasswords({ current: '', new: '', confirm: '' });
        }
      }
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Error de validación', {
        description: 'El archivo debe ser una imagen'
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Error de validación', {
        description: 'La imagen no puede superar los 5MB'
      });
      return;
    }

    uploadAvatar.mutate(file);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        nombre: profile.nombre,
        apellido: profile.apellido,
        email: profile.email,
        telefono: profile.telefono || '',
        numeroLicencia: profile.numeroLicencia || '',
        biografia: profile.biografia || '',
        direccion: profile.direccion || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <DoctorLayout 
        currentPage="doctor-profile" 
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="p-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Cargando perfil...</p>
            </div>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  if (!profile) {
    return (
      <DoctorLayout 
        currentPage="doctor-profile" 
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="p-8 max-w-5xl mx-auto">
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              No se pudo cargar el perfil del doctor
            </AlertDescription>
          </Alert>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout 
      currentPage="doctor-profile" 
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Perfil
          </h1>
          <p className="text-gray-600">
            Gestiona tu información personal y profesional
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Foto de perfil */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Foto de Perfil</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-40 w-40 mb-4">
                  <AvatarImage src={profile.avatar} alt={doctorProfileService.getFullName(profile)} />
                  <AvatarFallback className="text-3xl">
                    {doctorProfileService.getInitials(profile)}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing && (
                  <div>
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadAvatar.isPending}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      disabled={uploadAvatar.isPending}
                    >
                      {uploadAvatar.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Cambiar foto
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="mt-6 w-full space-y-2">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">ID Doctor</p>
                    <p className="font-mono font-medium text-gray-900">DOC-{profile.id.toString().padStart(6, '0')}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Miembro desde</p>
                    <p className="font-medium text-gray-900">
                      {doctorProfileService.formatDate(profile.creadoEn)}
                    </p>
                  </div>
                  {profile.especialidades.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">Especialidades</p>
                      <div className="space-y-1">
                        {profile.especialidades.map((esp, idx) => (
                          <p key={idx} className="text-sm font-medium text-blue-900">
                            {esp}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cambiar contraseña */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Seguridad</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Cambiar Contraseña
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar Contraseña</DialogTitle>
                      <DialogDescription>
                        Ingresa tu contraseña actual y la nueva contraseña
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="current-password">Contraseña actual</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={passwords.current}
                          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                          disabled={changePassword.isPending}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-password">Nueva contraseña</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwords.new}
                          onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                          disabled={changePassword.isPending}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                          disabled={changePassword.isPending}
                        />
                      </div>
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números
                        </AlertDescription>
                      </Alert>
                      <Button 
                        onClick={handleChangePassword} 
                        className="w-full bg-[#2E8BC0]"
                        disabled={changePassword.isPending}
                      >
                        {changePassword.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Actualizando...
                          </>
                        ) : (
                          'Actualizar contraseña'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Información del perfil */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Información Personal</CardTitle>
                    <CardDescription>
                      Actualiza tus datos personales y profesionales
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="bg-[#2E8BC0]">
                      Editar
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit} 
                        disabled={updateProfile.isPending}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSaveProfile} 
                        className="bg-[#2E8BC0]" 
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre" className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      Nombre
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apellido" className="flex items-center mb-2">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      Apellido
                    </Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Email y Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="correo" className="flex items-center mb-2">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      Correo electrónico
                    </Label>
                    <Input
                      id="correo"
                      type="email"
                      value={formData.email}
                      disabled={true}
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefono" className="flex items-center mb-2">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      Teléfono
                    </Label>
                    <PhoneInput
                      id="telefono"
                      value={formData.telefono}
                      onChange={(value) => setFormData({ ...formData, telefono: value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Número de Licencia */}
                <div>
                  <Label htmlFor="licencia" className="flex items-center mb-2">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    Número de licencia profesional
                  </Label>
                  <Input
                    id="licencia"
                    value={formData.numeroLicencia}
                    disabled={true}
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {/* Dirección */}
                <div>
                  <Label htmlFor="direccion" className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    Dirección del consultorio
                  </Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                {/* Biografía */}
                <div>
                  <Label htmlFor="biografia" className="mb-2 block">
                    Biografía profesional
                  </Label>
                  <Textarea
                    id="biografia"
                    value={formData.biografia}
                    onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Cuéntanos sobre tu experiencia, formación y áreas de interés..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
