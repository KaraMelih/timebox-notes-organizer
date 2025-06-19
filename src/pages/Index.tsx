
import { useState } from 'react';
import { CalendarComponent } from '@/components/CalendarComponent';
import { TimeboxPanel } from '@/components/TimeboxPanel';
import { HourlyCalendar } from '@/components/HourlyCalendar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { format } from 'date-fns';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useTheme } from '@/components/ThemeProvider';
import { useEffect } from "react"

interface TimeSlot {
  id: string;
  hour: number;
  task: string;
  notes: string;
  draggedItems: any[];
  completed?: boolean;
}

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const handleTimeSlotsChange = (newTimeSlots: TimeSlot[]) => {
    setTimeSlots(newTimeSlots);
  };

  const handleToggleComplete = (hour: number, itemId?: string) => {
    setTimeSlots(prevSlots => 
      prevSlots.map(slot => {
        if (slot.hour === hour) {
          if (itemId) {
            return {
              ...slot,
              draggedItems: slot.draggedItems.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              )
            };
          } else {
            return { ...slot, completed: !slot.completed };
          }
        }
        return slot;
      })
    );
  };

  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <div className="container mx-auto p-6">
        <header className="mb-8 text-center relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Timebox Notes Organizer
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Plan your day with precision and take notes for every moment
          </p>
        </header>
        <ResizablePanelGroup direction="horizontal" className="max-w-7xl mx-auto">
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <div className="h-full space-y-6 pr-3">
              <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 dark:bg-blue-300 rounded-full"></span>
                  Calendar
                </h2>
                <CalendarComponent 
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>
              
              <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full dark:bg-orange-300"></span>
                  Daily Overview
                </h2>
                <HourlyCalendar 
                  selectedDate={selectedDate} 
                  timeSlots={timeSlots}
                  onToggleComplete={handleToggleComplete}
                />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={65} minSize={50}>
            <div className="h-full pl-3">
              <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full dark:bg-green-300"></span>
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h2>
                <TimeboxPanel 
                  selectedDate={selectedDate} 
                  onTimeSlotsChange={handleTimeSlotsChange}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
