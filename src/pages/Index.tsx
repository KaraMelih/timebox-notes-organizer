
import { useState } from 'react';
import { CalendarComponent } from '@/components/CalendarComponent';
import { TimeboxPanel } from '@/components/TimeboxPanel';
import { format } from 'date-fns';

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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
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
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            <TimeboxPanel selectedDate={selectedDate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
