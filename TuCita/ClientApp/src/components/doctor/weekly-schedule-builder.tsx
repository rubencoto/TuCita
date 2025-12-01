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
  dotColor: string;
}[] = [
  {
    index: 1,
    name: 'Lunes',
    short: 'Lun',
    gradient: 'from-blue-500 to-blue-600',
    dotColor: 'bg-blue-500',
  },
  {
    index: 2,
    name: 'Martes',
    short: 'Mar',
    gradient: 'from-purple-500 to-purple-600',
    dotColor: 'bg-purple-500',
  },
  {
    index: 3,
    name: 'Miércoles',
    short: 'Mié',
    gradient: 'from-pink-500 to-pink-600',
    dotColor: 'bg-pink-500',
  },
  {
    index: 4,
    name: 'Jueves',
    short: 'Jue',
    gradient: 'from-orange-500 to-orange-600',
    dotColor: 'bg-orange-500',
  },
  {
    index: 5,
    name: 'Viernes',
    short: 'Vie',
    gradient: 'from-green-500 to-green-600',
    dotColor: 'bg-green-500',
  },
  {
    index: 6,
    name: 'Sábado',
    short: 'Sáb',
    gradient: 'from-teal-500 to-teal-600',
    dotColor: 'bg-teal-500',
  },
  {
    index: 0,
    name: 'Domingo',
    short: 'Dom',
    gradient: 'from-red-500 to-red-600',
    dotColor: 'bg-red-500',
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

/* ----------------- Helpers de tiempo y validación ----------------- */

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

    if (enabled) {
      newSchedule[dayIndex] = [
        { horaInicio: '09:00', horaFin: '10:00', tipo: 'PRESENCIAL' },
      ];
      toast.success(`${availabilityService.getDayName(dayIndex)} habilitado`, {
        description: 'Se agregó un horario de ejemplo',
      });
    } else {
      const slotsCount = schedule[dayIndex]?.length || 0;
      delete newSchedule[dayIndex];
      toast.info(`${availabilityService.getDayName(dayIndex)} deshabilitado`, {
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

    toast.success('Horario copiado exitosamente', {
      description: `${availabilityService.getDayName(
        fromDay
      )} ? ${availabilityService.getDayName(toDay)}`,
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

    toast.success('Plantilla aplicada', {
      description: `${availabilityService.getDayName(
        dayIndex
      )} - ${template.toLowerCase()}`,
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
    <div className="space-y-3 w-full">
      {/* Header general - más compacto */}
      <Card className="border-[#2E8BC0]/20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#2E8BC0]" />
                Configuración de horario semanal
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                Define tu disponibilidad base semanal
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
                <Clock className="h-3 w-3" />
                {totalSlots} slots
              </Badge>
              <Badge variant="outline" className="px-2 py-1">
                {enabledDaysCount} días
              </Badge>
              <Badge variant="outline" className="px-2 py-1">
                {weeklyHoursLabel} / sem
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <Separator />
          <div className="flex flex-wrap gap-1.5 items-center text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={applyToWeekdaysFromSelected}
              disabled={!isDayEnabled(selectedDay)}
              className="border-[#2E8BC0] text-[#2E8BC0] hover:bg-[#2E8BC0] hover:text-white transition-all h-7 text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Copiar a L-V
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => applyTemplateToWeekdays('COMPLETA')}
              className="flex items-center gap-1 h-7 text-xs"
            >
              <LayoutTemplate className="h-3 w-3" />
              Plantilla L–V
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={totalSlots === 0}
              className="text-red-600 hover:bg-red-50 border-red-200 ml-auto h-7 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] gap-2">
        {/* Panel lateral: días - más compacto */}
        <Card className="h-full">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-xs font-semibold">Días</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            <div className="flex flex-col gap-1">
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
                      'flex items-center justify-between rounded-md border px-1.5 py-1 text-left transition-all',
                      isSelected
                        ? 'border-[#2E8BC0] bg-blue-50/60'
                        : 'border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full flex-shrink-0',
                          enabled ? day.dotColor : 'bg-gray-300'
                        )}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-[11px]">
                          {day.short}
                        </span>
                        <span className="text-[9px] text-gray-500 truncate">
                          {enabled ? `${slotsCount} · ${label}` : 'Off'}
                        </span>
                      </div>
                    </div>

                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked: boolean) =>
                        toggleDay(day.index, checked)
                      }
                      className="scale-[0.7] flex-shrink-0"
                    />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Panel principal - optimizado */}
        <Card className="h-full border-t-4 border-t-[#2E8BC0]/70">
          <CardHeader className="pb-2 pt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full bg-gradient-to-br',
                      selectedConfig.gradient
                    )}
                  />
                  {availabilityService.getDayName(selectedDay)}
                </CardTitle>
                <CardDescription className="text-[10px] mt-0.5">
                  {isDayEnabled(selectedDay)
                    ? `${selectedSlots.length} horario(s) · ${selectedDayLabel}`
                    : 'Deshabilitado'}
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-1 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isDayEnabled(selectedDay)}
                  onClick={() => setTemplateForDay(selectedDay, 'MANANA')}
                  className="h-6 text-[10px] px-2"
                >
                  Mañana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isDayEnabled(selectedDay)}
                  onClick={() => setTemplateForDay(selectedDay, 'TARDE')}
                  className="h-6 text-[10px] px-2"
                >
                  Tarde
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isDayEnabled(selectedDay)}
                  onClick={() => setTemplateForDay(selectedDay, 'COMPLETA')}
                  className="h-6 text-[10px] px-2 flex items-center gap-1"
                >
                  <LayoutTemplate className="h-3 w-3" />
                  Completa
                </Button>
                <Button
                  size="sm"
                  onClick={() => addSlot(selectedDay)}
                  disabled={!isDayEnabled(selectedDay)}
                  className="bg-[#2E8BC0] hover:bg-[#2E8BC0]/90 h-6 text-[10px] px-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Añadir
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 pt-0 overflow-hidden">
            {/* Día deshabilitado */}
            {!isDayEnabled(selectedDay) && (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed">
                <XCircle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-[11px] font-medium text-gray-700 mb-1">
                  Este día está deshabilitado
                </p>
                <p className="text-[9px] text-gray-500">
                  Actívalo desde el panel lateral
                </p>
              </div>
            )}

            {/* Timeline visual - más compacto */}
            {isDayEnabled(selectedDay) && (
              <div className="space-y-1 overflow-hidden">
                <Label className="text-[9px] font-semibold text-gray-700 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Timeline
                </Label>
                <div className="relative w-full h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
                  {[0, 6, 12, 18, 24].map((h) => (
                    <div
                      key={h}
                      className="absolute top-0 bottom-0 border-l border-dashed border-slate-300/70 text-[8px] text-slate-500"
                      style={{ left: `${(h / 24) * 100}%` }}
                    >
                      <span className="absolute top-0.5 left-0.5">
                        {h.toString().padStart(2, '0')}h
                      </span>
                    </div>
                  ))}

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
                          'absolute top-1.5 bottom-1.5 rounded-md px-1 py-0.5 text-[8px] flex items-center gap-0.5 shadow-sm border',
                          isTele
                            ? 'bg-purple-500/80 border-purple-600 text-white'
                            : 'bg-blue-500/80 border-blue-600 text-white'
                        )}
                        style={{
                          left: `${left}%`,
                          width: `${Math.max(width, 4)}%`,
                        }}
                      >
                        <span className="font-semibold truncate">
                          {slot.horaInicio.substring(0, 5)}–{slot.horaFin.substring(0, 5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-slate-500">
                  Total: {selectedDayLabel}
                </p>
              </div>
            )}

            {isDayEnabled(selectedDay) && selectedSlots.length === 0 && (
              <div className="text-center py-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 border-dashed">
                <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <p className="text-[11px] font-medium text-gray-700 mb-1">
                  No hay horarios
                </p>
                <p className="text-[9px] text-gray-500">
                  Agrega un slot o usa plantilla
                </p>
              </div>
            )}

            {isDayEnabled(selectedDay) && selectedSlots.length > 0 && (
              <>
                <Separator className="my-2" />
                {/* Lista editable de slots - ultra compacta */}
                <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                  {selectedSlots.map((slot, index) => (
                    <Card
                      key={index}
                      className="bg-gradient-to-r from-gray-50 to-gray-100/40 border-l-2 border-l-[#2E8BC0] shadow-xs"
                    >
                      <CardContent className="p-1.5">
                        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-1 items-center">
                          <div className="space-y-0 min-w-0">
                            <Label className="text-[8px] font-semibold text-gray-700 truncate">
                              Inicio
                            </Label>
                            <Select
                              value={slot.horaInicio}
                              onValueChange={(value: string) =>
                                updateSlot(selectedDay, index, 'horaInicio', value)
                              }
                            >
                              <SelectTrigger className="h-6 bg-white border-gray-300 focus:border-[#2E8BC0] text-[10px] px-1 w-full min-w-0">
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

                          <div className="space-y-0 min-w-0">
                            <Label className="text-[8px] font-semibold text-gray-700 truncate">
                              Fin
                            </Label>
                            <Select
                              value={slot.horaFin}
                              onValueChange={(value: string) =>
                                updateSlot(selectedDay, index, 'horaFin', value)
                              }
                            >
                              <SelectTrigger className="h-6 bg-white border-gray-300 focus:border-[#2E8BC0] text-[10px] px-1 w-full min-w-0">
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

                          <div className="space-y-0 min-w-0">
                            <Label className="text-[8px] font-semibold text-gray-700 truncate">
                              Tipo
                            </Label>
                            <Select
                              value={slot.tipo}
                              onValueChange={(value: string) =>
                                updateSlot(selectedDay, index, 'tipo', value as SlotTipo)
                              }
                            >
                              <SelectTrigger className="h-6 bg-white border-gray-300 focus:border-[#2E8BC0] text-[10px] px-1 w-full min-w-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PRESENCIAL">
                                  <div className="flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-blue-500" />
                                    Pres.
                                  </div>
                                </SelectItem>
                                <SelectItem value="TELECONSULTA">
                                  <div className="flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-purple-500" />
                                    Tele.
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSlot(selectedDay, index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0 self-end flex-shrink-0"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator className="my-1.5" />

                {/* Copiar a otros días - compacto */}
                <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                  <Label className="text-[9px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Copy className="h-2.5 w-2.5 text-[#2E8BC0]" />
                    Copiar a otros días
                  </Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {WEEK_DAYS.filter((d) => d.index !== selectedDay).map(
                      (day) => (
                        <Button
                          key={day.index}
                          variant="outline"
                          size="sm"
                          onClick={() => copyDay(selectedDay, day.index)}
                          className="hover:bg-white hover:border-[#2E8BC0] text-[9px] h-5 px-1.5"
                        >
                          {isDayEnabled(day.index) && (
                            <CheckCircle2 className="h-2 w-2 mr-0.5 text-green-600" />
                          )}
                          {day.short}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
