// shadcn/ui card primitives with semantic headings for the landing page.
import { cn } from '../../lib/utils.js'

export function Card({ className, ...props }) {
  return <div data-slot="card" className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)} {...props} />
}
export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-3 p-6', className)} {...props} />
}
export function CardTitle({ className, ...props }) {
  return <h2 className={cn('font-semibold leading-none tracking-tight', className)} {...props} />
}
export function CardContent({ className, ...props }) {
  return <div className={cn('px-6 pb-6', className)} {...props} />
}
