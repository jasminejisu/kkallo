"use client";

import { useState } from "react";
import Button from "@/app/_components/Button";
import CalorieLog from "@/app/_components/CalorieLog";
import WeeklyModal from "@/app/_components/WeeklyModal";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildWeeks(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks = [];
  let week = Array(firstDay.getDay()).fill(null);

  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function dayClasses(date: Date | null) {
  if (!date) return "bg-gray-100 text-gray-300 cursor-default";
  return "bg-primary-50 text-primary-500 font-semibold";
}

type WeeklyModalState = {
  week: Date[];
};

export default function CalendarBlock({ userId }: { userId: string }) {
  const today = new Date();
  const [current, setCurrent] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [weeklyModal, setWeeklyModal] = useState<WeeklyModalState | null>(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  const weeks = buildWeeks(year, month);

  const monthLabel = current.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  function handleWeekClick(week: (Date | null)[]) {
    const validDays = week.filter(Boolean) as Date[];
    setWeeklyModal({ week: validDays });
  }

  return (
    <div className="w-full max-w-md select-none -mt-10">
      <Button onClick={() => setCurrent(new Date(year, month - 1, 1))}>
        ←
      </Button>
      <h1>{monthLabel}</h1>
      <Button onClick={() => setCurrent(new Date(year, month + 1, 1))}>
        →
      </Button>
      <CalorieLog />
      {/* ── Weeks ── */}
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-cols-7 gap-1.5 transition-transform duration-200 ease-out hover:scale-[1.06] hover:z-10 hover:ring-2 hover:ring-accent-400 hover:ring-offset-1 hover:ring-offset-primary-500 relative cursor-default rounded-lg"
            onClick={() => handleWeekClick(week)}
          >
            {week.map((day, di) => (
              <div
                key={di}
                className={`aspect-square rounded-md flex items-center justify-center text-xs font-semibold transition-opacity ${dayClasses(day)}`}
              >
                {day?.getDate()}
              </div>
            ))}
          </div>
        ))}
      </div>
      {weeklyModal && (
        <WeeklyModal
          week={weeklyModal.week}
          userId={userId}
          onClose={() => setWeeklyModal(null)}
        />
      )}

      {/* ── Legend ── */}
      <div className="flex gap-4 mt-5 justify-center text-[0.7rem] text-primary-300">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary-500 inline-block" />
          Goal met
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-accent-500 inline-block" />
          Partial
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary-800 inline-block" />
          Missed
        </span>
      </div>
    </div>
  );
}
