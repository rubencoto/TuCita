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
  accentColor: string;
  textMuted: string;
  emoji: string;
}[] = [
  {
    index: 1,
    name: 'Lunes',
    short: 'Lun',
    accentColor: 'border-l-sky-500',
    textMuted: 'text-sky-700',
    emoji: '💼',
  },
  {
    index: 2,
    name: 'Martes',
    short: 'Mar',
    accentColor: 'border-l-indigo-500',
    textMuted: 'text-indigo-700',
    emoji: '📅',
  },
  {
    index: 3,
    name: 'Miércoles',
    short: 'Mié',
    accentColor: 'border-l-violet-500',
    textMuted: 'text-violet-700',
    emoji: '📋',
  },
  {
    index: 4,
    name: 'Jueves',
    short: 'Jue',
    accentColor: 'border-l-amber-500',
    textMuted: 'text-amber-700',
    emoji: '📝',
  },
  {
    index: 5,
    name: 'Viernes',
    short: 'Vie',
    accentColor: 'border-l-emerald-500',
    textMuted: 'text-emerald-700',
    emoji: '🎉',
  },
  {
    index: 6,
    name: 'Sábado',
    short: 'Sáb',
    accentColor: 'border-l-teal-500',
    textMuted: 'text-teal-700',
    emoji: '🌤️',
  },
  {
    index: 0,
    name: 'Domingo',
    short: 'Dom',
    accentColor: 'border-l-rose-500',
    textMuted: 'text-rose-700',
    emoji: '☀️',
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
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
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
        description: 'Se agregó un horario de ejemplo.',
      });
    } else {
      const slotsCount = schedule[dayIndex]?.length || 0;
      delete newSchedule[dayIndex];
      toast.info(`${dayName} deshabilitado`, {
        description:
          slotsCount > 0 ? `Se eliminaron ${slotsCount} horario(s).` : undefined,
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
        description: 'El día de origen no tiene horarios configurados.',
      });
      return;
    }

    const newSchedule = { ...schedule };
    newSchedule[toDay] = cloneSlots(schedule[fromDay]);
    updateSchedule(newSchedule);

    const fromName = getDayConfig(fromDay).name;
    const toName = getDayConfig(toDay).name;

    toast.success('Horario copiado', {
      description: `${fromName} → ${toName}`,
    });
  };

  const applyToWeekdaysFromSelected = () => {
    if (!schedule[selectedDay] || schedule[selectedDay].length === 0) {
      toast.error('Configura horarios primero', {
        description: 'Agrega al menos un horario al día seleccionado.',
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
      description: `${template.length} horario(s) por día.`,
      icon: <Sparkles className="h-4 w-4" />,
    });
  };

  const clearAll = () => {
    const count = totalSlots;
    updateSchedule({});
    toast.success('Todos los horarios eliminados', {
      description: count > 0 ? `Se eliminaron ${count} horario(s).` : undefined,
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
      description: `Plantilla ${template.toLowerCase()} Lunes-Viernes.`,
    });
  };

  const selectedConfig = getDayConfig(selectedDay);
  const selectedSlots = schedule[selectedDay] || [];
  const selectedDayMinutes = getSlotsDurationMinutes(selectedSlots);
  const selectedDayLabel = formatMinutesToLabel(selectedDayMinutes);

  return (
    <div className="space-y-6 w-full">
      {/* Header profesional */}
      <Card className="border border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-sky-50 border border-sky-100 p-2">
                <Calendar className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Configuración de horario semanal
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Define la disponibilidad base del médico para la agenda de citas.
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg border border-slate-200 px-3 py-2 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Total de bloques</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {totalSlots}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 px-3 py-2 bg-slate-50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Días activos</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {enabledDaysCount}/7
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 px-3 py-2 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-500">Carga semanal</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {weeklyHoursLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={applyToWeekdaysFromSelected}
              disabled={!isDayEnabled(selectedDay)}
              className="border-sky-500 text-sky-700 hover:bg-sky-50"
            >
              <Zap className="h-4 w-4 mr-2" />
              Copiar día a L-V
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => applyTemplateToWeekdays('MANANA')}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Sun className="h-4 w-4 mr-2" />
              Mañanas L-V
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => applyTemplateToWeekdays('COMPLETA')}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Jornada completa L-V
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={totalSlots === 0}
              className="ml-auto border-rose-400 text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar todo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar: Días de la semana */}
        <div className="space-y-3">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                <Calendar className="h-4 w-4 text-sky-600" />
                Días de la semana
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Activa o desactiva días y selecciona uno para editar su detalle.
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
                      'w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-all duration-150',
                      'border-slate-200 bg-white hover:bg-slate-50',
                      enabled ? 'opacity-100' : 'opacity-60',
                      isSelected && 'border-sky-500 ring-1 ring-sky-100'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                        {day.short}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={cn(
                            'text-sm font-medium text-slate-900',
                            isSelected && selectedConfig.index === day.index && selectedConfig.textMuted
                          )}
                        >
                          {day.name}
                        </span>
                        <span className="text-xs text-slate-500 truncate">
                          {enabled ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              {slotsCount} bloque
                              {slotsCount !== 1 ? 's' : ''} · {label}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-slate-400" />
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
          <Card className="border border-slate-200 shadow-sm bg-slate-50/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-900">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Resumen semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Horas totales</span>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                  {weeklyHoursLabel}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Días activos</span>
                <Badge variant="outline" className="border-slate-200 text-slate-700">
                  {enabledDaysCount} de 7
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Bloques totales</span>
                <Badge variant="outline" className="border-slate-200 text-slate-700">
                  {totalSlots}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel principal - día seleccionado */}
        <Card className="shadow-sm border border-slate-200 relative overflow-hidden">
          {/* Barra superior de acento */}
          <div
            className={cn(
              'absolute inset-x-0 top-0 h-1',
              'bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500'
            )}
          />
          <CardHeader className="pb-4 pt-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-lg" aria-hidden>
                    {selectedConfig.emoji}
                  </span>
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                    {selectedConfig.name}
                    {isDayEnabled(selectedDay) && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Activo
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    {isDayEnabled(selectedDay)
                      ? `${selectedSlots.length} bloque${
                          selectedSlots.length !== 1 ? 's' : ''
                        } configurado${
                          selectedSlots.length !== 1 ? 's' : ''
                        } · ${selectedDayLabel}`
                      : 'Día deshabilitado actualmente.'}
                  </CardDescription>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isDayEnabled(selectedDay)}
                  onClick={() => setTemplateForDay(selectedDay, 'MANANA')}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Sun className="h-4 w-4 mr-2 text-amber-500" />
                  Mañana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isDayEnabled(selectedDay)}
                  onClick={() => setTemplateForDay(selectedDay, 'TARDE')}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Sunset className="h-4 w-4 mr-2 text-orange-500" />
                  Tarde
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isDayEnabled(selectedDay)}
                  onClick={() => setTemplateForDay(selectedDay, 'COMPLETA')}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <LayoutTemplate className="h-4 w-4 mr-2 text-sky-600" />
                  Completa
                </Button>
                <Button
                  size="sm"
                  onClick={() => addSlot(selectedDay)}
                  disabled={!isDayEnabled(selectedDay)}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir bloque
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-0 pb-4">
            {/* Timeline visual */}
            {isDayEnabled(selectedDay) && selectedSlots.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-600" />
                  Distribución del día
                </Label>
                <div className="relative w-full h-16 rounded-md bg-slate-50 border border-slate-200 overflow-hidden">
                  {/* Marcadores de hora */}
                  {[0, 6, 12, 18, 24].map((h) => (
                    <div
                      key={h}
                      className="absolute top-0 bottom-0 border-l border-dashed border-slate-200"
                      style={{ left: `${(h / 24) * 100}%` }}
                    >
                      <div className="absolute top-0 left-1 mt-0.5 rounded bg-white/80 px-1 text-[10px] font-medium text-slate-500">
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
                          'absolute bottom-1 top-6 rounded-md px-2 py-1 flex items-center gap-1 text-[11px] font-medium shadow-sm border',
                          isTele
                            ? 'bg-violet-50 border-violet-300 text-violet-700'
                            : 'bg-sky-50 border-sky-300 text-sky-700'
                        )}
                        style={{
                          left: `${left}%`,
                          width: `${Math.max(width, 8)}%`,
                        }}
                      >
                        {isTele ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <Building2 className="h-3 w-3" />
                        )}
                        <span>{slot.horaInicio.substring(0, 5)}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{slot.horaFin.substring(0, 5)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Duración total del día: {selectedDayLabel}</span>
                  <span>
                    {selectedSlots.length} bloque
                    {selectedSlots.length !== 1 ? 's' : ''} horario
                    {selectedSlots.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Estado: día deshabilitado */}
            {!isDayEnabled(selectedDay) && (
              <div className="text-center py-10 rounded-md border border-dashed border-slate-300 bg-slate-50">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
                  <XCircle className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-800 mb-1">
                  Día deshabilitado
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Activa el día desde el panel lateral para configurar su disponibilidad.
                </p>
                <Button
                  variant="outline"
                  onClick={() => toggleDay(selectedDay, true)}
                  className="border-sky-500 text-sky-700 hover:bg-sky-50"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Activar {selectedConfig.name}
                </Button>
              </div>
            )}

            {/* Estado: sin horarios */}
            {isDayEnabled(selectedDay) && selectedSlots.length === 0 && (
              <div className="text-center py-10 rounded-md border border-dashed border-sky-200 bg-sky-50/40">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                  <Clock className="h-6 w-6 text-sky-600" />
                </div>
                <p className="text-sm font-medium text-slate-800 mb-1">
                  No hay bloques configurados
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Agrega un bloque horario o aplica una plantilla rápida.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => addSlot(selectedDay)}
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar bloque
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setTemplateForDay(selectedDay, 'COMPLETA')}
                    className="border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    Usar plantilla
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de slots editables */}
            {isDayEnabled(selectedDay) && selectedSlots.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-800">
                    Bloques horarios configurados
                  </Label>
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {selectedSlots.map((slot, index) => {
                      const duration = getSlotDurationMinutes(slot);
                      const isTele = slot.tipo === 'TELECONSULTA';

                      return (
                        <Card
                          key={index}
                          className={cn(
                            'shadow-xs border border-slate-200',
                            'hover:border-sky-300 hover:shadow-sm transition-colors duration-150'
                          )}
                        >
                          <CardContent className="p-3">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
                              {/* Hora inicio */}
                              <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                                  {getTimeOfDayIcon(slot.horaInicio)}
                                  Inicio
                                </Label>
                                <Select
                                  value={slot.horaInicio}
                                  onValueChange={(value: string) =>
                                    updateSlot(selectedDay, index, 'horaInicio', value)
                                  }
                                >
                                  <SelectTrigger className="h-9 bg-white border-slate-200 focus:border-sky-500 focus:ring-sky-200">
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
                              <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                                  {getTimeOfDayIcon(slot.horaFin)}
                                  Fin
                                </Label>
                                <Select
                                  value={slot.horaFin}
                                  onValueChange={(value: string) =>
                                    updateSlot(selectedDay, index, 'horaFin', value)
                                  }
                                >
                                  <SelectTrigger className="h-9 bg-white border-slate-200 focus:border-sky-500 focus:ring-sky-200">
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
                              <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-700">
                                  Modalidad
                                </Label>
                                <Select
                                  value={slot.tipo}
                                  onValueChange={(value: string) =>
                                    updateSlot(
                                      selectedDay,
                                      index,
                                      'tipo',
                                      value as SlotTipo
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-9 bg-white border-slate-200 focus:border-sky-500 focus:ring-sky-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PRESENCIAL">
                                      <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-sky-600" />
                                        <span>Presencial</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="TELECONSULTA">
                                      <div className="flex items-center gap-2">
                                        <Video className="h-4 w-4 text-violet-600" />
                                        <span>Teleconsulta</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Botón eliminar */}
                              <div className="flex md:justify-end md:items-end">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSlot(selectedDay, index)}
                                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-9 w-9"
                                  title="Eliminar horario"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Info adicional */}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                              <Badge
                                variant="outline"
                                className="border-slate-200 text-slate-700 flex items-center gap-1"
                              >
                                <Clock className="h-3 w-3" />
                                Duración: {formatMinutesToLabel(duration)}
                              </Badge>
                              {isTele ? (
                                <Badge className="bg-violet-50 text-violet-700 border-violet-200">
                                  <Video className="h-3 w-3 mr-1" />
                                  Teleconsulta
                                </Badge>
                              ) : (
                                <Badge className="bg-sky-50 text-sky-700 border-sky-200">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Presencial
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

                {/* Copiar a otros días */}
                <Card className="border border-amber-200 bg-amber-50/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-900">
                      <Copy className="h-4 w-4" />
                      Copiar a otros días
                    </CardTitle>
                    <CardDescription className="text-xs text-amber-700">
                      Replica la configuración actual en otros días de la semana.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-1">
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
                                'border-slate-200 text-slate-700 hover:bg-amber-100/60 transition-colors',
                                targetEnabled && 'bg-emerald-50 border-emerald-200'
                              )}
                            >
                              {targetEnabled && (
                                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                              )}
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
