import { Plus, Star, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "../../../components/ui/GlassCard";
import { NeonButton } from "../../../components/ui/NeonButton";
import { Badge } from "../../../components/ui/badge";
import {
  useAddGrade,
  useAddQuizResult,
  useGetStudentGrades,
  useGetStudentQuizResults,
} from "../../../hooks/useQueries";
import type { UserProfile } from "../../../types";
import { MOCK_STUDENTS } from "./mockData";

interface Props {
  students: UserProfile[];
  subject: string;
}

function calcGrade(marks: number): string {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B";
  if (marks >= 60) return "C";
  if (marks >= 50) return "D";
  return "F";
}

export function GradeColor({ grade }: { grade: string }) {
  const map: Record<string, string> = {
    "A+": "text-primary border-primary/30 bg-primary/10",
    A: "text-primary border-primary/30 bg-primary/10",
    B: "text-secondary border-secondary/30 bg-secondary/10",
    C: "text-secondary border-secondary/30 bg-secondary/10",
    D: "text-accent border-accent/30 bg-accent/10",
    F: "text-accent border-accent/40 bg-accent/15",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-mono border ${map[grade] ?? "text-muted-foreground border-border/30"}`}
    >
      {grade}
    </span>
  );
}

function StudentGrades({
  studentId,
}: {
  studentId: string;
  studentName: string;
}) {
  const { data: grades = [] } = useGetStudentGrades(studentId);
  const { data: quizResults = [] } = useGetStudentQuizResults(studentId);

  if (grades.length === 0 && quizResults.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">No records yet</p>
    );
  }

  return (
    <div className="space-y-1">
      {grades.slice(0, 3).map((g) => (
        <div
          key={`${g.subject}-${g.marks}`}
          className="flex items-center justify-between text-xs py-1 border-b border-border/15"
        >
          <span className="text-muted-foreground">{g.subject}</span>
          <div className="flex items-center gap-2">
            <span className="text-foreground font-mono">{g.marks}/100</span>
            <GradeColor grade={g.grade} />
          </div>
        </div>
      ))}
      {quizResults.slice(0, 2).map((q) => (
        <div
          key={q.quizName}
          className="flex items-center justify-between text-xs py-1 border-b border-border/15"
        >
          <span className="text-muted-foreground">{q.quizName}</span>
          <span className="text-secondary font-mono">
            {q.score}/{q.maxScore}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TeacherGrades({ students, subject }: Props) {
  const data = students.length > 0 ? students : MOCK_STUDENTS;
  const addGrade = useAddGrade();
  const addQuiz = useAddQuizResult();

  const [tab, setTab] = useState<"grade" | "quiz">("grade");
  const [form, setForm] = useState({
    studentId: "",
    marks: 80,
    semester: "Semester 1",
    quizName: "",
    score: 75,
    maxScore: 100,
  });

  const computedGrade = calcGrade(form.marks);

  const handleGradeSubmit = async () => {
    if (!form.studentId) {
      toast.error("Please select a student");
      return;
    }
    try {
      await addGrade.mutateAsync({
        studentId: form.studentId,
        subject: subject || "General",
        marks: form.marks,
        grade: computedGrade,
        semester: form.semester,
      });
      toast.success("Grade uploaded successfully");
      setForm((prev) => ({ ...prev, studentId: "", marks: 80 }));
    } catch {
      toast.error("Failed to upload grade");
    }
  };

  const handleQuizSubmit = async () => {
    if (!form.studentId || !form.quizName) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await addQuiz.mutateAsync({
        id: `quiz-${Date.now()}`,
        studentId: form.studentId,
        subject: subject || "General",
        quizName: form.quizName,
        score: form.score,
        maxScore: form.maxScore,
        date: new Date().toISOString().split("T")[0],
      });
      toast.success("Quiz result uploaded");
      setForm((prev) => ({ ...prev, studentId: "", quizName: "" }));
    } catch {
      toast.error("Failed to upload quiz result");
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upload form */}
        <GlassCard glowColor="cyan" className="p-5">
          <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Upload size={16} className="text-primary" />
            Upload Results
          </h3>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-4">
            {(["grade", "quiz"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                data-ocid={`grade-tab-${t}`}
                className={[
                  "flex-1 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-all",
                  tab === t
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "text-muted-foreground border-border/30 hover:border-primary/30",
                ].join(" ")}
              >
                {t === "grade" ? "Subject Grade" : "Quiz Result"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {/* Student selector */}
            <div>
              <label
                htmlFor="grade-student-select"
                className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider"
              >
                Student
              </label>
              <select
                id="grade-student-select"
                value={form.studentId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, studentId: e.target.value }))
                }
                data-ocid="grade-student-select"
                className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground bg-transparent focus:outline-none focus:border-primary/50 transition-all"
              >
                <option value="">— Select student —</option>
                {data.map((s) => (
                  <option key={s.id} value={s.id} className="bg-card">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {tab === "grade" ? (
              <>
                <div>
                  <label
                    htmlFor="marks-input"
                    className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider"
                  >
                    Marks (0–100)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="marks-input"
                      type="number"
                      min={0}
                      max={100}
                      value={form.marks}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          marks: Number(e.target.value),
                        }))
                      }
                      data-ocid="marks-input"
                      className="flex-1 px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground bg-transparent focus:outline-none focus:border-primary/50 transition-all font-mono"
                    />
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">→</span>
                      <GradeColor grade={computedGrade} />
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="semester-input"
                    className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider"
                  >
                    Semester
                  </label>
                  <input
                    id="semester-input"
                    type="text"
                    value={form.semester}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        semester: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground bg-transparent focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <NeonButton
                  variant="primary"
                  onClick={handleGradeSubmit}
                  loading={addGrade.isPending}
                  fullWidth
                  data-ocid="upload-grade-btn"
                >
                  <Star size={14} />
                  Upload Grade
                </NeonButton>
              </>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="quiz-name-input"
                    className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider"
                  >
                    Quiz Name
                  </label>
                  <input
                    id="quiz-name-input"
                    type="text"
                    value={form.quizName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        quizName: e.target.value,
                      }))
                    }
                    placeholder="e.g. Chapter 3 Quiz"
                    data-ocid="quiz-name-input"
                    className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground bg-transparent focus:outline-none focus:border-secondary/50 transition-all placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label
                      htmlFor="quiz-score-input"
                      className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider"
                    >
                      Score
                    </label>
                    <input
                      id="quiz-score-input"
                      type="number"
                      min={0}
                      value={form.score}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          score: Number(e.target.value),
                        }))
                      }
                      data-ocid="quiz-score-input"
                      className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground bg-transparent focus:outline-none focus:border-secondary/50 transition-all font-mono"
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="quiz-max-score-input"
                      className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider"
                    >
                      Max Score
                    </label>
                    <input
                      id="quiz-max-score-input"
                      type="number"
                      min={1}
                      value={form.maxScore}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          maxScore: Number(e.target.value),
                        }))
                      }
                      data-ocid="quiz-max-score-input"
                      className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground bg-transparent focus:outline-none focus:border-secondary/50 transition-all font-mono"
                    />
                  </div>
                </div>
                <NeonButton
                  variant="secondary"
                  onClick={handleQuizSubmit}
                  loading={addQuiz.isPending}
                  fullWidth
                  data-ocid="upload-quiz-btn"
                >
                  <Plus size={14} />
                  Upload Quiz Result
                </NeonButton>
              </>
            )}
          </div>
        </GlassCard>

        {/* Student grades list */}
        <GlassCard glowColor="yellow" className="p-5">
          <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Star size={16} className="text-secondary" />
            Student Records
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-lg glass-effect-darker border border-border/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-secondary/40 bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {student.name}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs border-border/30 text-muted-foreground"
                  >
                    {subject || "General"}
                  </Badge>
                </div>
                <StudentGrades
                  studentId={student.id}
                  studentName={student.name}
                />
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
