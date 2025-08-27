import React from 'react';
import { cn } from "@/lib/utils";
import { HTMLMotionProps } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface AnimatedActionButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant: 'like' | 'dislike';
  isActive?: boolean;
  count: number;
  isPending?: boolean;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean; // New prop to control label visibility
}

export const AnimatedActionButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedActionButtonProps
>(({ 
  variant, 
  isActive = false, 
  count, 
  isPending = false, 
  onClick, 
  className, 
  disabled = false,
  showLabel = true, // Default to true for backward compatibility
  ...props 
}, ref) => {
  const Icon = variant === 'like' ? ThumbsUp : ThumbsDown;
  const activeColorClass = variant === 'like' 
    ? 'text-green-700 bg-green-50 border-green-200' 
    : 'text-red-700 bg-red-50 border-red-200';
  const hoverColorClass = variant === 'like'
    ? 'hover:text-green-700 hover:bg-green-50/50'
    : 'hover:text-red-700 hover:bg-red-50/50';
  const baseColorClass = variant === 'like' ? 'text-green-600' : 'text-red-600';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e as any);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.button
        ref={ref}
        className={cn(
          "flex items-center gap-2 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded-md",
          isActive 
            ? `${activeColorClass} shadow-sm border` 
            : `${baseColorClass} ${hoverColorClass}`,
          className,
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || isPending}
        aria-pressed={isActive}
        aria-label={variant === 'like' ? 'Like' : 'Dislike'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isPending ? { 
          scale: [1, 1.1, 1],
          transition: { duration: 0.6, repeat: Infinity }
        } : isActive ? { 
          scale: [1, 1.2, 1],
          rotate: variant === 'like' ? [0, 10, -10, 0] : [0, -10, 10, 0]
        } : {}}
        transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
        {...props}
      >
        <motion.div
          animate={isPending ? { 
            y: variant === 'like' ? [0, -2, 0] : [0, 2, 0],
            transition: { duration: 0.4, repeat: Infinity }
          } : isActive ? { 
            rotate: variant === 'like' ? [0, 15, -15, 0] : [0, -15, 15, 0],
            scale: [1, 1.2, 1]
          } : {}}
          transition={{ duration: 0.4 }}
        >
          <Icon size={16} fill={isActive ? 'currentColor' : 'none'} />
        </motion.div>
        <motion.span 
          className="font-medium"
          animate={isPending ? {
            scale: [1, 1.05, 1],
            transition: { duration: 0.3, repeat: Infinity }
          } : {}}
        >
          {count}
        </motion.span>
        {showLabel && (
          <span className="text-muted-foreground">
            {variant === 'like' ? 'Likes' : 'Dislikes'}
          </span>
        )}
      </motion.button>
    </AnimatePresence>
  );
});

AnimatedActionButton.displayName = "AnimatedActionButton";
