import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetStudentOutingRequests,
  useSubmitOutingRequest,
} from "@/hooks/useQueries";
import { useAuthStore } from "@/store/authStore";
import type { OutingRequest } from "@/types";
import { ApprovalStatus } from "@/types";
import {
  Calendar,
  Clock,
  DoorOpen,
  FileText,
  MapPin,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const styles: Record<ApprovalStatus, string> = {
    [ApprovalStatus.pending]:
      "bg-secondary/10 text-secondary border-secondary/30",
    [ApprovalStatus.approved]: "bg-primary/10 text-primary border-primary/30",
    [ApprovalStatus.denied]: "bg-accent/10 text-accent border-accent/30",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${styles[status]} uppercase`}
    >
      {status}
    </span>
  );
}

function formatDateDisplay(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function OutingSection() {
  const { user } = useAuthStore();
  const userId = user?.id;

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const submitOuting = useSubmitOutingRequest();
  const { data: outingRequests = [], isLoading } =
    useGetStudentOutingRequests(userId);

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("You must be logged in to submit an outing request.");
      return;
    }
    if (!destination.trim() || !startDate || !endDate || !reason.trim()) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }
    if (endDate < startDate) {
      toast.error("End date cannot be before start date.");
      return;
    }
    try {
      await submitOuting.mutateAsync({
        studentId: userId,
        destination: destination.trim(),
        startDate,
        endDate,
        reason: reason.trim(),
      });
      toast.success("Outing request submitted successfully!");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Failed to submit outing request. Please try again.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 rounded-full bg-accent shadow-glow-accent" />
        <h2 className="text-xl font-display font-black text-foreground">
          Outing Requests
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Form */}
        <GlassCard glowColor="cyan" className="p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <DoorOpen size={16} className="text-primary" /> New Outing Request
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="outing-destination"
                className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                Destination
              </label>
              <div className="relative">
                <MapPin
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  id="outing-destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where are you going?"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg glass-effect-darker border border-border/40 text-sm text-foreground focus:border-primary/60 outline-none transition-all placeholder:text-muted-foreground"
                  data-ocid="outing-destination"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="outing-start-date"
                className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                Start Date
              </label>
              <div className="relative">
                <Calendar
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  id="outing-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg glass-effect-darker border border-border/40 text-sm text-foreground focus:border-primary/60 outline-none transition-all [color-scheme:dark]"
                  data-ocid="outing-start-date"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="outing-end-date"
                className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                End Date
              </label>
              <div className="relative">
                <Clock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <input
                  id="outing-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg glass-effect-darker border border-border/40 text-sm text-foreground focus:border-primary/60 outline-none transition-all [color-scheme:dark]"
                  data-ocid="outing-end-date"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="outing-reason"
                className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                Reason
              </label>
              <textarea
                id="outing-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Describe the reason for your outing request..."
                className="w-full px-3 py-2.5 rounded-lg glass-effect-darker border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 outline-none resize-none transition-all"
                data-ocid="outing-reason"
              />
            </div>

            <NeonButton
              variant="primary"
              fullWidth
              onClick={handleSubmit}
              loading={submitOuting.isPending}
              disabled={
                !destination.trim() ||
                !startDate ||
                !endDate ||
                !reason.trim() ||
                submitOuting.isPending
              }
              data-ocid="outing-submit"
            >
              <Send size={14} /> Submit Request
            </NeonButton>
          </div>
        </GlassCard>

        {/* History */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <FileText size={16} className="text-secondary" /> Request History
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((k) => (
                <Skeleton key={k} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : outingRequests.length === 0 ? (
            <GlassCard glowColor="none" className="p-8 text-center">
              <DoorOpen
                size={32}
                className="mx-auto mb-3 text-muted-foreground opacity-30"
              />
              <p className="text-sm text-muted-foreground">
                No outing requests yet. Submit your first request!
              </p>
            </GlassCard>
          ) : (
            [...outingRequests]
              .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
              .map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <GlassCard glowColor="none" hover={false} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                            <MapPin size={11} />
                            {req.destination || "–"}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                            <Calendar size={11} />
                            {formatDateDisplay(req.startDate)}
                            {req.endDate &&
                              req.endDate !== req.startDate &&
                              ` → ${formatDateDisplay(req.endDate)}`}
                          </span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {req.reason}
                        </p>
                        {req.reviewComment && (
                          <div className="mt-2 px-3 py-1.5 rounded-lg glass-effect-darker border border-border/20">
                            <p className="text-xs text-accent italic">
                              Reviewer note: "{req.reviewComment}"
                            </p>
                          </div>
                        )}
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                  </GlassCard>
                </motion.div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
