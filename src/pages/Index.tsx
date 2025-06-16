
import { useState } from 'react';
import { CalendarComponent } from '@/components/CalendarComponent';
import { TimeboxPanel } from '@/components/TimeboxPanel';
import { HourlyCalendar } from '@/components/HourlyCalendar';
import { format } from 'date-fns';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Timebox Notes Organizer
          </h1>
          <p className="text-slate-600 text-lg">
            Plan your day with precision and take notes for every moment
          </p>
        </header>
        
        <ResizablePanelGroup direction="horizontal" className="max-w-7xl mx-auto">
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <div className="h-full space-y-6 pr-3">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Calendar
                </h2>
                <CalendarComponent 
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  Daily Overview
                </h2>
                <HourlyCalendar selectedDate={selectedDate} />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={65} minSize={50}>
            <div className="h-full pl-3">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 h-full">
                <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h2>
                <TimeboxPanel selectedDate={selectedDate} />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
