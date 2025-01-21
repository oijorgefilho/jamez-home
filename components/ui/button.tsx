"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import './button.css'
import { WalletButton } from '@/app/wallet/WalletButton'

const greenButtonClass = "flex h-[71px] px-[10px] py-[16px] items-center gap-[60px] self-stretch rounded-[49px] bg-gradient-to-r from-[#26A027] to-[#0E3A0E]"
const redButtonClass = "flex h-[71px] px-[10px] py-[16px] items-center justify-center gap-[60px] self-stretch rounded-[49px] bg-gradient-to-r from-[#F22116] to-[#591815] text-white"

const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: greenButtonClass,
        destructive: redButtonClass,
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        pro: "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold",
      },
      size: {
        default: "",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isListening?: boolean;
  isProcessing?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant: propVariant, size, isListening, isProcessing, children, ...props }, ref) => {
    const variant = isListening ? "destructive" : propVariant || "default";

    return (
      <WalletButton
        className={cn(
          buttonVariants({ variant, size, className }),
          "px-6 py-4 font-sora flex items-center justify-center"
        )}
        ref={ref}
        {...props}
      >
        {children}
      </WalletButton>
    );
  }
);
Button.displayName = "Button"

export { Button, buttonVariants }

