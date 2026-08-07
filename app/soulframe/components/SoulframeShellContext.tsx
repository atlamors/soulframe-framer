"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type SoulframeAiAction = {
  label: string;
  isActive: boolean;
  onDismiss: () => void;
  onToggle: () => void;
};

type SoulframeShellContextValue = {
  aiAction: SoulframeAiAction | null;
  registerAiAction: (action: SoulframeAiAction) => () => void;
};

const SoulframeShellContext =
  createContext<SoulframeShellContextValue | null>(null);

export function SoulframeShellProvider({ children }: { children: ReactNode }) {
  const [aiAction, setAiAction] = useState<SoulframeAiAction | null>(null);
  const registerAiAction = useCallback((action: SoulframeAiAction) => {
    setAiAction(action);
    return () => {
      setAiAction((current) => (current === action ? null : current));
    };
  }, []);
  const value = useMemo(
    () => ({ aiAction, registerAiAction }),
    [aiAction, registerAiAction],
  );

  return (
    <SoulframeShellContext.Provider value={value}>
      {children}
    </SoulframeShellContext.Provider>
  );
}

export function useSoulframeShell() {
  const context = useContext(SoulframeShellContext);
  if (!context) {
    throw new Error(
      "Soulframe shell actions must be used within SoulframeShellProvider.",
    );
  }
  return context;
}
