import { useState } from 'react';
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
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useAdminEspecialidades,
  useCreateEspecialidad,
  useUpdateEspecialidad,
  useDeleteEspecialidad
} from '@/hooks/queries';
import { EspecialidadDto } from '@/services/api/admin/adminEspecialidadesService';

export function AdminEspecialidades() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: ''
  });

  // 🎯 REACT QUERY: Obtener especialidades
  const { data: especialidadesData = [], isLoading: loading } = useAdminEspecialidades();

  // 🎯 REACT QUERY: Mutations
  const createEspecialidad = useCreateEspecialidad();
  const updateEspecialidad = useUpdateEspecialidad();
  const deleteEspecialidad = useDeleteEspecialidad();

  // Ordenar por ID
  const especialidades = [...especialidadesData].sort((a, b) => a.id - b.id);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ nombre: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (especialidad: EspecialidadDto) => {
    setEditingId(especialidad.id);
    setFormData({ nombre: especialidad.nombre });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    // ✅ USAR MUTATIONS de React Query
    if (editingId) {
      updateEspecialidad.mutate(
        { id: editingId, data: formData },
        { 
          onSuccess: () => {
            setShowModal(false);
            setFormData({ nombre: '' });
          }
        }
      );
    } else {
      createEspecialidad.mutate(
        formData,
        { 
          onSuccess: () => {
            setShowModal(false);
            setFormData({ nombre: '' });
          }
        }
      );
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Está seguro que desea eliminar la especialidad "${nombre}"?`)) {
      return;
    }

    // ✅ USAR MUTATION de React Query
    deleteEspecialidad.mutate(id);
  };

  // ✅ Estado de submitting desde React Query
  const submitting = createEspecialidad.isPending || updateEspecialidad.isPending || deleteEspecialidad.isPending;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Especialidades Médicas</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona las especialidades disponibles en el sistema</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva especialidad
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nombre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Doctores Asignados</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {especialidades.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No hay especialidades registradas
                    </td>
                  </tr>
                ) : (
                  especialidades.map((esp) => (
                    <tr key={esp.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-700">{esp.id}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{esp.nombre}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="font-semibold">
                          {esp.doctoresAsignados} {esp.doctoresAsignados === 1 ? 'doctor' : 'doctores'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenEdit(esp)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(esp.id, esp.nombre)}
                            disabled={esp.doctoresAsignados > 0}
                            title={esp.doctoresAsignados > 0 ? 'No se puede eliminar porque tiene doctores asignados' : 'Eliminar'}
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
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar' : 'Nueva'} especialidad</DialogTitle>
            <DialogDescription>
              {editingId ? 'Modifica los datos de la especialidad médica' : 'Completa la información de la nueva especialidad médica'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nombre">Nombre de la especialidad</Label>
              <Input
                id="nombre"
                placeholder="ej. Cardiología"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                maxLength={120}
                disabled={submitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.nombre.length}/120 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-teal-600 hover:bg-teal-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
