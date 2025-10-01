import React, { Suspense, lazy } from "react"
import { Calendar as CalendarIcon, BarChart3, Edit2 } from "lucide-react"

import type { StudySchedule } from "@/types"
import { useAppContext } from "@/contexts/AppContext"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DeliveryList = lazy(() => import("./views/DeliveryList"))
const CalendarView = lazy(() => import("./views/CalendarView"))
const GanttView = lazy(() => import("./views/GanttView"))

interface ViewsProps {
  activeView: "list" | "calendar" | "gantt"
  schedule: StudySchedule[]
}

const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-64 text-sm text-muted-foreground">
    Cargando…
  </div>
)

export const Views: React.FC<ViewsProps> = ({ activeView, schedule }) => {
  const {
    openModal,
    deleteDelivery,
    toggleCompleted,
    selectedSubject,
    subjects,
    sortBy,
    setSelectedSubject,
    setSortBy,
    setActiveView
  } = useAppContext()

  const renderListView = (): React.JSX.Element => (
    <Suspense fallback={<LoadingFallback />}>
      <DeliveryList
        schedule={schedule}
        onEdit={openModal}
        onDelete={deleteDelivery}
        onToggleComplete={toggleCompleted}
        selectedSubject={selectedSubject}
        subjects={subjects}
        onSubjectChange={setSelectedSubject}
        sortBy={sortBy}
        onSortChange={setSortBy}
        activeView={activeView}
        onViewChange={setActiveView}
        onAdd={() => openModal()}
      />
    </Suspense>
  )

  const renderCalendarView = (): React.JSX.Element => (
    <Suspense fallback={<LoadingFallback />}>
      <CalendarView
        schedule={schedule}
        onEdit={openModal}
        onDelete={deleteDelivery}
        onToggleComplete={toggleCompleted}
        selectedSubject={selectedSubject}
        subjects={subjects}
        onSubjectChange={setSelectedSubject}
      />
    </Suspense>
  )

  const renderGanttView = (): React.JSX.Element => (
    <Suspense fallback={<LoadingFallback />}>
      <GanttView schedule={schedule} />
    </Suspense>
  )

  const renderActiveView = (): React.JSX.Element | null => {
    switch (activeView) {
      case "list":
        return renderListView()
      case "calendar":
        return (
          <div className="w-full">
            <div className="flex flex-col gap-6 sm:gap-4 border-b border-border/60 pb-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                  <CalendarIcon className="w-5 h-5" />
                  Calendario
                </h2>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="hidden md:inline lg:inline text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Vista</span>
                      <Select value={activeView} onValueChange={(v) => setActiveView(v as "list" | "calendar" | "gantt")}>
                        <SelectTrigger className="w-[120px] sm:w-[140px] lg:w-[160px]">
                          <SelectValue placeholder="Vista" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="list">Lista</SelectItem>
                          <SelectItem value="calendar">Calendario</SelectItem>
                          <SelectItem value="gantt">Gantt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button onClick={() => openModal()} className="flex items-center gap-2 whitespace-nowrap">
                      <Edit2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Nueva entrega</span>
                      <span className="sm:hidden">Nueva</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              {renderCalendarView()}
            </div>
          </div>
        )
      case "gantt":
        return (
          <div className="w-full">
            <div className="flex flex-col gap-6 sm:gap-4 border-b border-border/60 pb-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                  <BarChart3 className="w-5 h-5" />
                  Gantt
                </h2>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="hidden md:inline lg:inline text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">Vista</span>
                      <Select value={activeView} onValueChange={(v) => setActiveView(v as "list" | "calendar" | "gantt")}>
                        <SelectTrigger className="w-[120px] sm:w-[140px] lg:w-[160px]">
                          <SelectValue placeholder="Vista" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="list">Lista</SelectItem>
                          <SelectItem value="calendar">Calendario</SelectItem>
                          <SelectItem value="gantt">Gantt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button onClick={() => openModal()} className="flex items-center gap-2 whitespace-nowrap">
                      <Edit2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Nueva entrega</span>
                      <span className="sm:hidden">Nueva</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              {renderGanttView()}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      {renderActiveView()}
    </div>
  )
}
