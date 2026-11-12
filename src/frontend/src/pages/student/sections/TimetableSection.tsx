import { GlassCard } from "@/components/ui/GlassCard";
import type { TimetableEntry } from "@/types";
import { motion } from "motion/react";

interface Props {
  timetable: TimetableEntry[];
  faculty: string | undefined;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SAMPLE_TIMETABLE: TimetableEntry[] = [
  {
    day: "Monday",
    subject: "Data Structures",
    time: "09:00-10:00",
    room: "CS-101",
    teacher: "Dr. Sharma",
  },
  {
    day: "Monday",
    subject: "Operating Systems",
    time: "11:00-12:00",
    room: "CS-203",
    teacher: "Prof. Verma",
  },
  {
    day: "Tuesday",
    subject: "Computer Networks",
    time: "09:00-10:00",
    room: "IT-105",
    teacher: "Dr. Gupta",
  },
  {
    day: "Tuesday",
    subject: "DBMS",
    time: "14:00-15:00",
    room: "CS-301",
    teacher: "Prof. Singh",
  },
  {
    day: "Wednesday",
    subject: "Algorithms",
    time: "10:00-11:00",
    room: "CS-102",
    teacher: "Dr. Patel",
  },
  {
    day: "Wednesday",
    subject: "Software Eng.",
    time: "13:00-14:00",
    room: "CS-204",
    teacher: "Prof. Kumar",
  },
  {
    day: "Thursday",
    subject: "Machine Learning",
    time: "09:00-10:00",
    room: "AI-201",
    teacher: "Dr. Rao",
  },
  {
    day: "Thursday",
    subject: "Data Structures",
    time: "15:00-16:00",
    room: "CS-101",
    teacher: "Dr. Sharma",
  },
  {
    day: "Friday",
    subject: "Computer Networks",
    time: "10:00-11:00",
    room: "IT-105",
    teacher: "Dr. Gupta",
  },
  {
    day: "Friday",
    subject: "Algorithms",
    time: "14:00-15:00",
    room: "CS-102",
    teacher: "Dr. Patel",
  },
];

const SUBJECT_COLORS = [
  { bg: "bg-primary/15", border: "border-primary/30", text: "text-primary" },
  {
    bg: "bg-secondary/15",
    border: "border-secondary/30",
    text: "text-secondary",
  },
  { bg: "bg-accent/15", border: "border-accent/30", text: "text-accent" },
  { bg: "bg-chart-4/15", border: "border-chart-4/30", text: "text-chart-4" },
  { bg: "bg-chart-5/15", border: "border-chart-5/30", text: "text-chart-5" },
];

function getSubjectColor(subject: string) {
  let hash = 0;
  for (let i = 0; i < subject.length; i++)
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

function getTodayName() {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][new Date().getDay()];
}

export function TimetableSection({ timetable, faculty }: Props) {
  const data = timetable.length > 0 ? timetable : SAMPLE_TIMETABLE;
  const today = getTodayName();

  const byDay = DAYS.map((day) => ({
    day,
    isToday: day === today,
    entries: data
      .filter((e) => e.day === day)
      .sort((a, b) => a.time.localeCompare(b.time)),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 rounded-full bg-secondary shadow-glow-yellow" />
        <h2 className="text-xl font-display font-black text-foreground">
          Weekly Timetable
        </h2>
        {faculty && (
          <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-secondary/10 text-secondary border border-secondary/20">
            {faculty}
          </span>
        )}
      </div>
      {/* Desktop: 5-col grid */}
      <div className="hidden md:grid grid-cols-5 gap-3">
        {byDay.map(({ day, isToday, entries }) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: DAYS.indexOf(day) * 0.08 }}
          >
            <div
              className={`rounded-xl border p-3 space-y-2 ${isToday ? "border-primary/50 shadow-glow-cyan bg-primary/5" : "border-border/20 glass-effect"}`}
            >
              <div
                className={`text-center py-1.5 rounded-lg text-xs font-display font-bold tracking-widest uppercase ${isToday ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
              >
                {day.slice(0, 3)}
                {isToday && <span className="ml-1 text-primary/60">●</span>}
              </div>
              {entries.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  —
                </div>
              ) : (
                entries.map((e) => {
                  const col = getSubjectColor(e.subject);
                  return (
                    <motion.div
                      key={`${e.time}-${e.subject}`}
                      whileHover={{ scale: 1.02 }}
                      className={`p-2.5 rounded-lg border ${col.bg} ${col.border} cursor-default group`}
                    >
                      <div
                        className={`text-xs font-display font-bold ${col.text} truncate`}
                      >
                        {e.subject}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        {e.time}
                      </div>
                      <div className="text-xs text-muted-foreground truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {e.room}
                      </div>
                      <div className="text-xs text-muted-foreground truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {e.teacher}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        ))}
      </div>
      {/* Mobile: scrollable list */}
      <div className="md:hidden overflow-x-auto">
        <div className="flex gap-3 pb-3" style={{ minWidth: "max-content" }}>
          {byDay.map(({ day, isToday, entries }) => (
            <div
              key={day}
              className={`w-48 flex-shrink-0 rounded-xl border p-3 space-y-2 ${isToday ? "border-primary/50 shadow-glow-cyan bg-primary/5" : "border-border/20 glass-effect"}`}
            >
              <div
                className={`text-center py-1.5 rounded-lg text-xs font-display font-bold uppercase ${isToday ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
              >
                {day}
              </div>
              {entries.length === 0 ? (
                <div className="text-center py-3 text-xs text-muted-foreground">
                  No classes
                </div>
              ) : (
                entries.map((e) => {
                  const col = getSubjectColor(e.subject);
                  return (
                    <div
                      key={`${e.time}-${e.subject}`}
                      className={`p-2 rounded-lg border ${col.bg} ${col.border}`}
                    >
                      <div className={`text-xs font-bold ${col.text}`}>
                        {e.subject}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {e.time}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {e.room}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
