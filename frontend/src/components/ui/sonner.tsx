import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5 text-primary" />,
        info: <InfoIcon className="size-5 text-primary" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-500" />,
        error: <OctagonXIcon className="size-5 text-destructive" />,
        loading: <Loader2Icon className="size-5 text-primary animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-foreground/5 group-[.toaster]:shadow-strong group-[.toaster]:rounded-3xl p-5 border flex gap-4 items-center transition-all duration-300",
          title: "font-black tracking-tight text-sm text-foreground",
          description: "group-[.toast]:text-muted-foreground font-semibold text-xs leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-2xl font-bold uppercase tracking-wider text-[10px] px-4 py-2",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-foreground group-[.toast]:rounded-2xl font-bold uppercase tracking-wider text-[10px] px-4 py-2",
        },
      }}
      style={
        {
          "--normal-bg": "hsl(var(--card) / 0.95)",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border) / 0.4)",
          "--border-radius": "1.5rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
