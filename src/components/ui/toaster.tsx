
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className: "group border-border bg-background text-foreground",
        descriptionClassName: "text-muted-foreground",
      }}
      richColors
    />
  )
}
