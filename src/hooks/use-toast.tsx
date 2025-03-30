
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
  useToast as useToastOriginal,
  ToastActionType,
} from "@/components/ui/use-toast";

export type { ToastProps };

export { ToastProvider, ToastViewport } from "@/components/ui/toast";

export const useToast = useToastOriginal;

// Re-export the toast function from the original hook
export function toast(props: ToastProps & { action?: ToastActionElement }) {
  const { toast } = useToastOriginal();
  return toast(props);
}
