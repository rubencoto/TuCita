import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { ImageWithFallback } from '../figma/ImageWithFallback';
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
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import profileService from '../../services/profileService';
import type { AuthResponse } from '../../services/authService';

interface ProfilePageProps {
  user: any;
  onUpdateUser: (userData: any) => void;
}

export function ProfilePage({ user, onUpdateUser }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [originalInfo, setOriginalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    identification: '',
    emergencyPhone: '',
  });

  const [personalInfo, setPersonalInfo] = useState({
    firstName: user.name.split(' ')[0] || '',
    lastName: user.name.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    phone: user.phone || '',
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
    healthTips: false,
    promotions: false,
  });

  const [privacy, setPrivacy] = useState({
    shareDataWithDoctors: true,
    allowMarketingEmails: false,
    dataRetention: '2years',
  });

  // Cargar perfil completo al montar el componente
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      
      const profileData = {
        firstName: profile.nombre || '',
        lastName: profile.apellido || '',
        email: profile.email || '',
        phone: profile.telefono || '',
        birthDate: profile.fechaNacimiento || '',
        identification: profile.identificacion || '',
        emergencyPhone: profile.telefonoEmergencia || '',
      };

      setPersonalInfo(profileData);
      setOriginalInfo(profileData);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      toast.error('Error al cargar el perfil');
    }
  };

  const handleSavePersonalInfo = async () => {
    setIsLoading(true);
    
    try {
      const response = await profileService.updateProfile({
        nombre: personalInfo.firstName,
        apellido: personalInfo.lastName,
        email: personalInfo.email,
        telefono: personalInfo.phone || undefined,
        fechaNacimiento: personalInfo.birthDate || undefined,
        identificacion: personalInfo.identificacion || undefined,
        telefonoEmergencia: personalInfo.emergencyPhone || undefined,
      });
      
      // Actualizar el contexto del usuario en la aplicación
      if (response.user) {
        onUpdateUser(response.user);
      }

      setOriginalInfo(personalInfo);
      
      setIsEditing(false);
      
      toast.success('Información personal actualizada', {
        description: 'Tus datos han sido guardados exitosamente.',
      });
    } catch (error: any) {
      toast.error('Error al actualizar', {
        description: error.message || 'No se pudo actualizar la información.',
      });
    } finally {
      setIsLoading(false);
    }
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

    setIsLoading(true);

    try {
      await profileService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Contraseña actualizada', {
        description: 'Tu contraseña ha sido cambiada exitosamente.',
      });
    } catch (error: any) {
      toast.error('Error al cambiar contraseña', {
        description: error.message || 'No se pudo cambiar la contraseña.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    toast.success('Configuración de notificaciones guardada', {
      description: 'Tus preferencias han sido actualizadas.',
    });
  };

  const handleSavePrivacy = () => {
    toast.success('Configuración de privacidad guardada', {
      description: 'Tus preferencias han sido actualizadas.',
    });
  };

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
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-semibold text-foreground">
                  {user.name}
                </h2>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Miembro desde octubre 2024
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm">
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
                  disabled={isLoading}
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
                      disabled={!isEditing || isLoading}
                      placeholder={originalInfo.firstName || 'Ingresa tu nombre'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input
                      id="lastName"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing || isLoading}
                      placeholder={originalInfo.lastName || 'Ingresa tus apellidos'}
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
                      disabled={!isEditing || isLoading}
                      className="pl-10"
                      placeholder={originalInfo.email || 'correo@ejemplo.com'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing || isLoading}
                      className="pl-10"
                      placeholder={originalInfo.phone || '+506 1234-5678'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={personalInfo.birthDate}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, birthDate: e.target.value }))}
                    disabled={!isEditing || isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identification">Identificación</Label>
                  <Input
                    id="identification"
                    type="text"
                    value={personalInfo.identification}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, identification: e.target.value }))}
                    disabled={!isEditing || isLoading}
                    placeholder={originalInfo.identification || 'Cédula o pasaporte'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={personalInfo.emergencyPhone}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    disabled={!isEditing || isLoading}
                    placeholder={originalInfo.emergencyPhone || 'Contacto de emergencia'}
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSavePersonalInfo} disabled={isLoading}>
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
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
                          disabled={isLoading}
                          placeholder="Ingresa tu contraseña actual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          disabled={isLoading}
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
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          disabled={isLoading}
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
                          disabled={isLoading}
                          placeholder="Repite tu nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button onClick={handleChangePassword} disabled={isLoading}>
                      {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Autenticación de Dos Factores</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">Protege tu cuenta con verificación adicional</p>
                      <p className="text-xs text-muted-foreground">Recibe códigos por SMS o aplicación</p>
                    </div>
                    <Switch />
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
                      <p className="text-sm text-muted-foreground">Recibe recordatorios de citas por correo</p>
                    </div>
                    <Switch
                      checked={notifications.emailReminders}
                      onCheckedChange={(checked: boolean) => setNotifications(prev => ({ ...prev, emailReminders: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Recordatorios por SMS</p>
                      <p className="text-sm text-muted-foreground">Recibe recordatorios de citas por mensaje</p>
                    </div>
                    <Switch
                      checked={notifications.smsReminders}
                      onCheckedChange={(checked: boolean) => setNotifications(prev => ({ ...prev, smsReminders: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Confirmaciones de Citas</p>
                      <p className="text-sm text-muted-foreground">Notificaciones cuando se confirme una cita</p>
                    </div>
                    <Switch
                      checked={notifications.appointmentConfirmations}
                      onCheckedChange={(checked: boolean) => setNotifications(prev => ({ ...prev, appointmentConfirmations: checked }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Consejos de Salud</p>
                      <p className="text-sm text-muted-foreground">Recibe tips y consejos médicos semanales</p>
                    </div>
                    <Switch
                      checked={notifications.healthTips}
                      onCheckedChange={(checked: boolean) => setNotifications(prev => ({ ...prev, healthTips: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Promociones y Ofertas</p>
                      <p className="text-sm text-muted-foreground">Notificaciones sobre descuentos especiales</p>
                    </div>
                    <Switch
                      checked={notifications.promotions}
                      onCheckedChange={(checked: boolean) => setNotifications(prev => ({ ...prev, promotions: checked }))}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compartir Datos con Médicos</p>
                      <p className="text-sm text-muted-foreground">Permite a los médicos acceder a tu historial</p>
                    </div>
                    <Switch
                      checked={privacy.shareDataWithDoctors}
                      onCheckedChange={(checked: boolean) => setPrivacy(prev => ({ ...prev, shareDataWithDoctors: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Emails de Marketing</p>
                      <p className="text-sm text-muted-foreground">Recibir comunicaciones promocionales</p>
                    </div>
                    <Switch
                      checked={privacy.allowMarketingEmails}
                      onCheckedChange={(checked: boolean) => setPrivacy(prev => ({ ...prev, allowMarketingEmails: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Retención de Datos</Label>
                    <select
                      value={privacy.dataRetention}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, dataRetention: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="1year">1 año</option>
                      <option value="2years">2 años</option>
                      <option value="5years">5 años</option>
                      <option value="indefinite">Indefinido</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Tiempo que mantendremos tus datos después de eliminar tu cuenta
                    </p>
                  </div>
                </div>

                <Separator />

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

                <Button onClick={handleSavePrivacy}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}