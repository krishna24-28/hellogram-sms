import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useRouter } from "@tanstack/react-router";
import {
  Activity,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Cpu,
  GraduationCap,
  KeyRound,
  Loader2,
  Shield,
  Wifi,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { HUDCircle } from "../components/ui/HUDCircle";
import { HologramBackground } from "../components/ui/HologramBackground";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { NeonButton } from "../components/ui/NeonButton";
import {
  useActorReady,
  useGetUserProfile,
  useLoginWithPassword,
  useRegisterUser,
  useRegisterWithPassword,
} from "../hooks/useQueries";
import { useAuthStore } from "../store/authStore";
import { UserRole } from "../types";

type AuthTab = "ii" | "password";
type Mode = "login" | "register";

// ── System Status Bar ─────────────────────────────────────────────────────────

function SystemStatusBar() {
  const { ready, initializing } = useActorReady();

  return (
    <AnimatePresence mode="wait">
      {initializing ? (
        <motion.div
          key="initializing"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-secondary/30 bg-secondary/5 mb-4"
          data-ocid="system-status-bar"
        >
          <Loader2
            size={11}
            className="text-secondary animate-spin flex-shrink-0"
          />
          <span className="text-[10px] font-mono tracking-widest text-secondary/80 uppercase">
            System initializing — please wait...
          </span>
        </motion.div>
      ) : ready ? (
        <motion.div
          key="ready"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-primary/25 bg-primary/5 mb-4"
          data-ocid="system-status-bar"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
          <span className="text-[10px] font-mono tracking-widest text-primary/70 uppercase">
            System ready
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

const ROLE_OPTIONS = [
  {
    value: UserRole.student,
    label: "Student",
    desc: "Access grades, attendance & AI tutor",
    icon: <GraduationCap size={18} />,
    color: "cyan" as const,
  },
  {
    value: UserRole.teacher,
    label: "Teacher",
    desc: "Manage classes, mark attendance & grades",
    icon: <BookOpen size={18} />,
    color: "yellow" as const,
  },
  {
    value: UserRole.admin,
    label: "Admin",
    desc: "Full system control and oversight",
    icon: <Shield size={18} />,
    color: "magenta" as const,
  },
];

const roleColorMap = {
  cyan: {
    selected: "border-primary/60 bg-primary/10 shadow-glow-cyan",
    icon: "text-primary",
  },
  yellow: {
    selected: "border-secondary/60 bg-secondary/10 shadow-glow-yellow",
    icon: "text-secondary",
  },
  magenta: {
    selected: "border-accent/60 bg-accent/10 shadow-glow-accent",
    icon: "text-accent",
  },
};

function RoleSelector({
  selectedRole,
  onSelect,
}: {
  selectedRole: UserRole;
  onSelect: (r: UserRole) => void;
}) {
  return (
    <div>
      <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2.5 block">
        Select Role
      </Label>
      <div className="space-y-2">
        {ROLE_OPTIONS.map((opt) => {
          const isSelected = selectedRole === opt.value;
          const colors = roleColorMap[opt.color];
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              data-ocid={`role-${opt.value}-btn`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                isSelected
                  ? colors.selected
                  : "border-border/30 hover:border-border/60 glass-effect-darker"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? opt.color === "cyan"
                      ? "border-primary bg-primary/20"
                      : opt.color === "yellow"
                        ? "border-secondary bg-secondary/20"
                        : "border-accent bg-accent/20"
                    : "border-border/50"
                }`}
              >
                {isSelected && (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      opt.color === "cyan"
                        ? "bg-primary"
                        : opt.color === "yellow"
                          ? "bg-secondary"
                          : "bg-accent"
                    }`}
                  />
                )}
              </div>
              <span
                className={`flex-shrink-0 ${isSelected ? colors.icon : "text-muted-foreground"}`}
              >
                {opt.icon}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-display font-semibold text-foreground leading-none mb-0.5">
                  {opt.label}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {opt.desc}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Side HUD Panel (decorative, wider screens only) ───────────────────────────

function SideHUDPanel() {
  const stats = [
    {
      label: "STUDENTS ACTIVE",
      value: "2,847",
      icon: <GraduationCap size={12} />,
    },
    { label: "SYSTEM STATUS", value: "ONLINE", icon: <Activity size={12} /> },
    { label: "AI CORE", value: "READY", icon: <Cpu size={12} /> },
    { label: "DATA NODES", value: "256", icon: <Zap size={12} /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
      className="hidden lg:flex flex-col items-center justify-center gap-8 w-72 flex-shrink-0"
    >
      {/* Large holographic HUD circle */}
      <div className="relative flex items-center justify-center">
        <HUDCircle size={220} color="cyan" speed="slow" innerRing>
          <HUDCircle size={140} color="yellow" speed="normal">
            <HUDCircle size={72} color="cyan" speed="fast">
              <div className="w-8 h-8 rounded-full bg-primary/30 border border-primary/50 shadow-glow-cyan flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-glow-cyan" />
              </div>
            </HUDCircle>
          </HUDCircle>
        </HUDCircle>

        {/* Scanning line effect */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
          style={{ width: 220, height: 220 }}
        >
          <motion.div
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>

      {/* System stats */}
      <div className="w-full space-y-2">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center justify-between px-3 py-2 rounded-lg glass-effect-darker border border-border/20"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary/70">{stat.icon}</span>
              <span className="text-[10px] font-mono tracking-wider">
                {stat.label}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-primary">
              {stat.value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Bottom label */}
      <div className="text-center space-y-1">
        <p className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] uppercase">
          Holographic Interface
        </p>
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary/60">
            SECURE CHANNEL
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Internet Identity Panel ────────────────────────────────────────────────────

function IIPanel() {
  const router = useRouter();
  const { login } = useAuthStore();
  const {
    login: iiLogin,
    loginStatus,
    identity,
    isInitializing,
  } = useInternetIdentity();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.student);
  const [error, setError] = useState("");

  const registerUser = useRegisterUser();

  const principalId = identity?.getPrincipal().toText();
  const { data: existingProfile, isFetching: profileFetching } =
    useGetUserProfile(loginStatus === "success" ? principalId : undefined);

  const isLoading =
    isInitializing ||
    profileFetching ||
    loginStatus === "logging-in" ||
    registerUser.isPending;

  const redirectToDashboard = (role: UserRole) => {
    if (role === UserRole.student) router.navigate({ to: "/student" });
    else if (role === UserRole.teacher) router.navigate({ to: "/teacher" });
    else router.navigate({ to: "/admin" });
  };

  const handleLogin = async () => {
    setError("");
    if (!identity) {
      iiLogin();
      return;
    }
    if (!existingProfile) {
      setError("No account found. Please register first.");
      return;
    }
    login(existingProfile);
    redirectToDashboard(existingProfile.role);
  };

  const handleRegister = async () => {
    setError("");
    if (!identity) {
      iiLogin();
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    try {
      const profile = await registerUser.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        role: selectedRole,
      });
      login(profile);
      redirectToDashboard(profile.role);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Registration failed. Please try again.",
      );
    }
  };

  // Auto-redirect if profile loaded after II auth
  if (
    loginStatus === "success" &&
    existingProfile &&
    !profileFetching &&
    mode === "login"
  ) {
    login(existingProfile);
    redirectToDashboard(existingProfile.role);
  }

  return (
    <>
      <div className="relative flex rounded-lg border border-border/30 p-1 mb-5 glass-effect-darker overflow-hidden">
        <motion.div
          className="absolute top-1 bottom-1 rounded-md bg-primary/15 border border-primary/40 shadow-glow-cyan"
          animate={{
            left: mode === "login" ? 4 : "50%",
            width: "calc(50% - 4px)",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
            }}
            data-ocid={`ii-mode-${m}-btn`}
            className={`relative flex-1 py-2 rounded-md text-sm font-display font-semibold transition-colors duration-200 z-10 ${
              mode === m
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "login" ? "SIGN IN" : "REGISTER"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-10 flex justify-center">
          <LoadingSpinner size="md" label="AUTHENTICATING" />
        </div>
      ) : (
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {mode === "register" && (
            <>
              <div>
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Full Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="glass-effect-darker border-border/40 focus:border-primary/60 focus:shadow-glow-cyan transition-all duration-200"
                  data-ocid="ii-register-name-input"
                />
              </div>
              <div>
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="glass-effect-darker border-border/40 focus:border-primary/60 focus:shadow-glow-cyan transition-all duration-200"
                  data-ocid="ii-register-email-input"
                />
              </div>
              <RoleSelector
                selectedRole={selectedRole}
                onSelect={setSelectedRole}
              />
            </>
          )}

          {mode === "login" && !identity && (
            <div className="rounded-lg border border-border/20 bg-muted/10 p-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Connect with Internet Identity to access your portal
              </p>
            </div>
          )}

          {mode === "login" && identity && !existingProfile && (
            <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-3 text-center">
              <p className="text-sm text-secondary/80 font-mono">
                Identity connected. No account found — please register.
              </p>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 p-3 rounded-lg border border-accent/30 bg-accent/10"
              data-ocid="ii-auth-error-msg"
            >
              <AlertCircle
                size={16}
                className="text-accent mt-0.5 flex-shrink-0"
              />
              <p className="text-sm text-accent">{error}</p>
            </motion.div>
          )}

          <NeonButton
            variant="primary"
            fullWidth
            onClick={mode === "login" ? handleLogin : handleRegister}
            loading={isLoading}
            data-ocid={
              mode === "login"
                ? "ii-login-submit-btn"
                : "ii-register-submit-btn"
            }
          >
            {!identity
              ? "Connect Identity"
              : mode === "login"
                ? "Access System"
                : "Join System"}
          </NeonButton>

          <p className="text-center text-xs text-muted-foreground pt-1">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.div>
      )}
    </>
  );
}

// ── Username / Password Panel ─────────────────────────────────────────────────

function PasswordPanel() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.student);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const { initializing: actorInitializing } = useActorReady();
  const loginMutation = useLoginWithPassword();
  const registerMutation = useRegisterWithPassword();

  const isLoading =
    loginMutation.isPending || registerMutation.isPending || isConnecting;

  // Derive button label based on current state
  const loginButtonLabel = isConnecting
    ? "Connecting..."
    : loginMutation.isPending
      ? "Logging in..."
      : "Sign In";

  const registerButtonLabel = isConnecting
    ? "Connecting..."
    : registerMutation.isPending
      ? "Creating account..."
      : "Create Account";

  const redirectToDashboard = (role: UserRole) => {
    if (role === UserRole.student) router.navigate({ to: "/student" });
    else if (role === UserRole.teacher) router.navigate({ to: "/teacher" });
    else router.navigate({ to: "/admin" });
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }
    // Show "Connecting..." if actor is not ready yet
    if (actorInitializing) setIsConnecting(true);
    try {
      const profile = await loginMutation.mutateAsync({
        username: username.trim(),
        password: password.trim(),
      });
      setIsConnecting(false);
      login(profile);
      setSuccess(`Welcome back, ${profile.name}! Redirecting...`);
      setTimeout(() => {
        redirectToDashboard(profile.role);
      }, 600);
    } catch (e) {
      setIsConnecting(false);
      const msg = e instanceof Error ? e.message : "Login failed.";
      if (
        msg.includes("INVALID_CREDENTIALS") ||
        msg.includes("Invalid credentials") ||
        msg.includes("incorrect") ||
        msg.includes("not found") ||
        msg.includes("wrong")
      ) {
        setError(
          "Invalid username or password. Please check your credentials.",
        );
        setTimeout(() => {
          router.navigate({ to: "/" });
        }, 2500);
        return;
      }
      if (
        msg === "SYSTEM_NOT_READY" ||
        msg.includes("not ready") ||
        msg.includes("SYSTEM_NOT_READY")
      ) {
        setError(
          "System is still starting up. Please wait a moment and try again.",
        );
        return;
      }
      setError(msg || "Login failed. Check your credentials.");
    }
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");
    if (!username.trim() || !password.trim() || !name.trim() || !email.trim()) {
      setError("All fields are required.");
      return;
    }
    if (actorInitializing) setIsConnecting(true);
    try {
      await registerMutation.mutateAsync({
        username: username.trim(),
        password: password.trim(),
        name: name.trim(),
        email: email.trim(),
        role: selectedRole,
      });
      const profile = await loginMutation.mutateAsync({
        username: username.trim(),
        password: password.trim(),
      });
      setIsConnecting(false);
      login(profile);
      setSuccess(`Account created! Welcome, ${profile.name}!`);
      setTimeout(() => {
        redirectToDashboard(profile.role);
      }, 600);
    } catch (e) {
      setIsConnecting(false);
      const msg = e instanceof Error ? e.message : "Registration failed.";
      if (msg.includes("already exists") || msg.includes("USERNAME_TAKEN")) {
        setError("Username already taken. Please choose a different one.");
        return;
      }
      if (msg === "SYSTEM_NOT_READY" || msg.includes("SYSTEM_NOT_READY")) {
        setError(
          "System is still starting up. Please wait a moment and try again.",
        );
        return;
      }
      setError(msg || "Registration failed. Please try again.");
    }
  };

  return (
    <>
      <div className="relative flex rounded-lg border border-border/30 p-1 mb-5 glass-effect-darker overflow-hidden">
        <motion.div
          className="absolute top-1 bottom-1 rounded-md bg-secondary/15 border border-secondary/40 shadow-glow-yellow"
          animate={{
            left: mode === "login" ? 4 : "50%",
            width: "calc(50% - 4px)",
          }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
        {(["login", "register"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
              setSuccess("");
            }}
            data-ocid={`pw-mode-${m}-btn`}
            className={`relative flex-1 py-2 rounded-md text-sm font-display font-semibold transition-colors duration-200 z-10 ${
              mode === m
                ? "text-secondary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "login" ? "SIGN IN" : "REGISTER"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-10 flex justify-center">
          <LoadingSpinner size="md" label="AUTHENTICATING" />
        </div>
      ) : (
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div>
            <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Username
            </Label>
            <Input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="e.g. krishna"
              className="glass-effect-darker border-border/40 focus:border-secondary/60 focus:shadow-glow-yellow transition-all duration-200"
              data-ocid="pw-username-input"
              autoComplete="username"
              onKeyDown={(e) => {
                if (e.key === "Enter" && mode === "login") handleLogin();
              }}
            />
          </div>

          <div>
            <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter password"
              className="glass-effect-darker border-border/40 focus:border-secondary/60 focus:shadow-glow-yellow transition-all duration-200"
              data-ocid="pw-password-input"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && mode === "login") handleLogin();
              }}
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Full Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="glass-effect-darker border-border/40 focus:border-secondary/60 focus:shadow-glow-yellow transition-all duration-200"
                  data-ocid="pw-register-name-input"
                />
              </div>
              <div>
                <Label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="glass-effect-darker border-border/40 focus:border-secondary/60 focus:shadow-glow-yellow transition-all duration-200"
                  data-ocid="pw-register-email-input"
                />
              </div>
              <RoleSelector
                selectedRole={selectedRole}
                onSelect={setSelectedRole}
              />
            </>
          )}

          {/* Admin hint */}
          {mode === "login" && (
            <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-3">
              <p className="text-xs font-mono text-center text-secondary/70">
                Admin credentials:{" "}
                <button
                  type="button"
                  onClick={() => {
                    setUsername("krishna");
                    setPassword("53083");
                  }}
                  className="text-secondary font-bold hover:underline"
                  title="Click to auto-fill"
                >
                  krishna
                </button>
                {" · "}
                <button
                  type="button"
                  onClick={() => {
                    setUsername("krishna");
                    setPassword("53083");
                  }}
                  className="text-secondary font-bold hover:underline"
                  title="Click to auto-fill"
                >
                  53083
                </button>
                <span className="text-muted-foreground ml-1">
                  (click to fill)
                </span>
              </p>
            </div>
          )}

          {/* Success message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg border border-primary/30 bg-primary/10"
                data-ocid="pw-auth-success-msg"
              >
                <CheckCircle2
                  size={16}
                  className="text-primary mt-0.5 flex-shrink-0"
                />
                <p className="text-sm text-primary">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg border border-accent/30 bg-accent/10"
                data-ocid="pw-auth-error-msg"
              >
                <AlertCircle
                  size={16}
                  className="text-accent mt-0.5 flex-shrink-0"
                />
                <p className="text-sm text-accent">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <NeonButton
            variant="secondary"
            fullWidth
            onClick={mode === "login" ? handleLogin : handleRegister}
            loading={isLoading}
            data-ocid={
              mode === "login"
                ? "pw-login-submit-btn"
                : "pw-register-submit-btn"
            }
          >
            {mode === "login" ? loginButtonLabel : registerButtonLabel}
          </NeonButton>

          <p className="text-center text-xs text-muted-foreground pt-1">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-secondary hover:text-secondary/80 font-medium transition-colors"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-secondary hover:text-secondary/80 font-medium transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.div>
      )}
    </>
  );
}

// ── Main LoginPage ─────────────────────────────────────────────────────────────

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>("password");

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "oklch(0.08 0.01 245)" }}
    >
      {/* Full-page holographic background */}
      <HologramBackground />

      {/* Side vignette gradients for depth */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background/60 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/50 to-transparent" />
      </div>

      {/* Main layout: side panel + form */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 flex items-center justify-center gap-16">
        {/* Left side: form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 280,
            damping: 24,
          }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <HUDCircle size={80} color="cyan" speed="slow" innerRing>
                <HUDCircle size={44} color="yellow" speed="normal">
                  <div className="w-3.5 h-3.5 rounded-full bg-primary animate-pulse-glow shadow-glow-cyan" />
                </HUDCircle>
              </HUDCircle>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-3xl font-display font-black tracking-wider"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.7 0.22 190), oklch(0.85 0.18 190), oklch(0.75 0.2 95))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
                filter: "drop-shadow(0 0 20px oklch(0.7 0.22 190 / 0.5))",
              }}
            >
              HELLOGRAM
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-xs text-muted-foreground mt-1.5 font-mono tracking-[0.2em] uppercase"
            >
              Student Management System
            </motion.p>
          </div>

          {/* Glass card form */}
          <div
            className="rounded-2xl border border-primary/20 p-6 relative overflow-hidden"
            style={{
              background: "oklch(0.14 0.012 245 / 0.85)",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 0 40px oklch(0.7 0.22 190 / 0.12), 0 0 80px oklch(0.7 0.22 190 / 0.06), inset 0 1px 0 oklch(0.7 0.22 190 / 0.1)",
            }}
          >
            {/* Subtle inner glow top edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            {/* System status bar */}
            <SystemStatusBar />

            {/* Auth method tabs */}
            <div
              className="relative flex rounded-xl border border-border/40 p-1 mb-6 overflow-hidden"
              style={{ background: "oklch(0.1 0.01 245 / 0.6)" }}
            >
              <motion.div
                className={`absolute top-1 bottom-1 rounded-lg transition-colors duration-300 ${
                  activeTab === "ii"
                    ? "border border-primary/40 shadow-glow-cyan"
                    : "border border-secondary/40 shadow-glow-yellow"
                }`}
                style={{
                  background:
                    activeTab === "ii"
                      ? "oklch(0.7 0.22 190 / 0.12)"
                      : "oklch(0.75 0.2 95 / 0.12)",
                }}
                animate={{
                  left: activeTab === "ii" ? 4 : "50%",
                  width: "calc(50% - 4px)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              />
              <button
                type="button"
                onClick={() => setActiveTab("ii")}
                data-ocid="auth-tab-ii-btn"
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-display font-bold transition-colors duration-200 z-10 ${
                  activeTab === "ii"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wifi size={13} />
                <span>Internet Identity</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("password")}
                data-ocid="auth-tab-password-btn"
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-display font-bold transition-colors duration-200 z-10 ${
                  activeTab === "password"
                    ? "text-secondary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <KeyRound size={13} />
                <span>Username & Password</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "ii" ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === "ii" ? 16 : -16 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                {activeTab === "ii" ? <IIPanel /> : <PasswordPanel />}
              </motion.div>
            </AnimatePresence>

            {/* Bottom inner glow */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-muted-foreground mt-4"
          >
            Secured by{" "}
            <span className="text-primary font-mono">Internet Identity</span>
            {" · "}
            <span className="text-secondary font-mono">Password Auth</span>
          </motion.p>
        </motion.div>

        {/* Right side: decorative HUD panel (large screens only) */}
        <SideHUDPanel />
      </div>
    </div>
  );
}
