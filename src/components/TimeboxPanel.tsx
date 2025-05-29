
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Plus, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface TimeSlot {
  id: string;
  hour: number;
  task: string;
  notes: string;
}

interface TimeboxPanelProps {
  selectedDate: Date;
}

export const TimeboxPanel = ({ selectedDate }: TimeboxPanelProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Initialize time slots for the day (24 hours)
  useEffect(() => {
    const savedData = localStorage.getItem(`timebox-${dateKey}`);
    if (savedData) {
      setTimeSlots(JSON.parse(savedData));
    } else {
      const initialSlots: TimeSlot[] = [];
      for (let hour = 0; hour < 24; hour++) {
        initialSlots.push({
          id: `${dateKey}-${hour}`,
          hour,
          task: '',
          notes: ''
        });
      }
      setTimeSlots(initialSlots);
    }
  }, [dateKey]);

  // Save to localStorage whenever timeSlots change
  useEffect(() => {
    localStorage.setItem(`timebox-${dateKey}`, JSON.stringify(timeSlots));
  }, [timeSlots, dateKey]);

  const updateTimeSlot = (hour: number, task: string, notes: string) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.hour === hour 
        ? { ...slot, task, notes }
        : slot
    ));
    setEditingSlot(null);
    setNewTask('');
    setNewNotes('');
  };

  const deleteTimeSlot = (hour: number) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.hour === hour 
        ? { ...slot, task: '', notes: '' }
        : slot
    ));
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  };

  const startEditing = (slot: TimeSlot) => {
    setEditingSlot(slot.id);
    setNewTask(slot.task);
    setNewNotes(slot.notes);
  };

  return (
    <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
      {timeSlots.map((slot) => (
        <Card key={slot.id} className="transition-all duration-200 hover:shadow-md border-l-4 border-l-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-slate-700">
                  {formatHour(slot.hour)}
                </span>
              </div>
              
              {slot.task || slot.notes ? (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(slot)}
                    className="h-8 w-8 p-0 hover:bg-blue-50"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTimeSlot(slot.hour)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(slot)}
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              )}
            </div>

            {editingSlot === slot.id ? (
              <div className="space-y-3">
                <Input
                  placeholder="Add a task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="border-blue-200 focus:border-blue-400"
                />
                <Textarea
                  placeholder="Add notes..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  className="border-blue-200 focus:border-blue-400 resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateTimeSlot(slot.hour, newTask, newNotes)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingSlot(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {slot.task && (
                  <div className="bg-blue-50 p-2 rounded-md">
                    <span className="text-sm font-medium text-blue-800">
                      {slot.task}
                    </span>
                  </div>
                )}
                {slot.notes && (
                  <div className="bg-slate-50 p-2 rounded-md">
                    <span className="text-sm text-slate-600 whitespace-pre-wrap">
                      {slot.notes}
                    </span>
                  </div>
                )}
                {!slot.task && !slot.notes && (
                  <div className="text-slate-400 text-sm italic">
                    Click + to add tasks and notes
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
