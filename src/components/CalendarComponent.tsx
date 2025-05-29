
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface CalendarComponentProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarComponent = ({ selectedDate, onDateSelect }: CalendarComponentProps) => {
  return (
    <div className="flex justify-center">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateSelect(date)}
        className={cn("rounded-lg border-0 shadow-none")}
        classNames={{
          months: "space-y-4",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center text-lg font-semibold",
          caption_label: "text-slate-700",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-blue-100 rounded-md transition-colors"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-slate-500 rounded-md w-9 font-medium text-sm text-center",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-blue-100 [&:has([aria-selected].day-outside)]:bg-blue-50/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
            "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
          ),
          day: cn(
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
          ),
          day_range_end: "day-range-end",
          day_selected: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600",
          day_today: "bg-blue-100 text-blue-700 font-semibold",
          day_outside: "text-slate-400 opacity-50 aria-selected:bg-blue-500/50 aria-selected:text-white",
          day_disabled: "text-slate-400 opacity-50 cursor-not-allowed",
          day_hidden: "invisible",
        }}
      />
    </div>
  );
};
