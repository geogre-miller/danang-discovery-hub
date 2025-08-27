import React from 'react';
import { motion } from 'framer-motion';
import { Heart, HeartOff, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedActionButtonProps {
  variant: 'like' | 'dislike';
  isActive: boolean;
  count: number;
  isPending?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  showLabel?: boolean;
  'aria-label'?: string;
  'aria-pressed'?: boolean;
}

export const AnimatedActionButton: React.FC<AnimatedActionButtonProps> = ({
  variant,
  isActive,
  count,
  isPending = false,
  disabled = false,
  onClick,
  className,
  showLabel = true,
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const LikeIcon = isActive ? Heart : HeartOff;
  const DislikeIcon = ThumbsDown; // Always use ThumbsDown for dislike, filled state controlled by fill-current
  const Icon = variant === 'like' ? LikeIcon : DislikeIcon;
  const activeColor = variant === 'like' ? 'text-red-600' : 'text-orange-600'; // Different colors for like/dislike
  const activeBg = variant === 'like' ? 'bg-red-50 hover:bg-red-100' : 'bg-orange-50 hover:bg-orange-100';
  const inactiveColor = 'text-gray-400';
  const inactiveBg = 'bg-gray-50 hover:bg-gray-100 hover:text-gray-600';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || isPending}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={cn(
        "relative inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        showLabel ? "gap-2 rounded-full px-4 py-2" : "justify-center rounded-full p-2",
        isActive 
          ? `${activeBg} ${activeColor} focus:ring-${variant === 'like' ? 'red' : 'orange'}-500`
          : `${inactiveBg} ${inactiveColor} focus:ring-gray-500`,
        (disabled || isPending) && "opacity-50 cursor-not-allowed",
        className
      )}
      whileHover={!disabled && !isPending ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isPending ? { scale: 0.95 } : {}}
      initial={false}
      animate={{
        scale: isActive ? [1, 1.1, 1] : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
        duration: 0.2
      }}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isActive ? [0, -10, 10, -10, 0] : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
          duration: 0.3
        }}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            // Heart fills when liked, ThumbsDown fills when disliked
            isActive && "fill-current"
          )}
          aria-hidden="true"
        />
      </motion.div>
      
      {showLabel && (
        <span className="text-sm font-medium">
          {isPending ? '...' : count}
        </span>
      )}
      
      {!showLabel && count > 0 && (
        <span className={cn(
          "absolute -top-1 -right-1 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
          isActive 
            ? variant === 'like' ? "bg-red-500" : "bg-orange-500"
            : "bg-gray-500"
        )}>
          {isPending ? '...' : count > 99 ? '99+' : count}
        </span>
      )}
      
      {/* Pulse effect for active state */}
      {isActive && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            variant === 'like' ? "bg-red-400" : "bg-orange-400"
          )}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}
    </motion.button>
  );
};
