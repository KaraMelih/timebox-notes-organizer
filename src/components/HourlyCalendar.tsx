
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

interface HourlyCalendarProps {
  selectedDate: Date;
}

export const HourlyCalendar = ({ selectedDate }: HourlyCalendarProps) => {
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const getCurrentHour = () => {
    const now = new Date();
    const isToday = format(now, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    return isToday ? now.getHours() : -1;
  };

  const currentHour = getCurrentHour();

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
            hour === currentHour 
              ? 'bg-blue-100 text-blue-800 font-medium' 
              : 'hover:bg-slate-50 text-slate-600'
          }`}
        >
          <Clock className="w-3 h-3" />
          <span className="min-w-[50px]">{formatHour(hour)}</span>
        </div>
      ))}
    </div>
  );
};
