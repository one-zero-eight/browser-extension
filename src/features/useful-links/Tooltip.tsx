import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react'
import React, { useState } from 'react'

export function Tooltip({
  children,
  content,
  className,
}: {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [offset(5), flip(), shift()],
  })

  // Transition effect
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context)

  // Event listeners to change the open state
  const hover = useHover(context, { move: false })
  const focus = useFocus(context)
  const click = useClick(context, { toggle: false })
  const dismiss = useDismiss(context)
  // Role props for screen readers
  const role = useRole(context, { role: 'tooltip' })

  // Merge all the interactions into prop getters
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    click,
    dismiss,
    role,
  ])

  if (content === undefined) {
    return <>{children}</>
  }

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()} className={className}>
        {children}
      </div>

      {isMounted && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, ...transitionStyles }}
            {...getFloatingProps()}
            className="pointer-events-none z-10 rounded-xl bg-black px-4 py-2 text-sm text-white drop-shadow-md"
          >
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  )
}
