import type { Section } from './types';

interface TableOfContentsProps {
  readonly sections: Section[];
  readonly activeSection: string;
  readonly onSectionClick: (_sectionId: string) => void;
}

export const TableOfContents = ({
  sections,
  activeSection,
  onSectionClick,
}: TableOfContentsProps) => {
  const renderTocItem = (section: Section, level: number = 0) => (
    <div key={section.id}>
      <button
        onClick={() => onSectionClick(section.id)}
        className={`hover:text-foreground text-muted-foreground block w-full py-1.5 text-left text-xs transition-colors ${
          activeSection === section.id ? 'text-primary font-semibold' : ''
        }`}
        style={{ paddingLeft: `${level * 8}px` }}
      >
        {section.title}
      </button>
      {section.subsections?.map(subsection => renderTocItem(subsection, level + 1))}
    </div>
  );

  return (
    <div className='space-y-0.5'>
      <h3 className='text-foreground mb-3 text-xs font-bold tracking-wider uppercase'>Índice</h3>
      {sections.map(section => renderTocItem(section))}
    </div>
  );
};
