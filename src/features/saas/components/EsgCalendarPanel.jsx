import React from 'react';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const EsgCalendarPanel = (props) => {
  const {
    calendarEvents = {},
    selectedCalendarDay,
    setSelectedCalendarDay,
    showToast
  } = props;

  return (
      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-fg-primary">ESG Reporting Calendar</h2>
          <p className="text-sm text-fg-secondary mt-1 font-sans">Track verification schedules, third party audits, and offset purchases.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Calendar Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-sans font-bold text-sm text-fg-primary">June 2026</h3>
              <div className="flex items-center space-x-1 text-xs text-fg-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald inline-block"></span>
                <span>Audit Events</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold">
              {/* Days of week */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-fg-secondary py-1">{day}</div>
              ))}

              {/* Empty spaces for starting offset of June 2026 (Starts on Monday) */}
              <div className="border border-transparent p-3"></div>

              {/* Days of month */}
              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                const hasEvent = calendarEvents[day];
                const isSelected = selectedCalendarDay === day;
                return (
                  <Button
                    key={day}
                    variant="ghost"
                    size="sm"
                    onClick={() => hasEvent && setSelectedCalendarDay(day)}
                    disabled={!hasEvent}
                    className={`border rounded-xl !p-3 relative flex flex-col items-center justify-between font-mono font-bold aspect-square transition-all !min-h-0 !h-auto ${isSelected
                          ? '!bg-accent !border-accent !text-fg-inverse shadow-md'
                          : '!border-border-subtle hover:!bg-bg-muted !text-fg-primary'
                        } ${hasEvent ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                  >
                    <span>{day}</span>
                    {hasEvent && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500'}`}></span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Event details panel */}
          <div className="bg-bg-muted rounded-2xl p-6 border border-border-subtle space-y-4 h-fit">
            <h3 className="font-sans font-bold text-sm text-fg-primary border-b border-border-subtle pb-2">Event Schedule Details</h3>
            {selectedCalendarDay && calendarEvents[selectedCalendarDay] ? (
              <div className="space-y-3 font-sans text-xs">
                <div>
                  <span className="text-[10px] text-fg-secondary block font-mono">DATE</span>
                  <span className="font-bold text-fg-primary">June {selectedCalendarDay}, 2026</span>
                </div>
                <div>
                  <span className="text-[10px] text-fg-secondary block font-mono">AUDIT MISSION</span>
                  <span className="font-bold text-sm text-fg-primary block mt-0.5">{calendarEvents[selectedCalendarDay].title}</span>
                </div>
                <div>
                  <span className="text-[10px] text-fg-secondary block font-mono">ASSIGNED AUDITOR</span>
                  <span className="font-semibold text-emerald">{calendarEvents[selectedCalendarDay].auditor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-fg-secondary block font-mono">SCHEDULED TIME</span>
                  <span className="font-mono font-bold text-fg-primary">{calendarEvents[selectedCalendarDay].time}</span>
                </div>
                <Button
                  variant="primary"
                  onClick={() => showToast(`Report for "${calendarEvents[selectedCalendarDay].title}" requested.`, "success")}
                  className="w-full font-mono text-xs"
                >
                  Request Audit Dossier
                </Button>
              </div>
            ) : (
              <p className="text-xs text-fg-secondary">Click on any highlighted date in the calendar to view its ESG audit logs.</p>
            )}
          </div>

        </div>
      </div>
      );
};

      export default EsgCalendarPanel;
