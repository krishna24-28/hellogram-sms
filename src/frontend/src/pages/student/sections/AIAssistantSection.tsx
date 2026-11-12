import { NeonButton } from "@/components/ui/NeonButton";
import {
  useGenerateStudyRoadmap,
  useSendChatMessage,
} from "@/hooks/useQueries";
import { useAuthStore } from "@/store/authStore";
import { Bot, Send, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type ChatMsg = { role: "user" | "assistant"; content: string };

const QUICK_ACTIONS = [
  {
    label: "Explain Data Structures",
    icon: <Sparkles size={12} />,
    prompt:
      "Explain the key data structures in computer science (arrays, linked lists, trees, graphs, hash maps) with their time complexities and use cases.",
  },
  {
    label: "Help with OS concepts",
    icon: <Zap size={12} />,
    prompt:
      "Help me understand Operating System concepts: process scheduling, memory management, deadlocks, and file systems.",
  },
  {
    label: "Circuit theory basics",
    icon: <Bot size={12} />,
    prompt:
      "Explain the fundamentals of circuit theory: Ohm's Law, Kirchhoff's laws, series/parallel circuits, and basic AC/DC analysis.",
  },
  {
    label: "Thermodynamics fundamentals",
    icon: <Sparkles size={12} />,
    prompt:
      "Explain the fundamental laws of thermodynamics and their engineering applications with real-world examples.",
  },
];

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    role: "assistant",
    content:
      "Hello! I'm your academic AI assistant powered by advanced AI.\n\nI can help you with:\n• Engineering syllabus questions\n• Data Structures & Algorithms\n• Operating Systems, Networks\n• Circuit Theory, Electronics\n• Thermodynamics, Mechanics\n• Study roadmaps & resource recommendations\n\nUse the quick action buttons or type your question!",
  },
];

function TypingDots() {
  return (
    <div className="flex gap-1 items-center px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: 1.2,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// ── Markdown Renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (!line.trim()) {
      nodes.push(<div key={`gap-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // H1: # heading
    if (line.startsWith("# ")) {
      nodes.push(
        <h3
          key={i}
          className="text-base font-display font-bold text-primary mt-3 mb-1"
        >
          {renderInline(line.slice(2))}
        </h3>,
      );
      i++;
      continue;
    }

    // H2: ## heading
    if (line.startsWith("## ")) {
      nodes.push(
        <h4
          key={i}
          className="text-sm font-display font-bold text-secondary mt-2.5 mb-1"
        >
          {renderInline(line.slice(3))}
        </h4>,
      );
      i++;
      continue;
    }

    // H3: ### heading
    if (line.startsWith("### ")) {
      nodes.push(
        <h5
          key={i}
          className="text-sm font-display font-semibold text-foreground mt-2 mb-0.5"
        >
          {renderInline(line.slice(4))}
        </h5>,
      );
      i++;
      continue;
    }

    // Numbered list: "1. " or "2. " etc
    if (/^\d+\.\s/.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const match = lines[i].match(/^(\d+)\.\s(.*)$/);
        if (match) {
          listItems.push(
            <li key={i} className="flex gap-2 items-start">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-mono font-bold flex items-center justify-center mt-0.5">
                {match[1]}
              </span>
              <span className="flex-1">{renderInline(match[2])}</span>
            </li>,
          );
        }
        i++;
      }
      nodes.push(
        <ul key={`ol-${i}`} className="space-y-1.5 my-1.5">
          {listItems}
        </ul>,
      );
      continue;
    }

    // Bullet list: "• ", "- ", or "* "
    if (
      line.startsWith("• ") ||
      line.startsWith("- ") ||
      line.startsWith("* ")
    ) {
      const listItems: React.ReactNode[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("• ") ||
          lines[i].startsWith("- ") ||
          lines[i].startsWith("* "))
      ) {
        const content = lines[i].replace(/^[•\-\*]\s/, "");
        listItems.push(
          <li key={i} className="flex gap-2 items-start">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
            <span className="flex-1">{renderInline(content)}</span>
          </li>,
        );
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="space-y-1 my-1">
          {listItems}
        </ul>,
      );
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "***") {
      nodes.push(<hr key={i} className="border-border/30 my-2" />);
      i++;
      continue;
    }

    // Regular paragraph
    nodes.push(
      <p key={i} className="leading-relaxed">
        {renderInline(line)}
      </p>,
    );
    i++;
  }

  return nodes;
}

function renderInline(text: string): React.ReactNode {
  // Split by bold **text**, code `text`, or plain text
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    const key = `inline-${idx}-${part.slice(0, 8)}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={key}
          className="px-1.5 py-0.5 rounded text-xs font-mono bg-primary/10 text-primary border border-primary/20"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}>
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mt-0.5">
          <Bot size={14} className="text-primary" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-primary/15 text-foreground border border-primary/25 rounded-tr-sm shadow-glow-cyan"
            : "glass-effect border border-border/25 text-foreground rounded-tl-sm"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        ) : (
          <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AIAssistantSection() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [roadmapGoal, setRoadmapGoal] = useState("");
  const [showRoadmap, setShowRoadmap] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendChat = useSendChatMessage();
  const generateRoadmap = useGenerateStudyRoadmap();

  const isLoading = sendChat.isPending;
  const isGeneratingRoadmap = generateRoadmap.isPending;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message/loading change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMsg: ChatMsg = { role: "user", content: messageText };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput("");

    try {
      const historyForApi = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const reply = await sendChat.mutateAsync({
        userId: user?.id,
        message: messageText,
        history: historyForApi,
      });
      setMessages([...updatedHistory, { role: "assistant", content: reply }]);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "An error occurred";
      setMessages([
        ...updatedHistory,
        {
          role: "assistant",
          content: `I encountered an issue: ${errMsg}. Please try again or rephrase your question.`,
        },
      ]);
    }
  };

  const handleRoadmap = async () => {
    if (!roadmapGoal.trim()) return;
    const goal = roadmapGoal.trim();
    setRoadmapGoal("");
    setShowRoadmap(false);

    const userMsg: ChatMsg = {
      role: "user",
      content: `Generate a study roadmap for: ${goal}`,
    };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);

    try {
      const reply = await generateRoadmap.mutateAsync(goal);
      setMessages([...updatedHistory, { role: "assistant", content: reply }]);
    } catch {
      toast.error("Failed to generate roadmap. Please try again.");
      setMessages([
        ...updatedHistory,
        {
          role: "assistant",
          content: "Sorry, I couldn't generate the roadmap. Please try again.",
        },
      ]);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-primary shadow-glow-cyan" />
          <h2 className="text-xl font-display font-black text-foreground">
            AI Study Assistant
          </h2>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md glass-effect-darker border border-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary/70">ONLINE</span>
          </div>
        </div>
        <NeonButton
          variant="secondary"
          className="text-xs py-1.5 px-3"
          onClick={() => setShowRoadmap((s) => !s)}
          data-ocid="toggle-roadmap-btn"
        >
          <Sparkles size={12} /> Generate Roadmap
        </NeonButton>
      </div>

      {/* Roadmap goal input */}
      <AnimatePresence>
        {showRoadmap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 p-4 rounded-xl glass-effect-darker border border-secondary/30">
              <input
                value={roadmapGoal}
                onChange={(e) => setRoadmapGoal(e.target.value)}
                placeholder="Enter your study goal (e.g. 'Master machine learning in 3 months')"
                className="flex-1 px-3 py-2 rounded-lg bg-transparent border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:border-secondary/60 outline-none transition-all"
                data-ocid="roadmap-goal-input"
                onKeyDown={(e) => e.key === "Enter" && handleRoadmap()}
              />
              <NeonButton
                variant="secondary"
                onClick={handleRoadmap}
                loading={isGeneratingRoadmap}
                data-ocid="generate-roadmap-btn"
              >
                <Zap size={14} /> Generate
              </NeonButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <motion.button
            key={action.label}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSend(action.prompt)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono glass-effect-darker border border-border/30 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all disabled:opacity-50"
            data-ocid={`quick-action-${action.label.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {action.icon} {action.label}
          </motion.button>
        ))}
      </div>

      {/* Chat area */}
      <div
        className="flex-1 glass-effect-darker border border-border/20 rounded-2xl flex flex-col overflow-hidden"
        style={{ minHeight: "400px" }}
      >
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          data-ocid="chat-messages"
          style={{ maxHeight: "460px" }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={`${msg.role}-${i}`}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <MessageBubble msg={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
          {(isLoading || isGeneratingRoadmap) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-2"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Bot size={14} className="text-primary" />
              </div>
              <div className="glass-effect border border-border/25 rounded-2xl rounded-tl-sm">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-3 border-t border-border/20">
          <div className="flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend(input)
              }
              placeholder="Ask about data structures, OS, circuits, thermodynamics..."
              className="flex-1 px-4 py-2.5 rounded-xl glass-effect-darker border border-border/30 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:shadow-glow-cyan outline-none transition-all"
              data-ocid="chat-input"
              disabled={isLoading}
            />
            <NeonButton
              onClick={() => handleSend(input)}
              loading={isLoading}
              disabled={!input.trim() || isLoading}
              variant="primary"
              className="px-4 py-2.5 rounded-xl"
              data-ocid="chat-send-btn"
            >
              <Send size={15} />
            </NeonButton>
          </div>
        </div>
      </div>
    </div>
  );
}
