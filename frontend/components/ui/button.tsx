import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:     'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25',
        neon:        'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/30',
        secondary:   'bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30',
        outline:     'border border-border bg-transparent text-foreground hover:bg-muted',
        ghost:       'hover:bg-muted text-muted-foreground hover:text-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
        glass:       'glass-card text-foreground hover:bg-white/5',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm:      'h-8 px-3 text-xs',
        lg:      'h-12 px-6 text-base',
        xl:      'h-14 px-8 text-lg',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
