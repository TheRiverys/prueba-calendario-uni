import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { usePreferencesContext } from '@/contexts/preferences/PreferencesContext';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

import { SectionRenderer } from './SectionRenderer';
import { allSections } from './sections';
import { TableOfContents } from './TableOfContents';

// Función auxiliar para expandir secciones padre
const expandParentSectionsHelper = (
  sectionId: string,
  currentExpanded: Set<string>,
  sections: typeof allSections
): Set<string> => {
  const newExpandedSections = new Set(currentExpanded);

  // Expandir la sección misma
  newExpandedSections.add(sectionId);

  // Buscar y expandir secciones padre
  const findAndExpandParents = (sectionsList: typeof allSections, targetId: string): boolean => {
    for (const section of sectionsList) {
      if (section.id === targetId) {
        return true;
      }
      if (section.subsections) {
        const found = findAndExpandParents(section.subsections, targetId);
        if (found) {
          newExpandedSections.add(section.id);
          return true;
        }
      }
    }
    return false;
  };

  findAndExpandParents(sections, sectionId);
  return newExpandedSections;
};

const HelpPage = () => {
  const { setCurrentPage } = usePreferencesContext();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro']));
  const [activeSection, setActiveSection] = useState<string>('intro');

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setExpandedSections(expandParentSectionsHelper(sectionId, expandedSections, allSections));

    // Esperar un frame para que el DOM se actualice
    window.setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        const headerOffset = 120;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  return (
    <div className='bg-background min-h-screen'>
      <div className='border-border/70 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-16 z-30 border-b backdrop-blur'>
        <div className='app-shell flex h-14 items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setCurrentPage('dashboard')}
              className='flex items-center gap-2'
            >
              <ArrowLeft className='h-4 w-4' />
              <span>Volver al inicio</span>
            </Button>
          </div>
          <h1 className='text-foreground hidden text-lg font-semibold md:block'>Guía de Usuario</h1>
          <div className='w-[140px]' />
        </div>
      </div>

      <div className='flex'>
        <aside className='border-border/40 bg-background/95 fixed top-[120px] left-0 hidden h-[calc(100vh-120px)] w-56 border-r backdrop-blur lg:block'>
          <ScrollArea className='h-full px-4 py-6'>
            <TableOfContents
              sections={allSections}
              activeSection={activeSection}
              onSectionClick={scrollToSection}
            />
          </ScrollArea>
        </aside>

        <main className='w-full lg:ml-56'>
          <div className='mx-auto max-w-4xl px-6 py-8 lg:px-12'>
            <div className='mb-8'>
              <h1 className='text-foreground mb-4 text-4xl font-bold'>
                Guía de Usuario - Calendario Universitario
              </h1>
              <p className='text-muted-foreground text-lg leading-relaxed'>
                ¡Bienvenido a tu Calendario Universitario! Esta aplicación te ayudará a organizar y
                gestionar todas tus entregas académicas de manera eficiente. A continuación
                encontrarás una guía completa paso a paso para aprovechar al máximo todas las
                funcionalidades.
              </p>
            </div>

            <div className='space-y-6'>
              {allSections.map(section => (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  expandedSections={expandedSections}
                  onToggleSection={toggleSection}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export { HelpPage };
