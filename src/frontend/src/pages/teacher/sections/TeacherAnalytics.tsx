import { BarChart2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard } from "../../../components/ui/GlassCard";
import {
  useGetStudentAttendance,
  useGetStudentGrades,
} from "../../../hooks/useQueries";
import type { UserProfile } from "../../../types";
import { MOCK_STUDENTS } from "./mockData";

interface Props {
  students: UserProfile[];
}

const MOCK_ATTENDANCE_DATA = [
  { name: "Arjun", rate: 92 },
  { name: "Priya", rate: 78 },
  { name: "Rahul", rate: 85 },
  { name: "Sneha", rate: 96 },
  { name: "Dev", rate: 70 },
  { name: "Anjali", rate: 88 },
];

const MOCK_GRADE_TREND = [
  { month: "Jan", avg: 72, highest: 88, lowest: 60 },
  { month: "Feb", avg: 75, highest: 91, lowest: 62 },
  { month: "Mar", avg: 79, highest: 94, lowest: 65 },
  { month: "Apr", avg: 82, highest: 96, lowest: 68 },
];

const MOCK_RADAR_DATA = [
  { subject: "Math", classAvg: 78 },
  { subject: "Physics", classAvg: 72 },
  { subject: "Chemistry", classAvg: 65 },
  { subject: "English", classAvg: 82 },
  { subject: "CS", classAvg: 88 },
  { subject: "Biology", classAvg: 70 },
];

const NEON_CYAN = "oklch(0.7 0.22 190)";
const NEON_YELLOW = "oklch(0.75 0.2 95)";
const NEON_MAGENTA = "oklch(0.65 0.24 305)";
const TOOLTIP_STYLE = {
  backgroundColor: "oklch(0.16 0.012 245 / 0.95)",
  border: "1px solid oklch(0.25 0.012 245 / 0.4)",
  borderRadius: "8px",
  color: "oklch(0.95 0.01 245)",
  fontSize: "12px",
  fontFamily: "monospace",
};
const AXIS_TICK = {
  fill: "oklch(0.6 0.008 245)",
  fontSize: 11,
  fontFamily: "monospace",
};

function StudentAttendanceBar({ student }: { student: UserProfile }) {
  const { data: records = [] } = useGetStudentAttendance(student.id);
  const presentCount = records.filter((r) => r.status === "present").length;
  const rate =
    records.length > 0 ? Math.round((presentCount / records.length) * 100) : 75;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-20 truncate">
        {student.name.split(" ")[0]}
      </span>
      <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${rate}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-mono text-primary w-10 text-right">
        {records.length > 0 ? `${rate}%` : "—"}
      </span>
    </div>
  );
}

function StudentGradeCard({ student }: { student: UserProfile }) {
  const { data: grades = [] } = useGetStudentGrades(student.id);
  const avg =
    grades.length > 0
      ? Math.round(grades.reduce((a, g) => a + g.marks, 0) / grades.length)
      : null;
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg glass-effect-darker border border-border/20">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full border border-secondary/40 bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
          {student.name.charAt(0)}
        </div>
        <span className="text-sm text-foreground">{student.name}</span>
      </div>
      <span
        className={`text-sm font-mono font-bold ${
          avg !== null
            ? avg >= 80
              ? "text-primary"
              : avg >= 60
                ? "text-secondary"
                : "text-accent"
            : "text-muted-foreground"
        }`}
      >
        {avg !== null ? `${avg}%` : "—"}
      </span>
    </div>
  );
}

export function TeacherAnalytics({ students }: Props) {
  const data = students.length > 0 ? students : MOCK_STUDENTS;
  const hasRealStudents = students.length > 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Attendance bar chart */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard glowColor="cyan" className="p-5">
            <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-primary" />
              Attendance Rates
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MOCK_ATTENDANCE_DATA} barSize={24}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.25 0.012 245 / 0.3)"
                />
                <XAxis
                  dataKey="name"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: "oklch(0.7 0.22 190 / 0.05)" }}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {MOCK_ATTENDANCE_DATA.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.rate >= 85
                          ? NEON_CYAN
                          : entry.rate >= 70
                            ? NEON_YELLOW
                            : NEON_MAGENTA
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Grade trend */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <GlassCard glowColor="yellow" className="p-5">
            <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-secondary" />
              Grade Trends
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={MOCK_GRADE_TREND}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.25 0.012 245 / 0.3)"
                />
                <XAxis
                  dataKey="month"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  domain={[50, 100]}
                  unit="%"
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  wrapperStyle={{
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "oklch(0.6 0.008 245)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke={NEON_CYAN}
                  strokeWidth={2}
                  dot={{ fill: NEON_CYAN, r: 4 }}
                  name="Class Avg"
                />
                <Line
                  type="monotone"
                  dataKey="highest"
                  stroke={NEON_YELLOW}
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  name="Highest"
                />
                <Line
                  type="monotone"
                  dataKey="lowest"
                  stroke={NEON_MAGENTA}
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  name="Lowest"
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <GlassCard glowColor="magenta" className="p-5">
            <h3 className="font-display font-bold text-foreground mb-4">
              Class Average — All Subjects
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={MOCK_RADAR_DATA}>
                <PolarGrid stroke="oklch(0.25 0.012 245 / 0.4)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fill: "oklch(0.6 0.008 245)",
                    fontSize: 10,
                    fontFamily: "monospace",
                  }}
                />
                <Radar
                  name="Class Avg"
                  dataKey="classAvg"
                  stroke={NEON_MAGENTA}
                  fill={NEON_MAGENTA}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Performance summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <GlassCard glowColor="yellow" className="p-5">
            <h3 className="font-display font-bold text-foreground mb-4">
              Student Performance Summary
            </h3>
            {hasRealStudents ? (
              <div className="space-y-2">
                {data.map((student) => (
                  <StudentGradeCard key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  { name: "Arjun Sharma", avg: 85 },
                  { name: "Priya Patel", avg: 79 },
                  { name: "Rahul Kumar", avg: 91 },
                  { name: "Sneha Iyer", avg: 67 },
                  { name: "Dev Mehta", avg: 73 },
                  { name: "Anjali Singh", avg: 88 },
                ].map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between p-2.5 rounded-lg glass-effect-darker border border-border/20"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full border border-secondary/40 bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
                        {s.name.charAt(0)}
                      </div>
                      <span className="text-sm text-foreground">{s.name}</span>
                    </div>
                    <span
                      className={`text-sm font-mono font-bold ${s.avg >= 80 ? "text-primary" : s.avg >= 60 ? "text-secondary" : "text-accent"}`}
                    >
                      {s.avg}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Live attendance progress bars for real students */}
      {hasRealStudents && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <GlassCard glowColor="cyan" className="p-5">
            <h3 className="font-display font-bold text-foreground mb-4">
              Live Attendance Progress
            </h3>
            <div className="space-y-3">
              {data.map((student) => (
                <StudentAttendanceBar key={student.id} student={student} />
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
