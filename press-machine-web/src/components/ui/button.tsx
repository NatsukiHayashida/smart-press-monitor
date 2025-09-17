import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95",
        destructive:
          "bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 hover:shadow-lg focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-95",
        outline:
          "bg-white text-blue-700 border-2 border-blue-700 rounded-xl shadow-sm hover:bg-blue-50 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95",
        secondary:
          "bg-gray-200 text-gray-900 rounded-xl shadow-sm hover:bg-gray-300 hover:shadow-md focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:scale-95",
        ghost:
          "bg-transparent text-gray-700 rounded-xl hover:bg-gray-100 hover:shadow-sm focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:scale-95",
        link: "text-blue-700 underline-offset-4 hover:underline focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-11 px-3 py-2.5 rounded-lg",
        lg: "h-14 px-8 py-4 rounded-2xl",
        icon: "h-12 w-12 p-3 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
