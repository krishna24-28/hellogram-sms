import {
  BookOpen,
  FileText,
  Loader2,
  Paperclip,
  Plus,
  Trash2,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "../../../components/ui/GlassCard";
import { NeonButton } from "../../../components/ui/NeonButton";
import { Badge } from "../../../components/ui/badge";
import {
  useCreateAssignment,
  useGetAssignmentsBySubject,
} from "../../../hooks/useQueries";
import type { UserProfile } from "../../../types";
import { MOCK_STUDENTS } from "./mockData";

interface Props {
  students: UserProfile[];
  subject: string;
  teacherId: string;
}

const MOCK_ASSIGNMENTS = [
  {
    id: "a1",
    title: "Linear Algebra Problem Set",
    subject: "Mathematics",
    description: "Solve problems 1-15 from chapter 4.",
    dueDate: "2026-04-20",
    assignedTo: ["mock-s1", "mock-s2", "mock-s3"],
    teacherId: "t1",
    createdAt: BigInt(0),
    fileUrl: "",
  },
  {
    id: "a2",
    title: "Integration Techniques",
    subject: "Mathematics",
    description: "Complete the integration worksheet.",
    dueDate: "2026-04-25",
    assignedTo: ["mock-s1", "mock-s2", "mock-s3", "mock-s4"],
    teacherId: "t1",
    createdAt: BigInt(0),
    fileUrl: "",
  },
];

const MAX_FILE_MB = 5;

export function TeacherAssignments({ students, subject, teacherId }: Props) {
  const data = students.length > 0 ? students : MOCK_STUDENTS;
  const createAssignment = useCreateAssignment();
  const { data: existingAssignments = [] } = useGetAssignmentsBySubject(
    subject || "General",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    fileUrl: "",
    fileName: "",
    assignToAll: true,
    selectedStudents: [] as string[],
  });
  const [uploading, setUploading] = useState(false);

  const assignments =
    existingAssignments.length > 0 ? existingAssignments : MOCK_ASSIGNMENTS;

  const toggleStudent = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(id)
        ? prev.selectedStudents.filter((s) => s !== id)
        : [...prev.selectedStudents, id],
    }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`File too large. Max size is ${MAX_FILE_MB} MB.`);
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setForm((prev) => ({ ...prev, fileUrl: dataUrl, fileName: file.name }));
      toast.success(`"${file.name}" attached!`);
    } catch {
      toast.error("Failed to attach file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.dueDate) {
      toast.error("Title and due date are required");
      return;
    }
    const assignedTo = form.assignToAll
      ? data.map((s) => s.id)
      : form.selectedStudents;
    if (assignedTo.length === 0) {
      toast.error("Assign to at least one student");
      return;
    }
    try {
      await createAssignment.mutateAsync({
        id: `asgn-${Date.now()}`,
        title: form.title,
        subject: subject || "General",
        description: form.description,
        dueDate: form.dueDate,
        fileUrl: form.fileUrl,
        teacherId,
        assignedTo,
        createdAt: BigInt(Date.now()),
      });
      toast.success("Assignment created successfully");
      setForm({
        title: "",
        description: "",
        dueDate: "",
        fileUrl: "",
        fileName: "",
        assignToAll: true,
        selectedStudents: [],
      });
    } catch {
      toast.error("Failed to create assignment");
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Create form */}
        <GlassCard glowColor="cyan" className="p-5">
          <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Plus size={16} className="text-primary" />
            Create Assignment
          </h3>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="assignment-title"
                className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider"
              >
                Title
              </label>
              <input
                id="assignment-title"
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Assignment title..."
                data-ocid="assignment-title-input"
                className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground bg-transparent focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="assignment-desc"
                className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider"
              >
                Description
              </label>
              <textarea
                id="assignment-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Assignment instructions..."
                rows={3}
                data-ocid="assignment-desc-input"
                className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground bg-transparent focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground resize-none"
              />
            </div>
            <div>
              <label
                htmlFor="assignment-due"
                className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider"
              >
                Due Date
              </label>
              <input
                id="assignment-due"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                data-ocid="assignment-due-input"
                className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-primary font-mono bg-transparent focus:outline-none focus:border-primary/50 transition-all [color-scheme:dark]"
              />
            </div>

            {/* File attachment */}
            <div>
              <p className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wider">
                File Attachment (optional)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.pptx,.xlsx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                data-ocid="assignment-file-input"
              />
              {form.fileName ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg glass-effect-darker border border-primary/30 bg-primary/5">
                  <Paperclip size={13} className="text-primary flex-shrink-0" />
                  <span className="text-xs text-primary font-mono flex-1 truncate">
                    {form.fileName}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        fileUrl: "",
                        fileName: "",
                      }))
                    }
                    className="text-muted-foreground hover:text-accent transition-colors flex-shrink-0"
                    aria-label="Remove file"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  data-ocid="assignment-attach-btn"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed border-border/40 hover:border-primary/50 hover:bg-primary/5 text-xs text-muted-foreground hover:text-primary transition-all font-mono"
                >
                  {uploading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <UploadCloud size={13} />
                  )}
                  {uploading
                    ? "Attaching..."
                    : "Attach File (PDF, DOC, Image · Max 5 MB)"}
                </button>
              )}
            </div>

            {/* Assign scope */}
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-wider">
                Assign To
              </p>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, assignToAll: true }))
                  }
                  className={[
                    "flex-1 py-1.5 rounded-lg text-xs font-mono border transition-all",
                    form.assignToAll
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "text-muted-foreground border-border/30",
                  ].join(" ")}
                >
                  All Students ({data.length})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, assignToAll: false }))
                  }
                  className={[
                    "flex-1 py-1.5 rounded-lg text-xs font-mono border transition-all",
                    !form.assignToAll
                      ? "bg-secondary/15 text-secondary border-secondary/40"
                      : "text-muted-foreground border-border/30",
                  ].join(" ")}
                >
                  Select Students
                </button>
              </div>
              {!form.assignToAll && (
                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {data.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/20"
                    >
                      <input
                        type="checkbox"
                        checked={form.selectedStudents.includes(s.id)}
                        onChange={() => toggleStudent(s.id)}
                        className="accent-primary"
                      />
                      <span className="text-sm text-foreground">{s.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <NeonButton
              variant="primary"
              onClick={handleCreate}
              loading={createAssignment.isPending}
              fullWidth
              data-ocid="create-assignment-btn"
            >
              <BookOpen size={14} />
              Create Assignment
            </NeonButton>
          </div>
        </GlassCard>

        {/* Existing assignments */}
        <GlassCard glowColor="yellow" className="p-5">
          <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText size={16} className="text-secondary" />
            Posted Assignments
            <Badge className="ml-auto bg-secondary/15 text-secondary border-secondary/30 font-mono text-xs">
              {assignments.length}
            </Badge>
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {assignments.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-3 rounded-lg glass-effect-darker border border-border/20"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground truncate flex-1">
                    {a.title}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-xs border-primary/30 text-primary flex-shrink-0"
                  >
                    {a.subject}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {a.description}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-mono text-secondary">
                    Due: {a.dueDate}
                  </span>
                  <div className="flex items-center gap-2">
                    {a.fileUrl && (
                      <span className="flex items-center gap-1 text-xs text-primary font-mono">
                        <Paperclip size={10} />
                        file attached
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users size={11} />
                      {a.assignedTo.length} students
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {assignments.length === 0 && (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                No assignments created yet
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
