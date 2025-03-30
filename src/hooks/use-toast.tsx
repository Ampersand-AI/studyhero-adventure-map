
import * as React from "react"
import { toast as sonnerToast, ToastT } from "sonner"

export interface ToastProps {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
  className?: string
  // Add custom properties for our application
  progress?: number
}

// Update the toast function to use Sonner's toast
function toast(props: ToastProps) {
  const { title, description, variant, progress, ...restProps } = props

  return sonnerToast(title as string, {
    description,
    className: variant === "destructive" ? "destructive" : undefined,
    ...restProps
  })
}

// Add the dismiss method
toast.dismiss = sonnerToast.dismiss

// Add promise method
toast.promise = sonnerToast.promise

// Custom loading toast with progress
toast.loading = (
  title: string, 
  options?: Omit<ToastProps, "title"> & { id?: string }
) => {
  return sonnerToast.loading(title, options);
};

// Add success method
toast.success = (
  title: string, 
  options?: Omit<ToastProps, "title"> & { id?: string }
) => {
  return sonnerToast.success(title, options);
};

// Add error method
toast.error = (
  title: string, 
  options?: Omit<ToastProps, "title"> & { id?: string }
) => {
  return sonnerToast.error(title, options);
};

// Add info method
toast.info = (
  title: string, 
  options?: Omit<ToastProps, "title"> & { id?: string }
) => {
  return sonnerToast.info(title, options);
};

function useToast() {
  return {
    toast,
    dismiss: toast.dismiss,
    promise: toast.promise,
    loading: toast.loading,
    success: toast.success,
    error: toast.error,
    info: toast.info,
  }
}

export { useToast, toast }
