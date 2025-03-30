
import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { toast as sonnerToast } from "sonner"

export interface ToastActionElement {
  altText?: string
  action: React.ReactNode
}

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast> & {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

// Update the toast function to use Sonner's toast
function toast(props: ToastProps) {
  const { title, description, variant, ...restProps } = props

  return sonnerToast(title as string, {
    description,
    className: variant === "destructive" ? "destructive" : undefined,
  })
}

// Add the dismiss method
toast.dismiss = sonnerToast.dismiss

function useToast() {
  return {
    toast,
    dismiss: toast.dismiss,
  }
}

export { useToast, toast }
