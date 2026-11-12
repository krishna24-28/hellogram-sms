import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Grade } from "@/types";
import { motion } from "motion/react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  grades: Grade[];
  isLoading: boolean;
}

const SAMPLE_GRADES: Grade[] = [
  {
    studentId: "s1",
    subject: "Data Structures",
    semester: "Sem 5",
    marks: 88,
    grade: "A",
  },
  {
    studentId: "s1",
    subject: "Algorithms",
    semester: "Sem 5",
    marks: 92,
    grade: "A+",
  },
  {
    studentId: "s1",
    subject: "Operating Systems",
    semester: "Sem 5",
    marks: 76,
    grade: "B+",
  },
  {
    studentId: "s1",
    subject: "Networks",
    semester: "Sem 5",
    marks: 84,
    grade: "A",
  },
  {
    studentId: "s1",
    subject: "DBMS",
    semester: "Sem 5",
    marks: 79,
    grade: "B+",
  },
  {
    studentId: "s1",
    subject: "Machine Learning",
    semester: "Sem 5",
    marks: 95,
    grade: "A+",
  },
];

function letterGradeColor(grade: string) {
  if (grade.startsWith("A"))
    return {
      bar: "bg-primary",
      text: "text-primary",
      badge: "bg-primary/10 text-primary border-primary/20",
    };
  if (grade.startsWith("B"))
    return {
      bar: "bg-secondary",
      text: "text-secondary",
      badge: "bg-secondary/10 text-secondary border-secondary/20",
    };
  return {
    bar: "bg-accent",
    text: "text-accent",
    badge: "bg-accent/10 text-accent border-accent/20",
  };
}

function calcGPA(grades: Grade[]) {
  if (grades.length === 0) return "0.0";
  const sum = grades.reduce((s, g) => {
    const m = g.marks;
    let points =
      m >= 90 ? 10 : m >= 80 ? 9 : m >= 70 ? 8 : m >= 60 ? 7 : m >= 50 ? 6 : 5;
    return s + points;
  }, 0);
  return (sum / grades.length).toFixed(1);
}

export function GradesSection({ grades, isLoading }: Props) {
  const data = grades.length > 0 ? grades : SAMPLE_GRADES;
  const radarData = data
    .slice(0, 6)
    .map((g) => ({ subject: g.subject.slice(0, 8), score: g.marks }));
  const gpa = calcGPA(data);
  const avgMarks =
    data.length > 0
      ? Math.round(data.reduce((s, g) => s + g.marks, 0) / data.length)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-secondary shadow-glow-yellow" />
          <h2 className="text-xl font-display font-black text-foreground">
            Academic Grades
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-display font-black text-primary">
              {gpa}
            </div>
            <div className="text-xs font-mono text-muted-foreground uppercase">
              GPA
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-display font-black text-secondary">
              {avgMarks}%
            </div>
            <div className="text-xs font-mono text-muted-foreground uppercase">
              Avg
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Radar Chart */}
          <GlassCard glowColor="cyan" className="p-5">
            <h3 className="font-display font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-glow-cyan" />
              Performance Radar
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart
                data={radarData}
                margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
              >
                <PolarGrid stroke="oklch(var(--border) / 0.3)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fill: "oklch(var(--muted-foreground))",
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                    borderRadius: "8px",
                    color: "oklch(var(--foreground))",
                  }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="oklch(var(--primary))"
                  fill="oklch(var(--primary) / 0.2)"
                  strokeWidth={2}
                  dot={{ fill: "oklch(var(--primary))", r: 3 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Grade cards */}
          <div className="space-y-3">
            {data.map((g, idx) => {
              const col = letterGradeColor(g.grade);
              return (
                <motion.div
                  key={`${g.subject}-${g.semester}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.07 }}
                >
                  <GlassCard glowColor="none" hover={false} className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground truncate">
                            {g.subject}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-mono border ${col.badge}`}
                          >
                            {g.grade}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted/50">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${g.marks}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                              className={`h-full rounded-full ${col.bar}`}
                            />
                          </div>
                          <span
                            className={`text-sm font-display font-bold ${col.text}`}
                          >
                            {g.marks}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {g.semester}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
