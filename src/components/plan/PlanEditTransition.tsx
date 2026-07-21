import { useEffect, useState, type ReactNode, type TransitionEvent } from 'react';

type EditPhase = 'closed' | 'opening' | 'open' | 'closing';

type PlanEditTransitionProps = {
  isOpen: boolean;
  children: ReactNode;
};

/** Keeps the editor mounted long enough for both opening and closing motion. */
export function PlanEditTransition({ isOpen, children }: PlanEditTransitionProps) {
  const [phase, setPhase] = useState<EditPhase>(isOpen ? 'open' : 'closed');

  useEffect(() => {
    setPhase((current) => {
      if (isOpen) {
        return current === 'open' ? current : 'opening';
      }

      return current === 'closed' ? current : 'closing';
    });
  }, [isOpen]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'grid-template-rows') {
      return;
    }

    setPhase((current) => {
      if (current === 'opening') return 'open';
      if (current === 'closing') return 'closed';
      return current;
    });
  };

  return (
    <div
      className={`plan-edit-transition is-${phase}`}
      aria-hidden={!isOpen}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="plan-edit-transition-inner">{children}</div>
    </div>
  );
}
