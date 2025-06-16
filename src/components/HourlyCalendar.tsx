
import { format } from 'date-fns';
import { Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimeSlot {
  id: string;
  hour: number;
  task: string;
  notes: string;
  draggedItems: ProcessedItem[];
  completed?: boolean;
}

interface ProcessedItem {
  id: string;
  text: string;
  category?: string;
  completed?: boolean;
}

interface HourlyCalendarProps {
  selectedDate: Date;
  timeSlots: TimeSlot[];
  onToggleComplete: (hour: number, itemId?: string) => void;
}

export const HourlyCalendar = ({ selectedDate, timeSlots, onToggleComplete }: HourlyCalendarProps) => {
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

  // Filter slots to show only those with tasks or current hour
  const visibleSlots = timeSlots.filter(slot => 
    slot.task || slot.notes || slot.draggedItems.length > 0 || slot.hour === currentHour
  );

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {visibleSlots.map((slot) => {
        const hasContent = slot.task || slot.notes || slot.draggedItems.length > 0;
        
        return (
          <div
            key={slot.hour}
            className={`flex items-start gap-2 p-2 rounded-md text-sm transition-colors ${
              slot.hour === currentHour 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : hasContent
                ? 'bg-slate-50'
                : 'hover:bg-slate-50 text-slate-600'
            } ${!hasContent ? 'py-1' : ''}`}
          >
            <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium">{formatHour(slot.hour)}</span>
              
              {slot.task && (
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-xs ${slot.completed ? 'line-through text-slate-400' : 'text-blue-700'}`}>
                    {slot.task}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-green-100"
                    onClick={() => onToggleComplete(slot.hour)}
                  >
                    <Check className={`w-3 h-3 ${slot.completed ? 'text-green-600' : 'text-slate-400'}`} />
                  </Button>
                </div>
              )}
              
              {slot.draggedItems.map((item) => (
                <div key={item.id} className="mt-1 flex items-center gap-2">
                  <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-green-700'}`}>
                    {item.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-green-100"
                    onClick={() => onToggleComplete(slot.hour, item.id)}
                  >
                    <Check className={`w-3 h-3 ${item.completed ? 'text-green-600' : 'text-slate-400'}`} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {visibleSlots.length === 0 && (
        <div className="text-slate-400 text-sm italic p-4 text-center">
          No tasks scheduled for today
        </div>
      )}
    </div>
  );
};
