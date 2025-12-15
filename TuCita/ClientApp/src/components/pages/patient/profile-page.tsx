import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { PhoneInput } from '@/components/ui/phone-input';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Shield,
  Camera,
  Save,
  Eye,
  EyeOff,
  Calendar,
  Settings,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { usePatientProfile, useUpdatePatientProfile, useChangePassword } from '@/hooks/queries';

export function ProfilePage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ REACT QUERY: Fetch profile
  const { data: profile, isLoading: loadingProfile } = usePatientProfile();
  
  // ✅ REACT QUERY: Update profile mutation
  const updateProfile = useUpdatePatientProfile();
  
  // ✅ REACT QUERY: Change password mutation
  const changePassword = useChangePassword();
  
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    identification: '',
    emergencyPhone: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsReminders: true,
    appointmentConfirmations: true,
  });

  // Update personalInfo when profile loads
  React.useEffect(() => {
    if (profile) {
      setPersonalInfo({
        firstName: profile.nombre || '',
        lastName: profile.apellido || '',
        email: profile.email || '',
        phone: profile.telefono || '',
        birthDate: profile.fechaNacimiento || '',
        identification: profile.identificacion || '',
        emergencyPhone: profile.telefonoEmergencia || '',
      });
    }
  }, [profile]);

  const handleSavePersonalInfo = async () => {
    // ✅ REACT QUERY: Use mutation instead of service
    updateProfile.mutate(
      {
        nombre: personalInfo.firstName,
        apellido: personalInfo.lastName,
        email: personalInfo.email,
        telefono: personalInfo.phone || undefined,
        fechaNacimiento: personalInfo.birthDate || undefined,
        identificacion: personalInfo.identification || undefined,
        telefonoEmergencia: personalInfo.emergencyPhone || undefined,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Información personal actualizada', {
            description: 'Tus datos han sido guardados exitosamente.',
          });
        }
      }
    );
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // ✅ REACT QUERY: Use mutation instead of service
    changePassword.mutate(
      {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      },
      {
        onSuccess: () => {
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          
          toast.success('Contraseña actualizada', {
            description: 'Tu contraseña ha sido cambiada exitosamente.',
          });
        }
      }
    );
  };

  const handleSaveNotifications = () => {
    toast.success('Configuración de notificaciones guardada', {
      description: 'Tus preferencias han sido actualizadas.',
    });
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No se pudo cargar el perfil</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${profile.nombre || ''} ${profile.apellido || ''}`.trim();

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mi Perfil
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y preferencias de cuenta
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <ImageWithFallback
                  src=""
                  alt={fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-semibold text-foreground">
                  {fullName}
                </h2>
                <p className="text-muted-foreground">{profile.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Miembro desde {profile.creadoEn ? new Date(profile.creadoEn).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : 'octubre 2024'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" onClick={() => onNavigate?.('medical-history')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Historial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Información Personal
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacidad
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Información Personal</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={updateProfile.isPending}
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing || updateProfile.isPending}
                      placeholder="Ingresa tu nombre"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input
                      id="lastName"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing || updateProfile.isPending}
                      placeholder="Ingresa tus apellidos"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing || updateProfile.isPending}
                      className="pl-10"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <PhoneInput
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(value) => setPersonalInfo(prev => ({ ...prev, phone: value }))}
                    disabled={!isEditing || updateProfile.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={personalInfo.birthDate}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, birthDate: e.target.value }))}
                    disabled={!isEditing || updateProfile.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identification">Identificación</Label>
                  <Input
                    id="identification"
                    type="text"
                    value={personalInfo.identification}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, identification: e.target.value }))}
                    disabled={!isEditing || updateProfile.isPending}
                    placeholder="Cédula o pasaporte"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                  <PhoneInput
                    id="emergencyPhone"
                    value={personalInfo.emergencyPhone}
                    onChange={(value) => setPersonalInfo(prev => ({ ...prev, emergencyPhone: value }))}
                    disabled={!isEditing || updateProfile.isPending}
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSavePersonalInfo} disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={updateProfile.isPending}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Cambiar Contraseña</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="pl-10 pr-10"
                          disabled={changePassword.isPending}
                          placeholder="Ingresa tu contraseña actual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          disabled={changePassword.isPending}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="pl-10 pr-10"
                          placeholder="Mínimo 8 caracteres"
                          disabled={changePassword.isPending}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          disabled={changePassword.isPending}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="pl-10 pr-10"
                          disabled={changePassword.isPending}
                          placeholder="Repite tu nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          disabled={changePassword.isPending}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button onClick={handleChangePassword} disabled={changePassword.isPending}>
                      {changePassword.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Cambiando...
                        </>
                      ) : (
                        'Cambiar Contraseña'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Recordatorios por Email</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Recibe recordatorios de citas por correo
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailReminders}
                      onCheckedChange={(checked: boolean) => setNotifications(prev => ({ ...prev, emailReminders: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Recordatorios por SMS</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Recibe recordatorios de citas por mensaje
                      </p>
                    </div>
                    <Switch
                      checked={notifications.smsReminders}
                      onCheckedChange={(checked: boolean) => setNotifications(prev => ({ ...prev, smsReminders: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Confirmaciones de Citas</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Notificaciones cuando se confirme una cita
                      </p>
                    </div>
                    <Switch
                      checked={notifications.appointmentConfirmations}
                      onCheckedChange={(checked: boolean) => setNotifications(prev => ({ ...prev, appointmentConfirmations: checked }))}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Preferencias
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Privacidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-destructive">Zona de Peligro</h3>
                  <div className="border border-destructive/20 rounded-lg p-4 space-y-4">
                    <div>
                      <p className="font-medium">Descargar Mis Datos</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Obtén una copia de toda tu información personal
                      </p>
                      <Button variant="outline" size="sm">
                        Solicitar Descarga
                      </Button>
                    </div>
                    
                    <div>
                      <p className="font-medium text-destructive">Eliminar Cuenta</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Esta acción no se puede deshacer. Se eliminará toda tu información.
                      </p>
                      <Button variant="destructive" size="sm">
                        Eliminar Cuenta
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}