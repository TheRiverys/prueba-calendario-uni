import type { ReactNode } from 'react';

export interface Section {
  id: string;
  title: string;
  content?: ReactNode;
  subsections?: Section[];
}
