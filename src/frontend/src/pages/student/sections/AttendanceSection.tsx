import { GlassCard } from "@/components/ui/GlassCard";
import { HUDCircle } from "@/components/ui/HUDCircle";
import { Skeleton } from "@/components/ui/skeleton";
import type { AttendanceRecord } from "@/types";
import { AttendanceStatus } from "@/types";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  attendance: AttendanceRecord[];
  isLoading: boolean;
}

const SAMPLE_ATTENDANCE: AttendanceRecord[] = [
  {
    studentId: "s1",
    subject: "Data Structures",
    date: "2026-04-01",
    status: AttendanceStatus.present,
  },
  {
    studentId: "s1",
    subject: "Data Structures",
    date: "2026-04-02",
    status: AttendanceStatus.present,
  },
  {
    studentId: "s1",
    subject: "Algorithms",
    date: "2026-04-01",
    status: AttendanceStatus.present,
  },
  {
    studentId: "s1",
    subject: "Algorithms",
    date: "2026-04-03",
    status: AttendanceStatus.absent,
  },
  {
    studentId: "s1",
    subject: "OS",
    date: "2026-04-02",
    status: AttendanceStatus.present,
  },
  {
    studentId: "s1",
    subject: "OS",
    date: "2026-04-04",
    status: AttendanceStatus.late,
  },
  {
    studentId: "s1",
    subject: "Networks",
    date: "2026-04-01",
    status: AttendanceStatus.present,
  },
  {
    studentId: "s1",
    subject: "Networks",
    date: "2026-04-03",
    status: AttendanceStatus.present,
  },
  {
    studentId: "s1",
    subject: "DBMS",
    date: "2026-04-02",
    status: AttendanceStatus.absent,
  },
  {
    studentId: "s1",
    subject: "DBMS",
    date: "2026-04-04",
    status: AttendanceStatus.present,
  },
];

function statusLabel(s: AttendanceStatus) {
  if (s === AttendanceStatus.present) return "Present";
  if (s === AttendanceStatus.absent) return "Absent";
  return "Late";
}

function statusStyle(s: AttendanceStatus) {
  if (s === AttendanceStatus.present)
    return "bg-primary/10 text-primary border border-primary/20";
  if (s === AttendanceStatus.absent)
    return "bg-accent/10 text-accent border border-accent/20";
  return "bg-secondary/10 text-secondary border border-secondary/20";
}

export function AttendanceSection({ attendance, isLoading }: Props) {
  const data = attendance.length > 0 ? attendance : SAMPLE_ATTENDANCE;

  const present = data.filter(
    (a) => a.status === AttendanceStatus.present,
  ).length;
  const absent = data.filter(
    (a) => a.status === AttendanceStatus.absent,
  ).length;
  const late = data.filter((a) => a.status === AttendanceStatus.late).length;
  const pct = data.length > 0 ? Math.round((present / data.length) * 100) : 0;

  // Per-subject stats
  const subjects = [...new Set(data.map((a) => a.subject))];
  const subjectData = subjects.map((subj) => {
    const records = data.filter((a) => a.subject === subj);
    const pres = records.filter(
      (a) => a.status === AttendanceStatus.present,
    ).length;
    return {
      subject: subj.slice(0, 10),
      attendance: Math.round((pres / records.length) * 100),
    };
  });

  const recentRecords = [...data].reverse().slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 rounded-full bg-primary shadow-glow-cyan" />
        <h2 className="text-xl font-display font-black text-foreground">
          Attendance Tracker
        </h2>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* HUD Ring */}
          <GlassCard
            glowColor="cyan"
            className="p-6 flex flex-col items-center justify-center"
          >
            <HUDCircle size={120} color="cyan" speed="slow" innerRing>
              <div className="text-center">
                <div className="text-3xl font-display font-black text-primary">
                  {pct}%
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  Overall
                </div>
              </div>
            </HUDCircle>
            <div className="mt-5 grid grid-cols-3 gap-3 w-full">
              <div className="text-center p-2 rounded-lg bg-primary/10 border border-primary/20">
                <div className="text-lg font-display font-bold text-primary">
                  {present}
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  Present
                </div>
              </div>
              <div className="text-center p-2 rounded-lg bg-accent/10 border border-accent/20">
                <div className="text-lg font-display font-bold text-accent">
                  {absent}
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  Absent
                </div>
              </div>
              <div className="text-center p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                <div className="text-lg font-display font-bold text-secondary">
                  {late}
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  Late
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Bar chart */}
          <GlassCard glowColor="yellow" className="p-5 lg:col-span-2">
            <h3 className="font-display font-semibold text-foreground mb-4 text-sm">
              Attendance by Subject
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={subjectData}
                margin={{ top: 0, right: 10, bottom: 20, left: -10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(var(--border) / 0.2)"
                />
                <XAxis
                  dataKey="subject"
                  tick={{
                    fill: "oklch(var(--muted-foreground))",
                    fontSize: 10,
                  }}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis
                  tick={{
                    fill: "oklch(var(--muted-foreground))",
                    fontSize: 10,
                  }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                    borderRadius: "8px",
                    color: "oklch(var(--foreground))",
                  }}
                />
                <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                  {subjectData.map((entry) => (
                    <Cell
                      key={`cell-${entry.subject}`}
                      fill={
                        entry.attendance >= 75
                          ? "oklch(var(--primary) / 0.7)"
                          : "oklch(var(--accent) / 0.7)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      )}

      {/* Recent records */}
      <GlassCard glowColor="none" className="p-5">
        <h3 className="font-display font-semibold text-foreground mb-4 text-sm">
          Recent Attendance
        </h3>
        <div className="space-y-2">
          {recentRecords.map((rec, i) => (
            <motion.div
              key={`${rec.date}-${rec.subject}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-2.5 rounded-lg glass-effect-darker border border-border/20"
            >
              <div className="text-xs font-mono text-muted-foreground w-20 flex-shrink-0">
                {rec.date}
              </div>
              <div className="flex-1 text-sm text-foreground font-medium truncate">
                {rec.subject}
              </div>
              <span
                className={`px-2 py-0.5 rounded text-xs font-mono ${statusStyle(rec.status)}`}
              >
                {statusLabel(rec.status)}
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
