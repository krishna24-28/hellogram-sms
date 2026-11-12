import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { BookOpen, Download, Search, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface SyllabusItem {
  id: string;
  subject: string;
  title: string;
  type: string;
  updatedAt: string;
}

const SAMPLE_SYLLABUS: SyllabusItem[] = [
  {
    id: "1",
    subject: "Data Structures",
    title: "Complete Syllabus 2026",
    type: "PDF",
    updatedAt: "2026-03-15",
  },
  {
    id: "2",
    subject: "Algorithms",
    title: "Algorithm Design & Analysis",
    type: "PDF",
    updatedAt: "2026-03-10",
  },
  {
    id: "3",
    subject: "Operating Systems",
    title: "OS Concepts & Lab Manual",
    type: "PDF",
    updatedAt: "2026-02-28",
  },
  {
    id: "4",
    subject: "Computer Networks",
    title: "Network Protocols Guide",
    type: "PDF",
    updatedAt: "2026-03-01",
  },
  {
    id: "5",
    subject: "DBMS",
    title: "Database Systems Syllabus",
    type: "PDF",
    updatedAt: "2026-02-20",
  },
  {
    id: "6",
    subject: "Machine Learning",
    title: "ML Foundations & Projects",
    type: "PDF",
    updatedAt: "2026-03-18",
  },
  {
    id: "7",
    subject: "Data Structures",
    title: "Practice Problem Sets",
    type: "PDF",
    updatedAt: "2026-04-01",
  },
  {
    id: "8",
    subject: "Algorithms",
    title: "Previous Year Questions",
    type: "PDF",
    updatedAt: "2026-03-25",
  },
];

const SUBJECT_OPTIONS = [...new Set(SAMPLE_SYLLABUS.map((s) => s.subject))];

export function SyllabusSection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);

  const filtered = SAMPLE_SYLLABUS.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || s.subject === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-accent shadow-glow-accent" />
          <h2 className="text-xl font-display font-black text-foreground">
            Syllabus & Documents
          </h2>
        </div>
        <NeonButton
          variant="secondary"
          onClick={() => setShowUpload(true)}
          data-ocid="upload-btn"
        >
          <Upload size={14} /> Upload Document
        </NeonButton>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg glass-effect-darker border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 outline-none transition-all"
            data-ocid="syllabus-search"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg glass-effect-darker border border-border/40 text-sm text-foreground focus:border-primary/60 outline-none bg-transparent transition-all"
          data-ocid="subject-filter"
        >
          <option value="All" className="bg-card">
            All Subjects
          </option>
          {SUBJECT_OPTIONS.map((s) => (
            <option key={s} value={s} className="bg-card">
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <GlassCard glowColor="none" className="p-4 flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <BookOpen size={18} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-primary bg-primary/10 border border-primary/20 px-1.5 rounded">
                    {item.subject}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {item.updatedAt}
                  </span>
                </div>
              </div>
              <NeonButton
                variant="ghost"
                className="flex-shrink-0 px-3 py-1.5 text-xs"
                data-ocid={`download-${item.id}`}
              >
                <Download size={12} /> PDF
              </NeonButton>
            </GlassCard>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p>No documents found</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect border border-primary/30 shadow-glow-cyan rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-foreground">
                  Upload Document
                </h3>
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="upload-subject"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block"
                  >
                    Subject
                  </label>
                  <select
                    id="upload-subject"
                    className="w-full px-3 py-2.5 rounded-lg glass-effect-darker border border-border/40 text-sm text-foreground outline-none bg-transparent"
                  >
                    {SUBJECT_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-card">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="upload-title"
                    className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block"
                  >
                    Title
                  </label>
                  <input
                    id="upload-title"
                    placeholder="Document title..."
                    className="w-full px-3 py-2.5 rounded-lg glass-effect-darker border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 outline-none transition-all"
                  />
                </div>
                <div className="border-2 border-dashed border-border/40 rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <Upload
                    size={24}
                    className="mx-auto mb-2 text-muted-foreground"
                  />
                  <p className="text-sm text-muted-foreground">
                    Drop file here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC up to 10MB
                  </p>
                </div>
                <NeonButton
                  variant="primary"
                  fullWidth
                  onClick={() => setShowUpload(false)}
                >
                  Upload Document
                </NeonButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
