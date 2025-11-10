import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Upload,
  Save,
  Lock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../ui/alert';

interface DoctorProfilePageProps {
  onNavigate: (page: string) => void;
}

export function DoctorProfilePage({ onNavigate }: DoctorProfilePageProps) {
  // Mock data - En producción vendría del backend
  const [profile, setProfile] = useState({
    id_doctor: 'DOC-001',
    nombre: 'Laura Martínez García',
    correo: 'laura.martinez@tucitaonline.com',
    telefono: '+34 612 345 678',
    especialidad_id: '1',
    cedula_profesional: '28/28123456',
    foto_url: 'https://images.unsplash.com/photo-1632054226752-b1b40867f7a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkb2N0b3IlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYyNTQzNjI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    fecha_registro: '2024-01-15',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const especialidades = [
    { id: '1', nombre: 'Medicina General' },
    { id: '2', nombre: 'Cardiología' },
    { id: '3', nombre: 'Dermatología' },
    { id: '4', nombre: 'Pediatría' },
    { id: '5', nombre: 'Ginecología' },
    { id: '6', nombre: 'Traumatología' },
  ];

  const handleSaveProfile = () => {
    // Aquí iría la llamada al backend
    toast.success('Perfil actualizado correctamente');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    // Aquí iría la llamada al backend
    toast.success('Contraseña actualizada correctamente');
    setShowPasswordDialog(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Aquí iría la lógica de subida de imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, foto_url: reader.result as string });
        toast.success('Foto actualizada correctamente');
      };
      reader.readAsDataURL(file);
    }
  };

  const getEspecialidadNombre = (id: string) => {
    return especialidades.find(e => e.id === id)?.nombre || '';
  };

  return (
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
                <AvatarImage src={profile.foto_url} alt={profile.nombre} />
                <AvatarFallback className="text-3xl">
                  {profile.nombre.split(' ').map(n => n[0]).join('')}
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
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Cambiar foto
                  </Button>
                </div>
              )}

              <div className="mt-6 w-full space-y-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">ID Doctor</p>
                  <p className="font-mono font-medium text-gray-900">{profile.id_doctor}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Miembro desde</p>
                  <p className="font-medium text-gray-900">
                    {new Date(profile.fecha_registro).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Nueva contraseña</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      />
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        La contraseña debe tener al menos 8 caracteres
                      </AlertDescription>
                    </Alert>
                    <Button onClick={handleChangePassword} className="w-full bg-[#2E8BC0]">
                      Actualizar contraseña
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
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveProfile} className="bg-[#2E8BC0]">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nombre completo */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="nombre" className="flex items-center mb-2">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    Nombre completo
                  </Label>
                  <Input
                    id="nombre"
                    value={profile.nombre}
                    onChange={(e) => setProfile({ ...profile, nombre: e.target.value })}
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
                    value={profile.correo}
                    onChange={(e) => setProfile({ ...profile, correo: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="telefono" className="flex items-center mb-2">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    value={profile.telefono}
                    onChange={(e) => setProfile({ ...profile, telefono: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Especialidad y Cédula */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="especialidad" className="mb-2 block">
                    Especialidad
                  </Label>
                  <Select
                    value={profile.especialidad_id}
                    onValueChange={(value) => setProfile({ ...profile, especialidad_id: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="especialidad">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {especialidades.map((esp) => (
                        <SelectItem key={esp.id} value={esp.id}>
                          {esp.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cedula" className="mb-2 block">
                    Cédula profesional
                  </Label>
                  <Input
                    id="cedula"
                    value={profile.cedula_profesional}
                    onChange={(e) => setProfile({ ...profile, cedula_profesional: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Los campos ID Doctor y Fecha de Registro no pueden ser modificados
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
