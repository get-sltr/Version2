'use client';

import type { ReactNode } from 'react';

export const SEGMENT_EXPLORER_SIMULATED_ERROR_MESSAGE = 'NEXT_DEVTOOLS_DISABLED';

type SegmentBoundaryType = 'not-found' | 'error' | 'loading' | 'global-error' | null;

type SegmentViewProps = {
  type: string;
  pagePath: string;
  children?: ReactNode;
};

type SegmentState = {
  boundaryType: SegmentBoundaryType;
  setBoundaryType: (type: SegmentBoundaryType) => void;
};

const noopState: SegmentState = {
  boundaryType: null,
  setBoundaryType: () => {},
};

export function SegmentViewNode({ children }: SegmentViewProps) {
  return <>{children}</>;
}

export function SegmentViewStateNode() {
  return null;
}

export function SegmentBoundaryTriggerNode() {
  return null;
}

export function SegmentStateProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function useSegmentState(): SegmentState {
  return noopState;
}
