"use client";

import { useState } from "react";
import { clsx } from "clsx";

interface Appointment {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
}

interface CalendarGridProps {
  appointments: Appointment[];
  onDayClick?: (date: Date) => void;
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "#58a6ff",
  CONFIRMED: "#3fb950",
  CANCELLED: "#f85149",
  COMPLETED: "#8b949e",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function CalendarGrid({ appointments, onDayClick }: CalendarGridProps) {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date | null>(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const apptsByDate = appointments.reduce<Record<string, Appointment[]>>((acc, appt) => {
    const d = new Date(appt.startAt).toDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(appt);
    return acc;
  }, {});

  const selectedAppts = selected ? (apptsByDate[selected.toDateString()] ?? []) : [];

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262d]">
        <button onClick={prevMonth} className="text-[#8b949e] hover:text-[#e6edf3] px-2 py-1 rounded transition-colors">
          ←
        </button>
        <span className="text-sm font-semibold text-[#e6edf3]">
          {MONTHS[month]} {year}
        </span>
        <button onClick={nextMonth} className="text-[#8b949e] hover:text-[#e6edf3] px-2 py-1 rounded transition-colors">
          →
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-[#21262d]">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] text-[#8b949e] py-2 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="h-16 border-b border-r border-[#21262d]/50" />;

          const date = new Date(year, month, day);
          const dateStr = date.toDateString();
          const dayAppts = apptsByDate[dateStr] ?? [];
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = selected?.toDateString() === dateStr;

          return (
            <button
              key={i}
              onClick={() => {
                setSelected(date);
                onDayClick?.(date);
              }}
              className={clsx(
                "h-16 border-b border-r border-[#21262d]/50 p-1 text-left hover:bg-[#0f1117] transition-colors",
                isSelected && "bg-[#0f1117] border-[#58a6ff]/30"
              )}
            >
              <div
                className={clsx(
                  "text-xs w-6 h-6 flex items-center justify-center rounded-full mb-1 font-medium",
                  isToday ? "bg-[#58a6ff] text-white" : "text-[#8b949e]",
                  isSelected && !isToday && "bg-[#21262d] text-[#e6edf3]"
                )}
              >
                {day}
              </div>
              <div className="flex flex-col gap-0.5">
                {dayAppts.slice(0, 2).map((appt) => (
                  <div
                    key={appt.id}
                    className="text-[9px] truncate rounded px-0.5 font-medium"
                    style={{
                      color: STATUS_COLORS[appt.status] ?? "#8b949e",
                      backgroundColor: `${STATUS_COLORS[appt.status]}20`,
                    }}
                  >
                    {appt.title}
                  </div>
                ))}
                {dayAppts.length > 2 && (
                  <div className="text-[9px] text-[#8b949e]">+{dayAppts.length - 2} more</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day appointments */}
      {selected && (
        <div className="border-t border-[#21262d] px-4 py-3 bg-[#0f1117]">
          <div className="text-xs font-medium text-[#8b949e] mb-2">
            {selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
          {selectedAppts.length === 0 ? (
            <div className="text-xs text-[#8b949e]/60">No appointments</div>
          ) : (
            <div className="space-y-2">
              {selectedAppts.map((appt) => (
                <div key={appt.id} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[appt.status] ?? "#8b949e" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#e6edf3] truncate">{appt.title}</div>
                    <div className="text-[10px] text-[#8b949e]">
                      {new Date(appt.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                      {new Date(appt.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ color: STATUS_COLORS[appt.status], backgroundColor: `${STATUS_COLORS[appt.status]}20` }}
                  >
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
