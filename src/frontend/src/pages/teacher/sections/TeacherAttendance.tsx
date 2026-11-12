import { CalendarCheck, CheckCircle, Clock, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "../../../components/ui/GlassCard";
import { NeonButton } from "../../../components/ui/NeonButton";
import {
  useGetAttendanceByDate,
  useMarkAttendance,
} from "../../../hooks/useQueries";
import { AttendanceStatus, type UserProfile } from "../../../types";
import { MOCK_STUDENTS } from "./mockData";

interface Props {
  students: UserProfile[];
  userId: string | undefined;
  subject: string;
}

type AttendanceMap = Record<string, AttendanceStatus>;

const statusConfig = {
  [AttendanceStatus.present]: {
    label: "Present",
    icon: <CheckCircle size={14} />,
    class: "border-primary/50 text-primary bg-primary/10",
    active: "border-primary/80 bg-primary/20 shadow-glow-cyan",
  },
  [AttendanceStatus.late]: {
    label: "Late",
    icon: <Clock size={14} />,
    class: "border-secondary/50 text-secondary bg-secondary/10",
    active: "border-secondary/80 bg-secondary/20 shadow-glow-yellow",
  },
  [AttendanceStatus.absent]: {
    label: "Absent",
    icon: <XCircle size={14} />,
    class: "border-accent/50 text-accent bg-accent/10",
    active: "border-accent/80 bg-accent/20 shadow-glow-accent",
  },
};

export function TeacherAttendance({ students, userId, subject }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [attendance, setAttendance] = useState<AttendanceMap>({});

  const data = students.length > 0 ? students : MOCK_STUDENTS;

  const { data: existingRecords = [] } = useGetAttendanceByDate(
    selectedDate,
    userId,
  );
  const markAttendance = useMarkAttendance();

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    const records = data.map((s) => ({
      studentId: s.id,
      subject: subject || "General",
      date: selectedDate,
      status: attendance[s.id] ?? AttendanceStatus.absent,
    }));

    try {
      await markAttendance.mutateAsync(records);
      toast.success(`Attendance marked for ${records.length} students`, {
        description: `Date: ${selectedDate}`,
      });
    } catch {
      toast.error("Failed to submit attendance");
    }
  };

  const markedCount = Object.keys(attendance).length;
  const presentCount = Object.values(attendance).filter(
    (s) => s === AttendanceStatus.present,
  ).length;

  return (
    <div className="space-y-5">
      {/* Date picker header */}
      <GlassCard glowColor="cyan" className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarCheck size={18} className="text-primary" />
            <h2 className="font-display font-bold text-foreground">
              Mark Attendance
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap sm:ml-auto">
            <label
              htmlFor="attendance-date"
              className="text-xs font-mono text-muted-foreground uppercase tracking-wider"
            >
              Date:
            </label>
            <input
              id="attendance-date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setAttendance({});
              }}
              max={today}
              data-ocid="attendance-date-picker"
              className="px-3 py-1.5 rounded-lg glass-effect-darker border border-primary/30 text-sm text-primary font-mono bg-transparent focus:outline-none focus:border-primary/60 focus:shadow-glow-cyan transition-all"
            />
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex gap-4 mt-4 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">
            Total:{" "}
            <span className="text-foreground font-semibold">{data.length}</span>
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            Marked:{" "}
            <span className="text-secondary font-semibold">{markedCount}</span>
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            Present:{" "}
            <span className="text-primary font-semibold">{presentCount}</span>
          </span>
          {existingRecords.length > 0 && (
            <span className="text-xs font-mono text-accent">
              {existingRecords.length} records already exist for this date
            </span>
          )}
        </div>
      </GlassCard>

      {/* Student attendance rows */}
      <div className="space-y-2" data-ocid="attendance-student-list">
        {data.map((student, i) => {
          const status = attendance[student.id];
          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassCard
                glowColor="none"
                className="p-3 hover:border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-secondary/40 bg-secondary/10 flex items-center justify-center text-sm font-display font-bold text-secondary flex-shrink-0">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {student.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.email}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {(
                      Object.entries(statusConfig) as [
                        AttendanceStatus,
                        (typeof statusConfig)[AttendanceStatus],
                      ][]
                    ).map(([s, cfg]) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(student.id, s)}
                        data-ocid={`attendance-${s}-btn`}
                        className={[
                          "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono border transition-all duration-200",
                          status === s ? cfg.active : cfg.class,
                        ].join(" ")}
                      >
                        {cfg.icon}
                        <span className="hidden sm:inline">{cfg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <NeonButton
          variant="primary"
          onClick={handleSubmit}
          loading={markAttendance.isPending}
          disabled={markedCount === 0}
          data-ocid="submit-attendance-btn"
        >
          <CheckCircle size={16} />
          Submit Attendance ({markedCount}/{data.length})
        </NeonButton>
      </div>
    </div>
  );
}
