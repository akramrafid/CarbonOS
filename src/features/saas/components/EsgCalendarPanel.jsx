import React from 'react';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

export const EsgCalendarPanel = (props) => {
  const {
    calendarEvents = {},
    selectedCalendarDay,
    setSelectedCalendarDay,
    showToast
  } = props;

  return (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
            <div>
              <h1 className="font-sans font-bold text-3xl text-[#0F291B]">ESG Reporting Calendar</h1>
              <p className="text-sm text-[#64748B] mt-1 font-sans">Track verification schedules, third party audits, and offset purchases.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Calendar Grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-sans font-bold text-sm text-[#0F291B]">June 2026</h3>
                  <div className="flex items-center space-x-1 text-xs text-[#64748B]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald inline-block"></span>
                    <span>Audit Events</span>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold">
                  {/* Days of week */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-[#94A3B8] py-1">{day}</div>
                  ))}
                  
                  {/* Empty spaces for starting offset of June 2026 (Starts on Monday) */}
                  <div className="border border-transparent p-3"></div>
                  
                  {/* Days of month */}
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                    const hasEvent = calendarEvents[day];
                    const isSelected = selectedCalendarDay === day;
                    return (
                      <button
                        key={day}
                        onClick={() => hasEvent && setSelectedCalendarDay(day)}
                        className={`border rounded-xl p-3 relative flex flex-col items-center justify-between font-mono font-bold aspect-square transition-all ${
                          isSelected 
                            ? 'bg-[#0F291B] border-[#0F291B] text-white shadow-md' 
                            : 'border-[#F1F5F9] hover:bg-[#F8F9FA] text-[#1E293B]'
                        } ${hasEvent ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                      >
                        <span>{day}</span>
                        {hasEvent && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#4ADE80]' : 'bg-[#10B981]'}`}></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Event details panel */}
              <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-[#E2E8F0] space-y-4 h-fit">
                <h3 className="font-sans font-bold text-sm text-[#0F291B] border-b border-[#E2E8F0] pb-2">Event Schedule Details</h3>
                {selectedCalendarDay && calendarEvents[selectedCalendarDay] ? (
                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-mono">DATE</span>
                      <span className="font-bold text-[#0F291B]">June {selectedCalendarDay}, 2026</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-mono">AUDIT MISSION</span>
                      <span className="font-bold text-sm text-[#0F291B] block mt-0.5">{calendarEvents[selectedCalendarDay].title}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-mono">ASSIGNED AUDITOR</span>
                      <span className="font-semibold text-emerald">{calendarEvents[selectedCalendarDay].auditor}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-mono">SCHEDULED TIME</span>
                      <span className="font-mono font-bold text-[#1E293B]">{calendarEvents[selectedCalendarDay].time}</span>
                    </div>
                    <button 
                      onClick={() => showToast(`Report for "${calendarEvents[selectedCalendarDay].title}" requested.`, "success")}
                      className="w-full bg-[#00C853] hover:bg-[#00E676] text-white font-mono font-bold text-xs py-2 px-3 rounded-lg transition-all shadow-sm block text-center cursor-pointer"
                    >
                      Request Audit Dossier
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-[#64748B]">Click on any highlighted date in the calendar to view its ESG audit logs.</p>
                )}
              </div>

            </div>
          </div>
  );
};

export default EsgCalendarPanel;
