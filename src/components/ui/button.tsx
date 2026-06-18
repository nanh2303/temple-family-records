import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm shadow-stone-900/10 hover:bg-amber-700 hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground ring-1 ring-border hover:bg-stone-200/70",
        outline: "border border-border bg-card text-foreground shadow-sm shadow-stone-900/5 hover:border-stone-300 hover:bg-stone-50",
        ghost: "text-stone-700 hover:bg-stone-100 hover:text-stone-950",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-primary text-primary-foreground shadow-sm shadow-amber-900/20 hover:bg-amber-700 hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-red-900/15 hover:bg-red-700 hover:shadow-md focus-visible:ring-red-600/45",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
