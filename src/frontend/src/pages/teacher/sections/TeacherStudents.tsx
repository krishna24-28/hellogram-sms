import { Search, UserCheck, UserX } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { NeonButton } from "../../../components/ui/NeonButton";
import { Badge } from "../../../components/ui/badge";
import type { UserProfile } from "../../../types";
import { MOCK_STUDENTS } from "./mockData";

interface Props {
  students: UserProfile[];
}

export function TeacherStudents({ students }: Props) {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"attendance" | "grades" | null>(
    null,
  );

  const data = students.length > 0 ? students : MOCK_STUDENTS;

  const filtered = data.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-display font-bold text-foreground">
            Assigned Students
          </h2>
          <Badge className="bg-secondary/15 text-secondary border-secondary/30 font-mono">
            {data.length}
          </Badge>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            data-ocid="student-search"
            className="pl-9 pr-4 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none focus:border-primary/50 focus:shadow-glow-cyan transition-all w-56"
          />
        </div>
      </div>

      {/* Student grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((student, i) => (
          <motion.div
            key={student.id ?? i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <GlassCard
              glowColor="yellow"
              className="p-4"
              data-ocid="student-card"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full border border-secondary/40 bg-secondary/10 flex items-center justify-center text-base font-display font-bold text-secondary flex-shrink-0">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {student.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {student.email}
                  </p>
                  <p className="text-xs font-mono text-primary/60 mt-1">
                    ID: {student.id?.slice(0, 8).toUpperCase() ?? "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <NeonButton
                  variant="primary"
                  className="flex-1 py-1.5 text-xs"
                  onClick={() => {
                    setSelectedStudent(student);
                    setViewMode("attendance");
                  }}
                  data-ocid="view-attendance-btn"
                >
                  <UserCheck size={12} />
                  Attendance
                </NeonButton>
                <NeonButton
                  variant="secondary"
                  className="flex-1 py-1.5 text-xs"
                  onClick={() => {
                    setSelectedStudent(student);
                    setViewMode("grades");
                  }}
                  data-ocid="view-grades-btn"
                >
                  <UserX size={12} />
                  Grades
                </NeonButton>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Search size={28} className="opacity-30" />
          <p className="text-sm">No students match your search</p>
        </div>
      )}

      {/* Quick view modal-like panel */}
      {selectedStudent && viewMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm"
          onClick={() => {
            setSelectedStudent(null);
            setViewMode(null);
          }}
        >
          <GlassCard
            glowColor={viewMode === "attendance" ? "cyan" : "yellow"}
            className="p-6 w-full max-w-md"
            onClick={() => undefined}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground">
                {selectedStudent.name} —{" "}
                {viewMode === "attendance" ? "Attendance" : "Grades"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null);
                  setViewMode(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {viewMode === "attendance"
                ? "Navigate to the Attendance section to view and mark attendance for this student."
                : "Navigate to the Grades section to view and upload grades for this student."}
            </p>
            <div className="mt-4 p-3 rounded-lg glass-effect-darker border border-border/20">
              <p className="text-xs font-mono text-muted-foreground">
                Student ID: {selectedStudent.id}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                Email: {selectedStudent.email}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
