import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Download,
  File,
  FileImage,
  FileText,
  FolderOpen,
  Loader2,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

// Stored in localStorage for persistence
const DOCS_KEY = "hellogram-documents";

interface StoredDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  uploadedAt: string;
  dataUrl: string;
  userId: string;
}

function loadDocs(userId: string): StoredDocument[] {
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    if (!raw) return [];
    const all: StoredDocument[] = JSON.parse(raw);
    return all.filter((d) => d.userId === userId);
  } catch {
    return [];
  }
}

function saveDocs(userId: string, docs: StoredDocument[]) {
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    const all: StoredDocument[] = raw ? JSON.parse(raw) : [];
    const others = all.filter((d) => d.userId !== userId);
    localStorage.setItem(DOCS_KEY, JSON.stringify([...others, ...docs]));
  } catch {
    console.error("Failed to save documents");
  }
}

const CATEGORIES = [
  "Study Notes",
  "Assignment",
  "Research Paper",
  "Lab Report",
  "Certificate",
  "Other",
];

const ACCEPT_TYPES = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.pptx,.xlsx";
const MAX_FILE_SIZE_MB = 5;

function getFileIcon(type: string) {
  if (type.startsWith("image/"))
    return <FileImage size={18} className="text-primary" />;
  if (type === "application/pdf")
    return <FileText size={18} className="text-accent" />;
  return <File size={18} className="text-secondary" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

interface Props {
  userId: string;
}

export function DocumentsSection({ userId }: Props) {
  const [docs, setDocs] = useState<StoredDocument[]>(() => loadDocs(userId));
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [filterCat, setFilterCat] = useState<string>("All");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs =
    filterCat === "All" ? docs : docs.filter((d) => d.category === filterCat);

  const processFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`File too large. Max size is ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }
      setUploading(true);
      try {
        // Read as data URL for storage
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const newDoc: StoredDocument = {
          id: `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          category,
          uploadedAt: new Date().toISOString(),
          dataUrl,
          userId,
        };
        const updated = [newDoc, ...docs];
        setDocs(updated);
        saveDocs(userId, updated);
        toast.success(`"${file.name}" uploaded successfully!`);
      } catch {
        toast.error("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [docs, category, userId],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDelete = (id: string) => {
    const updated = docs.filter((d) => d.id !== id);
    setDocs(updated);
    saveDocs(userId, updated);
    toast.success("Document removed.");
  };

  const handleDownload = (doc: StoredDocument) => {
    const a = document.createElement("a");
    a.href = doc.dataUrl;
    a.download = doc.name;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 rounded-full bg-primary shadow-glow-cyan" />
        <h2 className="text-xl font-display font-black text-foreground">
          My Documents
        </h2>
        <Badge className="bg-primary/15 text-primary border-primary/30 font-mono text-xs">
          {docs.length} files
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard glowColor="cyan" className="p-5">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <UploadCloud size={16} className="text-primary" />
              Upload Document
            </h3>

            {/* Category selector */}
            <div className="mb-4">
              <label
                htmlFor="doc-category"
                className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                Category
              </label>
              <select
                id="doc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass-effect-darker border border-border/30 text-sm text-foreground bg-transparent focus:outline-none focus:border-primary/50 transition-all font-mono"
                data-ocid="doc-category-select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-card text-foreground">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Drop zone */}
            <motion.div
              animate={{
                borderColor: dragging ? "oklch(0.7 0.22 190)" : undefined,
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={[
                "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200",
                dragging
                  ? "border-primary/80 bg-primary/10 shadow-glow-cyan"
                  : "border-border/40 hover:border-primary/50 hover:bg-primary/5",
              ].join(" ")}
              data-ocid="doc-upload-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_TYPES}
                onChange={handleFileChange}
                className="hidden"
                data-ocid="doc-file-input"
              />
              {uploading ? (
                <Loader2 size={32} className="text-primary animate-spin" />
              ) : (
                <UploadCloud
                  size={32}
                  className={`transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`}
                />
              )}
              <div className="text-center">
                <p className="text-sm font-display font-semibold text-foreground">
                  {uploading
                    ? "Uploading..."
                    : dragging
                      ? "Drop it here!"
                      : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  PDF, DOC, Images • Max {MAX_FILE_SIZE_MB} MB
                </p>
              </div>
            </motion.div>

            <NeonButton
              variant="primary"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
              className="mt-3"
              data-ocid="doc-upload-btn"
            >
              <UploadCloud size={14} />
              Choose File
            </NeonButton>
          </GlassCard>

          {/* Filter by category */}
          <GlassCard glowColor="yellow" className="p-4">
            <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">
              Filter by Category
            </h4>
            <div className="flex flex-wrap gap-2">
              {["All", ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCat(cat)}
                  className={[
                    "px-2.5 py-1 rounded-lg text-xs font-mono border transition-all",
                    filterCat === cat
                      ? "bg-secondary/15 text-secondary border-secondary/40"
                      : "text-muted-foreground border-border/30 hover:border-secondary/30",
                  ].join(" ")}
                >
                  {cat}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                <FolderOpen size={16} className="text-secondary" />
                {filterCat === "All" ? "All Documents" : filterCat}
              </h3>
              <span className="text-xs font-mono text-muted-foreground">
                {filteredDocs.length} files
              </span>
            </div>

            <AnimatePresence mode="popLayout">
              {filteredDocs.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GlassCard glowColor="none" className="p-10 text-center">
                    <FolderOpen
                      size={40}
                      className="mx-auto mb-3 text-muted-foreground opacity-30"
                    />
                    <p className="text-sm text-muted-foreground font-display font-semibold">
                      No documents yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload your study notes, assignments, and more
                    </p>
                  </GlassCard>
                </motion.div>
              ) : (
                filteredDocs.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <GlassCard glowColor="none" hover={false} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg glass-effect-darker border border-border/20 flex items-center justify-center">
                          {getFileIcon(doc.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-display font-semibold text-foreground truncate">
                            {doc.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                              <Tag size={10} />
                              {doc.category}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                              <Calendar size={10} />
                              {formatDate(doc.uploadedAt)}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {formatSize(doc.size)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            title="Download"
                            className="p-2 rounded-lg glass-effect-darker border border-border/20 text-primary hover:border-primary/40 hover:shadow-glow-cyan transition-all"
                            data-ocid={`doc-download-${doc.id}`}
                          >
                            <Download size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(doc.id)}
                            title="Remove"
                            className="p-2 rounded-lg glass-effect-darker border border-border/20 text-muted-foreground hover:text-accent hover:border-accent/40 transition-all"
                            data-ocid={`doc-delete-${doc.id}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
