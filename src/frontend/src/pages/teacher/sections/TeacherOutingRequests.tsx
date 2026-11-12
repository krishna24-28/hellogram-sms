import { CheckCircle, Clock, MessageSquare, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "../../../components/ui/GlassCard";
import { NeonButton } from "../../../components/ui/NeonButton";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  useGetAllOutingRequests,
  useReviewOutingRequest,
} from "../../../hooks/useQueries";
import { ApprovalStatus, type OutingRequest } from "../../../types";

interface Props {
  teacherId: string | undefined;
}

const statusConfig: Record<
  ApprovalStatus,
  { icon: React.ReactNode; className: string; label: string }
> = {
  [ApprovalStatus.pending]: {
    icon: <Clock size={12} />,
    className: "text-secondary border-secondary/40 bg-secondary/10",
    label: "Pending",
  },
  [ApprovalStatus.approved]: {
    icon: <CheckCircle size={12} />,
    className: "text-primary border-primary/40 bg-primary/10",
    label: "Approved",
  },
  [ApprovalStatus.denied]: {
    icon: <XCircle size={12} />,
    className: "text-accent border-accent/40 bg-accent/10",
    label: "Denied",
  },
};

function formatDate(str: string): string {
  try {
    return new Date(str).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return str;
  }
}

function RequestCard({
  req,
  showActions = false,
  onApprove,
  onDeny,
  isReviewing = false,
}: {
  req: OutingRequest;
  showActions?: boolean;
  onApprove?: (comment: string) => void;
  onDeny?: (comment: string) => void;
  isReviewing?: boolean;
}) {
  const [comment, setComment] = useState("");
  const cfg = statusConfig[req.status];

  return (
    <GlassCard
      glowColor={
        req.status === ApprovalStatus.pending
          ? "magenta"
          : req.status === ApprovalStatus.approved
            ? "cyan"
            : "none"
      }
      className="p-4"
      hover={false}
      data-ocid="outing-request-card"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-sm font-bold text-accent flex-shrink-0">
          {req.studentId.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground font-mono">
              Student #{req.studentId.slice(0, 8)}
            </span>
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${cfg.className}`}
            >
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">
              📅 {formatDate(req.startDate)}
              {req.endDate && req.endDate !== req.startDate
                ? ` → ${formatDate(req.endDate)}`
                : ""}
            </span>
            {req.destination && (
              <span className="text-xs font-mono text-muted-foreground">
                📍 {req.destination}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground mt-2 leading-relaxed">
            {req.reason}
          </p>
          {req.reviewComment && (
            <div className="mt-2 p-2 rounded glass-effect-darker border border-border/20">
              <p className="text-xs text-muted-foreground italic">
                "{req.reviewComment}"
              </p>
            </div>
          )}
        </div>
      </div>

      {showActions && req.status === ApprovalStatus.pending && (
        <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (optional)..."
            className="w-full px-3 py-1.5 rounded-lg glass-effect-darker border border-border/30 text-xs text-foreground bg-transparent focus:outline-none focus:border-primary/40 transition-all placeholder:text-muted-foreground"
            data-ocid="review-comment-input"
          />
          <div className="flex gap-2">
            <NeonButton
              variant="primary"
              className="flex-1 py-1.5 text-xs"
              onClick={() => onApprove?.(comment)}
              loading={isReviewing}
              data-ocid="approve-outing-btn"
            >
              <CheckCircle size={12} />
              Approve
            </NeonButton>
            <NeonButton
              variant="danger"
              className="flex-1 py-1.5 text-xs"
              onClick={() => onDeny?.(comment)}
              loading={isReviewing}
              data-ocid="deny-outing-btn"
            >
              <XCircle size={12} />
              Deny
            </NeonButton>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export function TeacherOutingRequests({ teacherId }: Props) {
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const { data: allReqs = [], isLoading: allLoading } =
    useGetAllOutingRequests();
  const reviewRequest = useReviewOutingRequest();

  // Show ALL pending requests so teachers can approve even unassigned students
  const pendingReqs = allReqs.filter(
    (r) => r.status === ApprovalStatus.pending,
  );
  const displayHistory = allReqs.filter(
    (r) => r.status !== ApprovalStatus.pending,
  );

  const handleReview = async (
    req: OutingRequest,
    approved: boolean,
    comment: string,
  ) => {
    if (!teacherId) return;
    setReviewingId(req.id);
    try {
      await reviewRequest.mutateAsync({
        requestId: req.id,
        status: approved ? ApprovalStatus.approved : ApprovalStatus.denied,
        comment: comment || null,
        reviewerId: teacherId,
      });
      toast.success(approved ? "Request approved ✓" : "Request denied");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update request");
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-2">
        {(["pending", "history"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            data-ocid={`outing-tab-${t}`}
            className={[
              "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider border transition-all",
              tab === t
                ? "bg-primary/15 text-primary border-primary/40 shadow-glow-cyan"
                : "text-muted-foreground border-border/30 hover:border-primary/30",
            ].join(" ")}
          >
            {t === "pending" ? (
              <>
                <Clock size={13} />
                Pending
                {pendingReqs.length > 0 && (
                  <Badge className="bg-accent/20 text-accent border-accent/30 text-xs font-mono px-1.5">
                    {pendingReqs.length}
                  </Badge>
                )}
              </>
            ) : (
              <>
                <MessageSquare size={13} />
                History
              </>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === "pending" ? (
          allLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : pendingReqs.length > 0 ? (
            <div className="space-y-3">
              {pendingReqs.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  showActions
                  isReviewing={reviewingId === req.id}
                  onApprove={(comment) => handleReview(req, true, comment)}
                  onDeny={(comment) => handleReview(req, false, comment)}
                />
              ))}
            </div>
          ) : (
            <GlassCard glowColor="none" className="p-10">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <CheckCircle size={36} className="text-primary/30" />
                <p className="text-sm">No pending outing requests</p>
                <p className="text-xs text-muted-foreground/60">
                  All caught up!
                </p>
              </div>
            </GlassCard>
          )
        ) : (
          <div className="space-y-3">
            {displayHistory.length > 0 ? (
              displayHistory.map((req) => (
                <RequestCard key={req.id} req={req} />
              ))
            ) : (
              <GlassCard glowColor="none" className="p-10">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Clock size={36} className="opacity-30" />
                  <p className="text-sm">No reviewed requests yet</p>
                </div>
              </GlassCard>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
