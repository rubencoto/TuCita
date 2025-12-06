'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Trash2,
  Copy,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  LayoutTemplate,
  Video,
  Building2,
  ArrowRight,
  TrendingUp,
  Moon,
  Sun,
  Sunset,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  WeeklyTimeSlot,
  SlotTipo,
} from '@/services/api/doctor/doctorAvailabilityService';
import * as availabilityService from '@/services/api/doctor/doctorAvailabilityService';
import { cn } from '@/components/ui/utils';

interface WeeklyScheduleBuilderProps {
  initialSchedule?: Record<number, WeeklyTimeSlot[]>;
  onChange: (schedule: Record<number, WeeklyTimeSlot[]>) => void;
}

type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const WEEK_DAYS: {
  index: DayIndex;
  name: string;
  short: string;
  gradient: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  emoji: string;
}[] = [
  {
    index: 1,
    name: 'Lunes',
    short: 'Lun',
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    emoji: '💼'
  },
  {
    index: 2,
    name: 'Martes',
    short: 'Mar',
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    emoji: '📅'
  },
  {
    index: 3,
    name: 'Miércoles',
    short: 'Mié',
    gradient: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700',
    emoji: '📋'
  },
  {
    index: 4,
    name: 'Jueves',
    short: 'Jue',
    gradient: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    emoji: '📝'
  },
  {
    index: 5,
    name: 'Viernes',
    short: 'Vie',
    gradient: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    emoji: '🎉'
  },
  {
    index: 6,
    name: 'Sábado',
    short: 'Sáb',
    gradient: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700',
    emoji: '🌤️'
  },
  {
    index: 0,
    name: 'Domingo',
    short: 'Dom',
    gradient: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    emoji: '☀️'
  },
];

const TIME_OPTIONS: string[] = (() => {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      times.push(`${hh}:${mm}`);
    }
  }
  return times;
})();

/* ----------------- Helpers ----------------- */

const minutesFromMidnight = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const getSlotDurationMinutes = (slot: WeeklyTimeSlot): number => {
  const start = minutesFromMidnight(slot.horaInicio);
  const end = minutesFromMidnight(slot.horaFin);
  return Math.max(0, end - start);
};

const getSlotsDurationMinutes = (slots: WeeklyTimeSlot[]): number =>
  slots.reduce((acc, slot) => acc + getSlotDurationMinutes(slot), 0);

const formatMinutesToLabel = (minutes: number): string => {
  if (minutes <= 0) return '0h';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

const hasOverlappingSlots = (slots: WeeklyTimeSlot[]): boolean => {
  if (slots.length <= 1) return false;
  const sorted = [...slots].sort(
    (a, b) => minutesFromMidnight(a.horaInicio) - minutesFromMidnight(b.horaInicio)
  );

  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = minutesFromMidnight(sorted[i - 1].horaFin);
    const currentStart = minutesFromMidnight(sorted[i].horaInicio);
    if (currentStart < prevEnd) {
      return true;
    }
  }
  return false;
};

const cloneSlots = (slots: WeeklyTimeSlot[]): WeeklyTimeSlot[] =>
  slots.map((s) => ({ ...s }));

const getDayConfig = (dayIndex: number) =>
  WEEK_DAYS.find((d) => d.index === dayIndex)!;

const getTimeOfDayIcon = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 5 && hour < 12) return <Sun className="h-3 w-3" />;
  if (hour >= 12 && hour < 18) return <Sunset className="h-3 w-3" />;
  return <Moon className="h-3 w-3" />;
};

/* ----------------- Componente principal ----------------- */

export function WeeklyScheduleBuilder({
  initialSchedule,
  onChange,
}: WeeklyScheduleBuilderProps) {
  const [schedule, setSchedule] = useState<Record<number, WeeklyTimeSlot[]>>(
    initialSchedule || availabilityService.getDefaultWeeklySchedule()
  );
  const [selectedDay, setSelectedDay] = useState<DayIndex>(1);

  useEffect(() => {
    if (initialSchedule) {
      setSchedule(initialSchedule);
    }
  }, [initialSchedule]);

  const isDayEnabled = (dayIndex: number) =>
    !!(schedule[dayIndex] && schedule[dayIndex].length > 0);

  const totalSlots = useMemo(
    () => Object.values(schedule).reduce((acc, slots) => acc + slots.length, 0),
    [schedule]
  );

  const enabledDaysCount = useMemo(
    () =>
      Object.keys(schedule).filter(
        (key) => schedule[parseInt(key)]?.length > 0
      ).length,
    [schedule]
  );

  const weeklyMinutes = useMemo(
    () =>
      Object.values(schedule).reduce(
        (acc, slots) => acc + getSlotsDurationMinutes(slots),
        0
      ),
    [schedule]
  );

  const weeklyHoursLabel = useMemo(
    () => formatMinutesToLabel(weeklyMinutes),
    [weeklyMinutes]
  );

  const updateSchedule = (newSchedule: Record<number, WeeklyTimeSlot[]>) => {
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  const toggleDay = (dayIndex: DayIndex, enabled: boolean) => {
    const newSchedule = { ...schedule };
    const dayName = getDayConfig(dayIndex).name;

    if (enabled) {
      newSchedule[dayIndex] = [
        { horaInicio: '09:00', horaFin: '10:00', tipo: 'PRESENCIAL' },
      ];
      toast.success(`${dayName} habilitado`, {
        description: 'Se agregó un horario de ejemplo',
      });
    } else {
      const slotsCount = schedule[dayIndex]?.length || 0;
      delete newSchedule[dayIndex];
      toast.info(`${dayName} deshabilitado`, {
        description:
          slotsCount > 0 ? `Se eliminaron ${slotsCount} horario(s)` : undefined,
      });
    }

    updateSchedule(newSchedule);
  };

  const addSlot = (dayIndex: DayIndex) => {
    const newSchedule = { ...schedule };
    const daySlots = [...(newSchedule[dayIndex] || [])];

    let newStart = '09:00';
    if (daySlots.length > 0) {
      const lastSlot = daySlots[daySlots.length - 1];
      newStart = lastSlot.horaFin;
    }

    const [h, m] = newStart.split(':').map(Number);
    const endH = Math.min(h + 1, 23);
    const newEnd = `${endH.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}`;

    const newSlot: WeeklyTimeSlot = {
      horaInicio: newStart,
      horaFin: newEnd,
      tipo: 'PRESENCIAL',
    };

    const newDaySlots = [...daySlots, newSlot];

    if (hasOverlappingSlots(newDaySlots)) {
      toast.error('Horario inválido', {
        description: 'Este rango se cruza con otro horario del mismo día.',
      });
      return;
    }

    newSchedule[dayIndex] = newDaySlots;
    updateSchedule(newSchedule);

    toast.success('Horario agregado', {
      description: `${newStart} - ${newEnd}`,
    });
  };

  const removeSlot = (dayIndex: DayIndex, slotIndex: number) => {
    const newSchedule = { ...schedule };
    const daySlots = [...(newSchedule[dayIndex] || [])];
    const removedSlot = daySlots[slotIndex];

    daySlots.splice(slotIndex, 1);
    if (daySlots.length === 0) {
      delete newSchedule[dayIndex];
    } else {
      newSchedule[dayIndex] = daySlots;
    }

    updateSchedule(newSchedule);

    toast.success('Horario eliminado', {
      description: `${removedSlot.horaInicio} - ${removedSlot.horaFin}`,
    });
  };

  const updateSlot = (
    dayIndex: DayIndex,
    slotIndex: number,
    field: keyof WeeklyTimeSlot,
    value: string
  ) => {
    const daySlots = [...(schedule[dayIndex] || [])];
    const currentSlot = daySlots[slotIndex];

    const updatedSlot: WeeklyTimeSlot = {
      ...currentSlot,
      [field]: value,
    };

    const startMin = minutesFromMidnight(updatedSlot.horaInicio);
    const endMin = minutesFromMidnight(updatedSlot.horaFin);

    if (endMin <= startMin) {
      toast.error('Rango horario inválido', {
        description: 'La hora fin debe ser mayor a la hora inicio.',
      });
      return;
    }

    const newDaySlots = [...daySlots];
    newDaySlots[slotIndex] = updatedSlot;

    if (hasOverlappingSlots(newDaySlots)) {
      toast.error('Horario inválido', {
        description: 'El horario se cruza con otro ya configurado.',
      });
      return;
    }

    const newSchedule = { ...schedule, [dayIndex]: newDaySlots };
    updateSchedule(newSchedule);
  };

  const copyDay = (fromDay: DayIndex, toDay: DayIndex) => {
    if (!schedule[fromDay] || schedule[fromDay].length === 0) {
      toast.error('No se puede copiar', {
        description: 'El día de origen no tiene horarios configurados',
      });
      return;
    }

    const newSchedule = { ...schedule };
    newSchedule[toDay] = cloneSlots(schedule[fromDay]);
    updateSchedule(newSchedule);

    const fromName = getDayConfig(fromDay).name;
    const toName = getDayConfig(toDay).name;

    toast.success('Horario copiado exitosamente', {
      description: `${fromName} → ${toName}`,
    });
  };

  const applyToWeekdaysFromSelected = () => {
    if (!schedule[selectedDay] || schedule[selectedDay].length === 0) {
      toast.error('Configura horarios primero', {
        description: 'Agrega al menos un horario al día seleccionado',
      });
      return;
    }

    const template = cloneSlots(schedule[selectedDay]);
    const newSchedule = { ...schedule };
    for (let d: DayIndex = 1; d <= 5; d = (d + 1) as DayIndex) {
      newSchedule[d] = cloneSlots(template);
    }

    updateSchedule(newSchedule);

    toast.success('Horario aplicado a Lunes-Viernes', {
      description: `${template.length} horario(s) por día`,
      icon: <Sparkles className="h-4 w-4" />,
    });
  };

  const clearAll = () => {
    const count = totalSlots;
    updateSchedule({});
    toast.success('Todos los horarios eliminados', {
      description: count > 0 ? `Se eliminaron ${count} horario(s)` : undefined,
    });
  };

  const setTemplateForDay = (
    dayIndex: DayIndex,
    template: 'MANANA' | 'TARDE' | 'COMPLETA'
  ) => {
    const slots: WeeklyTimeSlot[] =
      template === 'MANANA'
        ? [{ horaInicio: '08:00', horaFin: '12:00', tipo: 'PRESENCIAL' }]
        : template === 'TARDE'
        ? [{ horaInicio: '13:00', horaFin: '17:00', tipo: 'PRESENCIAL' }]
        : [
            { horaInicio: '08:00', horaFin: '12:00', tipo: 'PRESENCIAL' },
            { horaInicio: '13:00', horaFin: '17:00', tipo: 'PRESENCIAL' },
          ];

    const newSchedule = { ...schedule, [dayIndex]: slots };
    updateSchedule(newSchedule);

    const dayName = getDayConfig(dayIndex).name;
    toast.success('Plantilla aplicada', {
      description: `${dayName} - ${template.toLowerCase()}`,
    });
  };

  const applyTemplateToWeekdays = (template: 'MANANA' | 'TARDE' | 'COMPLETA') => {
    const baseSlots: WeeklyTimeSlot[] =
      template === 'MANANA'
        ? [{ horaInicio: '08:00', horaFin: '12:00', tipo: 'PRESENCIAL' }]
        : template === 'TARDE'
        ? [{ horaInicio: '13:00', horaFin: '17:00', tipo: 'PRESENCIAL' }]
        : [
            { horaInicio: '08:00', horaFin: '12:00', tipo: 'PRESENCIAL' },
            { horaInicio: '13:00', horaFin: '17:00', tipo: 'PRESENCIAL' },
          ];

    const newSchedule = { ...schedule };
    for (let d: DayIndex = 1; d <= 5; d = (d + 1) as DayIndex) {
      newSchedule[d] = cloneSlots(baseSlots);
    }

    updateSchedule(newSchedule);

    toast.success('Plantilla aplicada a días laborables', {
      description: `Plantilla ${template.toLowerCase()} Lunes-Viernes`,
    });
  };

  const selectedConfig = getDayConfig(selectedDay);
  const selectedSlots = schedule[selectedDay] || [];
  const selectedDayMinutes = getSlotsDurationMinutes(selectedSlots);
  const selectedDayLabel = formatMinutesToLabel(selectedDayMinutes);

  return (
    <div className="space-y-6 w-full">
      {/* Header mejorado con gradiente */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-[#2E8BC0] via-blue-500 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <CardHeader className="relative pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white mb-1">
                    Configuración de Horario Semanal
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Define tu disponibilidad base para la semana
                  </CardDescription>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div>
                    <p className="text-xs text-blue-100">Total slots</p>
                    <p className="font-bold text-lg">{totalSlots}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <div>
                    <p className="text-xs text-blue-100">Días activos</p>
                    <p className="font-bold text-lg">{enabledDaysCount}/7</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <p className="text-xs text-blue-100">Semanal</p>
                    <p className="font-bold text-lg">{weeklyHoursLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-3 pt-0">
          <Separator className="bg-white/20" />
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={applyToWeekdaysFromSelected}
              disabled={!isDayEnabled(selectedDay)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Copiar a L-V
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => applyTemplateToWeekdays('MANANA')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              <Sun className="h-4 w-4 mr-2" />
              Mañanas L-V
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => applyTemplateToWeekdays('COMPLETA')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Jornada Completa
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={clearAll}
              disabled={totalSlots === 0}
              className="ml-auto bg-red-500/80 hover:bg-red-600 text-white border-0"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar Todo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar: Días de la semana - mejorado */}
        <div className="space-y-3">
          <Card className="shadow-lg border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#2E8BC0]" />
                Días de la Semana
              </CardTitle>
              <CardDescription className="text-xs">
                Activa/desactiva días
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {WEEK_DAYS.map((day) => {
                const enabled = isDayEnabled(day.index);
                const isSelected = selectedDay === day.index;
                const slots = schedule[day.index] || [];
                const slotsCount = slots.length;
                const minutes = getSlotsDurationMinutes(slots);
                const label = formatMinutesToLabel(minutes);

                return (
                  <button
                    key={day.index}
                    type="button"
                    onClick={() => setSelectedDay(day.index)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all duration-200',
                      isSelected
                        ? `${day.bgColor} ${day.borderColor} shadow-lg scale-105`
                        : enabled
                        ? 'border-gray-200 bg-white hover:shadow-md hover:scale-102'
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="text-2xl">{day.emoji}</div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={cn(
                          "font-bold text-sm",
                          isSelected ? day.textColor : "text-gray-900"
                        )}>
                          {day.name}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {enabled ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              {slotsCount} slot{slotsCount !== 1 ? 's' : ''} · {label}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-gray-400" />
                              Inactivo
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked: boolean) =>
                        toggleDay(day.index, checked)
                      }
                      className="flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Resumen visual */}
          <Card className="shadow-lg border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                <TrendingUp className="h-4 w-4" />
                Resumen Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Total horas</span>
                <Badge className="bg-green-600">{weeklyHoursLabel}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Días activos</span>
                <Badge variant="outline">{enabledDaysCount} de 7</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Slots totales</span>
                <Badge variant="outline">{totalSlots}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel principal - día seleccionado */}
        <Card className={cn(
          "shadow-xl border-t-4 transition-all duration-300",
          `border-t-gradient-to-r ${selectedConfig.gradient}`
        )}>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                  selectedConfig.gradient
                )}>
                  <span className="text-2xl">{selectedConfig.emoji}</span>
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedConfig.name}
                    {isDayEnabled(selectedDay) && (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Activo
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {isDayEnabled(selectedDay)
                      ? `${selectedSlots.length} horario${selectedSlots.length !== 1 ? 's' : ''} configurado${selectedSlots.length !== 1 ? 's' : ''} · ${selectedDayLabel}`
                      : 'Día deshabilitado'}
                  </CardDescription>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isDayEnabled(selectedDay)}
                  onClick={() => setTemplateForDay(selectedDay, 'MANANA')}
                  className="hover:bg-yellow-50 hover:border-yellow-300"
                >
                  <Sun className="h-4 w-4 mr-2 text-yellow-600" />
                  Mañana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isDayEnabled(selectedDay)}
                  onClick={() => setTemplateForDay(selectedDay, 'TARDE')}
                  className="hover:bg-orange-50 hover:border-orange-300"
                >
                  <Sunset className="h-4 w-4 mr-2 text-orange-600" />
                  Tarde
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isDayEnabled(selectedDay)}
                  onClick={() => setTemplateForDay(selectedDay, 'COMPLETA')}
                  className="hover:bg-blue-50 hover:border-blue-300"
                >
                  <LayoutTemplate className="h-4 w-4 mr-2 text-blue-600" />
                  Completa
                </Button>
                <Button
                  size="sm"
                  onClick={() => addSlot(selectedDay)}
                  disabled={!isDayEnabled(selectedDay)}
                  className="bg-gradient-to-r from-[#2E8BC0] to-blue-600 hover:from-[#2570a0] hover:to-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Horario
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-0">
            {/* Timeline visual mejorado */}
            {isDayEnabled(selectedDay) && selectedSlots.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#2E8BC0]" />
                  Vista Timeline del Día
                </Label>
                <div className="relative w-full h-20 rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-2 border-slate-200 overflow-hidden shadow-inner">
                  {/* Marcadores de hora */}
                  {[0, 6, 12, 18, 24].map((h) => (
                    <div
                      key={h}
                      className="absolute top-0 bottom-0 border-l-2 border-dashed border-slate-300"
                      style={{ left: `${(h / 24) * 100}%` }}
                    >
                      <div className="absolute -top-1 left-1 bg-white px-1 rounded text-xs font-semibold text-slate-600 shadow-sm">
                        {h.toString().padStart(2, '0')}:00
                      </div>
                    </div>
                  ))}

                  {/* Slots en el timeline */}
                  {selectedSlots.map((slot, i) => {
                    const startMin = minutesFromMidnight(slot.horaInicio);
                    const endMin = minutesFromMidnight(slot.horaFin);
                    const total = 24 * 60;
                    const left = (startMin / total) * 100;
                    const width = ((endMin - startMin) / total) * 100;
                    const isTele = slot.tipo === 'TELECONSULTA';

                    return (
                      <div
                        key={`${slot.horaInicio}-${slot.horaFin}-${i}`}
                        className={cn(
                          'absolute top-8 bottom-2 rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg border-2 transition-transform hover:scale-105 hover:z-10',
                          isTele
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400 text-white'
                        )}
                        style={{
                          left: `${left}%`,
                          width: `${Math.max(width, 8)}%`,
                        }}
                      >
                        {isTele ? (
                          <Video className="h-3 w-3 flex-shrink-0" />
                        ) : (
                          <Building2 className="h-3 w-3 flex-shrink-0" />
                        )}
                        <span className="font-bold text-xs truncate">
                          {slot.horaInicio.substring(0, 5)}
                        </span>
                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                        <span className="font-bold text-xs truncate">
                          {slot.horaFin.substring(0, 5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Duración total del día: {selectedDayLabel}</span>
                  <span>{selectedSlots.length} bloque{selectedSlots.length !== 1 ? 's' : ''} horario{selectedSlots.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Estado: día deshabilitado */}
            {!isDayEnabled(selectedDay) && (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-gray-400" />
                </div>
                <p className="font-semibold text-gray-700 mb-2">
                  Este día está deshabilitado
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Actívalo desde el panel lateral para agregar horarios
                </p>
                <Button
                  variant="outline"
                  onClick={() => toggleDay(selectedDay, true)}
                  className="border-[#2E8BC0] text-[#2E8BC0] hover:bg-blue-50"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Activar {selectedConfig.name}
                </Button>
              </div>
            )}

            {/* Estado: sin horarios */}
            {isDayEnabled(selectedDay) && selectedSlots.length === 0 && (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-dashed border-blue-200">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <p className="font-semibold text-gray-700 mb-2">
                  No hay horarios configurados
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Agrega un bloque horario o usa una plantilla rápida
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => addSlot(selectedDay)}
                    className="bg-[#2E8BC0] hover:bg-[#2570a0]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Horario
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTemplateForDay(selectedDay, 'COMPLETA')}
                  >
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    Usar Plantilla
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de slots editables - mejorada */}
            {isDayEnabled(selectedDay) && selectedSlots.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Bloques Horarios Configurados
                  </Label>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {selectedSlots.map((slot, index) => {
                      const duration = getSlotDurationMinutes(slot);
                      const isTele = slot.tipo === 'TELECONSULTA';

                      return (
                        <Card
                          key={index}
                          className={cn(
                            "shadow-md hover:shadow-lg transition-all duration-200 border-l-4",
                            isTele ? "border-l-purple-500 bg-purple-50/30" : "border-l-blue-500 bg-blue-50/30"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
                              {/* Hora inicio */}
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                  {getTimeOfDayIcon(slot.horaInicio)}
                                  Inicio
                                </Label>
                                <Select
                                  value={slot.horaInicio}
                                  onValueChange={(value: string) =>
                                    updateSlot(selectedDay, index, 'horaInicio', value)
                                  }
                                >
                                  <SelectTrigger className="h-10 bg-white border-gray-300 focus:border-[#2E8BC0] hover:border-[#2E8BC0]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIME_OPTIONS.map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Hora fin */}
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                  {getTimeOfDayIcon(slot.horaFin)}
                                  Fin
                                </Label>
                                <Select
                                  value={slot.horaFin}
                                  onValueChange={(value: string) =>
                                    updateSlot(selectedDay, index, 'horaFin', value)
                                  }
                                >
                                  <SelectTrigger className="h-10 bg-white border-gray-300 focus:border-[#2E8BC0] hover:border-[#2E8BC0]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIME_OPTIONS.map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Tipo */}
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-700">
                                  Modalidad
                                </Label>
                                <Select
                                  value={slot.tipo}
                                  onValueChange={(value: string) =>
                                    updateSlot(selectedDay, index, 'tipo', value as SlotTipo)
                                  }
                                >
                                  <SelectTrigger className="h-10 bg-white border-gray-300 focus:border-[#2E8BC0] hover:border-[#2E8BC0]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PRESENCIAL">
                                      <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-blue-600" />
                                        <span>Presencial</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="TELECONSULTA">
                                      <div className="flex items-center gap-2">
                                        <Video className="h-4 w-4 text-purple-600" />
                                        <span>Teleconsulta</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Botón eliminar */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSlot(selectedDay, index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0"
                                title="Eliminar horario"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Info adicional */}
                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Duración: {formatMinutesToLabel(duration)}
                              </Badge>
                              {isTele ? (
                                <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                                  <Video className="h-3 w-3 mr-1" />
                                  Virtual
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Consultorio
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Copiar a otros días - mejorado */}
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-900">
                      <Copy className="h-4 w-4" />
                      Copiar horario a otros días
                    </CardTitle>
                    <CardDescription className="text-xs text-amber-700">
                      Replica la configuración actual a otros días de la semana
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {WEEK_DAYS.filter((d) => d.index !== selectedDay).map(
                        (day) => {
                          const targetEnabled = isDayEnabled(day.index);
                          return (
                            <Button
                              key={day.index}
                              variant="outline"
                              size="sm"
                              onClick={() => copyDay(selectedDay, day.index)}
                              className={cn(
                                "hover:scale-105 transition-transform",
                                targetEnabled && "bg-green-50 border-green-300"
                              )}
                            >
                              {targetEnabled && (
                                <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                              )}
                              <span className="mr-1">{day.emoji}</span>
                              {day.short}
                            </Button>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
