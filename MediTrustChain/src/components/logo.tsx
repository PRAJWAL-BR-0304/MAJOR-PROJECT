
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, iconOnly = false, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 'h-8 w-8', text: 'text-lg', gap: 'gap-2' },
    md: { icon: 'h-10 w-10', text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 'h-12 w-12', text: 'text-2xl', gap: 'gap-3' },
  };

  const { icon, text, gap } = sizeClasses[size];

  return (
    <div className={cn("flex items-center", gap, className)}>
      {/* Modern Logo Icon */}
      <div className={cn(
        "relative flex items-center justify-center rounded-xl",
        "bg-gradient-to-br from-primary via-primary to-accent",
        "shadow-lg shadow-primary/25",
        icon
      )}>
        {/* Shield with Plus Symbol */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[60%] w-[60%] text-white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Shield outline */}
          <path
            d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
          />
          {/* Plus/Cross symbol */}
          <path
            d="M12 8v8M8 12h8"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      
      {!iconOnly && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold tracking-tight leading-none",
            "bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text",
            text
          )}>
            MedAssure
          </span>
          <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
            Trusted Supply Chain
          </span>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile/small spaces
export function LogoCompact({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md shadow-primary/20">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-white"
          strokeWidth="2"
        >
          <path
            d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
            fill="currentColor"
            fillOpacity="0.2"
            stroke="currentColor"
          />
          <path
            d="M12 8v8M8 12h8"
            stroke="currentColor"
            strokeWidth="2.5"
          />
        </svg>
      </div>
      <span className="text-lg font-bold tracking-tight">MedAssure</span>
    </div>
  );
}
