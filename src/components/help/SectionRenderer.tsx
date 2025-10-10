import { ChevronDown, ChevronRight } from 'lucide-react';

import type { Section } from './types';

interface SectionRendererProps {
  readonly section: Section;
  readonly level?: number;
  readonly expandedSections: Set<string>;
  readonly onToggleSection: (_sectionId: string) => void;
}

export const SectionRenderer = ({
  section,
  level = 0,
  expandedSections,
  onToggleSection,
}: SectionRendererProps) => {
  const isExpanded = expandedSections.has(section.id);
  const hasSubsections = section.subsections && section.subsections.length > 0;

  return (
    <div className='space-y-4'>
      <div id={`section-${section.id}`} className='scroll-mt-32'>
        <button
          onClick={() => hasSubsections && onToggleSection(section.id)}
          className={`flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors ${
            level === 0 ? 'bg-muted/50 hover:bg-muted/70' : 'bg-muted/30 hover:bg-muted/50'
          } ${hasSubsections ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <h3
            className={`font-semibold ${
              level === 0 ? 'text-foreground text-xl' : 'text-foreground text-lg'
            }`}
          >
            {section.title}
          </h3>
          {hasSubsections && (
            <div className='text-muted-foreground'>
              {isExpanded ? (
                <ChevronDown className='h-5 w-5' />
              ) : (
                <ChevronRight className='h-5 w-5' />
              )}
            </div>
          )}
        </button>

        {(!hasSubsections || isExpanded) && (
          <div className='mt-4 pl-4'>
            {section.content}
            {hasSubsections && isExpanded && (
              <div className='mt-4 space-y-3'>
                {section.subsections?.map(subsection => (
                  <SectionRenderer
                    key={subsection.id}
                    section={subsection}
                    level={level + 1}
                    expandedSections={expandedSections}
                    onToggleSection={onToggleSection}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
