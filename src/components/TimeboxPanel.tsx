
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Plus, Edit3, Trash2, Brain, Sparkles, Target, ListPlus, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

interface PriorityItem extends ProcessedItem {
  priority: number;
}

interface DayData {
  brainDump: string;
  processedItems: ProcessedItem[];
  priorities: PriorityItem[];
  timeSlots: TimeSlot[];
}

interface TimeboxPanelProps {
  selectedDate: Date;
  onTimeSlotsChange?: (timeSlots: TimeSlot[]) => void;
}

export const TimeboxPanel = ({ selectedDate, onTimeSlotsChange }: TimeboxPanelProps) => {
  const [dayData, setDayData] = useState<DayData>({
    brainDump: '',
    processedItems: [],
    priorities: [],
    timeSlots: []
  });
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [newItemText, setNewItemText] = useState('');
  
  // Collapsible states
  const [showBrainDump, setShowBrainDump] = useState(true);
  const [showProcessedItems, setShowProcessedItems] = useState(true);
  const [showPriorities, setShowPriorities] = useState(true);

  const dateKey = format(selectedDate, 'yyyy-MM-dd');

  // Initialize data for the day
  useEffect(() => {
    const savedData = localStorage.getItem(`timebox-${dateKey}`);
    if (savedData) {
      setDayData(JSON.parse(savedData));
    } else {
      const initialSlots: TimeSlot[] = [];
      for (let hour = 0; hour < 24; hour++) {
        initialSlots.push({
          id: `${dateKey}-${hour}`,
          hour,
          task: '',
          notes: '',
          draggedItems: [],
          completed: false
        });
      }
      setDayData({
        brainDump: '',
        processedItems: [],
        priorities: [],
        timeSlots: initialSlots
      });
    }
  }, [dateKey]);

  // Save to localStorage whenever dayData changes
  useEffect(() => {
    localStorage.setItem(`timebox-${dateKey}`, JSON.stringify(dayData));
  }, [dayData, dateKey]);

  // Notify parent component when timeSlots change
  useEffect(() => {
    if (onTimeSlotsChange) {
      onTimeSlotsChange(dayData.timeSlots);
    }
  }, [dayData.timeSlots, onTimeSlotsChange]);

  const processBrainDump = async () => {
    if (!dayData.brainDump.trim()) return;
    
    if (!apiKey) {
      // Manual processing - just split by lines and create items
      const lines = dayData.brainDump.split('\n').filter(line => line.trim());
      const processedItems: ProcessedItem[] = lines.map((line, index) => ({
        id: `processed-${Date.now()}-${index}`,
        text: line.trim(),
        category: 'General'
      }));

      setDayData(prev => ({
        ...prev,
        processedItems
      }));
      return;
    }

    // AI processing with OpenAI
    setIsProcessing(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a productivity assistant. Take the user\'s brain dump and organize it into clear, actionable items. Return a JSON array of objects with "id", "text", and "category" fields. Keep items concise and actionable.'
            },
            {
              role: 'user',
              content: `Please organize this brain dump into actionable items: ${dayData.brainDump}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) throw new Error('Failed to process brain dump');

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const items = JSON.parse(content);
        const processedItems: ProcessedItem[] = items.map((item: any, index: number) => ({
          id: `processed-${Date.now()}-${index}`,
          text: item.text || item,
          category: item.category || 'General'
        }));

        setDayData(prev => ({
          ...prev,
          processedItems
        }));
      } catch (parseError) {
        // Fallback: split by lines if JSON parsing fails
        const lines = content.split('\n').filter(line => line.trim());
        const processedItems: ProcessedItem[] = lines.map((line, index) => ({
          id: `processed-${Date.now()}-${index}`,
          text: line.replace(/^[-*•]\s*/, '').trim(),
          category: 'General'
        }));

        setDayData(prev => ({
          ...prev,
          processedItems
        }));
      }
    } catch (error) {
      console.error('Error processing brain dump:', error);
      alert('Failed to process brain dump. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addManualItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ProcessedItem = {
      id: `manual-${Date.now()}`,
      text: newItemText.trim(),
      category: 'Manual'
    };

    setDayData(prev => ({
      ...prev,
      processedItems: [...prev.processedItems, newItem]
    }));
    
    setNewItemText('');
  };

  const toggleTaskComplete = (hour: number, itemId?: string) => {
    setDayData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map(slot => {
        if (slot.hour === hour) {
          if (itemId) {
            // Toggle completion for dragged item
            return {
              ...slot,
              draggedItems: slot.draggedItems.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              )
            };
          } else {
            // Toggle completion for main task
            return { ...slot, completed: !slot.completed };
          }
        }
        return slot;
      })
    }));
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    const sourceId = source.droppableId;
    const destId = destination.droppableId;

    // Handle drag from processed items to priorities
    if (sourceId === 'processed-items' && destId === 'priorities') {
      if (dayData.priorities.length >= 3) {
        alert('You can only have 3 priorities!');
        return;
      }

      const item = dayData.processedItems.find(item => item.id === draggableId);
      if (item) {
        const priorityItem: PriorityItem = { ...item, priority: dayData.priorities.length + 1 };
        setDayData(prev => ({
          ...prev,
          priorities: [...prev.priorities, priorityItem],
          processedItems: prev.processedItems.filter(item => item.id !== draggableId)
        }));
      }
    }

    // Handle drag from priorities to time slots
    if (sourceId === 'priorities' && destId.startsWith('slot-')) {
      const hour = parseInt(destId.replace('slot-', ''));
      const item = dayData.priorities.find(item => item.id === draggableId);
      if (item) {
        setDayData(prev => ({
          ...prev,
          priorities: prev.priorities.filter(item => item.id !== draggableId),
          timeSlots: prev.timeSlots.map(slot =>
            slot.hour === hour
              ? { ...slot, draggedItems: [...slot.draggedItems, item] }
              : slot
          )
        }));
      }
    }

    // Handle drag from processed items to time slots
    if (sourceId === 'processed-items' && destId.startsWith('slot-')) {
      const hour = parseInt(destId.replace('slot-', ''));
      const item = dayData.processedItems.find(item => item.id === draggableId);
      if (item) {
        setDayData(prev => ({
          ...prev,
          processedItems: prev.processedItems.filter(item => item.id !== draggableId),
          timeSlots: prev.timeSlots.map(slot =>
            slot.hour === hour
              ? { ...slot, draggedItems: [...slot.draggedItems, item] }
              : slot
          )
        }));
      }
    }
  };

  const updateTimeSlot = (hour: number, task: string, notes: string) => {
    setDayData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map(slot => 
        slot.hour === hour 
          ? { ...slot, task, notes }
          : slot
      )
    }));
    setEditingSlot(null);
    setNewTask('');
    setNewNotes('');
  };

  const deleteTimeSlot = (hour: number) => {
    setDayData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map(slot => 
        slot.hour === hour 
          ? { ...slot, task: '', notes: '', draggedItems: [] }
          : slot
      )
    }));
  };

  const removePriority = (id: string) => {
    const item = dayData.priorities.find(p => p.id === id);
    if (item) {
      setDayData(prev => ({
        ...prev,
        priorities: prev.priorities.filter(p => p.id !== id),
        processedItems: [...prev.processedItems, item]
      }));
    }
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
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* API Key Input - only show if no key is set */}
        {!apiKey && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-800">
                  OpenAI API Key (optional - for AI organization):
                </label>
                <Input
                  type="password"
                  placeholder="sk-... (leave empty for manual organization)"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="border-amber-300"
                />
                <p className="text-xs text-amber-700">
                  With API key: AI will organize your brain dump. Without: Manual line-by-line processing.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Brain Dump Section - Collapsible */}
        <Collapsible open={showBrainDump} onOpenChange={setShowBrainDump}>
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-purple-800">Brain Dump</h3>
                  </div>
                  {showBrainDump ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-purple-800">Brain Dump</h3>
                </div>
                <Textarea
                  placeholder="Dump all your thoughts, ideas, and tasks here... (each line will become an item)"
                  value={dayData.brainDump}
                  onChange={(e) => setDayData(prev => ({ ...prev, brainDump: e.target.value }))}
                  rows={4}
                  className="border-purple-200 focus:border-purple-400 mb-4"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={processBrainDump}
                    disabled={!dayData.brainDump.trim() || isProcessing}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {apiKey ? <Sparkles className="w-4 h-4 mr-2" /> : <ListPlus className="w-4 h-4 mr-2" />}
                    {isProcessing ? 'Processing...' : apiKey ? 'Organize with AI' : 'Create Items'}
                  </Button>
                </div>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>

        {/* Manual Item Addition */}
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add individual item..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addManualItem()}
                className="flex-1"
              />
              <Button onClick={addManualItem} disabled={!newItemText.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Processed Items - Collapsible */}
        {dayData.processedItems.length > 0 && (
          <Collapsible open={showProcessedItems} onOpenChange={setShowProcessedItems}>
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto mb-4">
                    <h3 className="text-lg font-semibold text-blue-800">Organized Items</h3>
                    {showProcessedItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Organized Items</h3>
                  <Droppable droppableId="processed-items">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {dayData.processedItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 bg-blue-50 rounded-lg border cursor-move transition-all ${
                                  snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                }`}
                              >
                                <span className="text-sm font-medium">{item.text}</span>
                                {item.category && (
                                  <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CollapsibleContent>
              </CardContent>
            </Card>
          </Collapsible>
        )}

        {/* Top 3 Priorities - Collapsible */}
        <Collapsible open={showPriorities} onOpenChange={setShowPriorities}>
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="p-6">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-semibold text-amber-800">Top 3 Priorities</h3>
                  </div>
                  {showPriorities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-amber-800">Top 3 Priorities</h3>
                </div>
                <Droppable droppableId="priorities">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 min-h-[100px]">
                      {dayData.priorities.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-amber-100 rounded-lg border-2 border-amber-300 cursor-move transition-all flex items-center justify-between ${
                                snapshot.isDragging ? 'shadow-lg rotate-1' : ''
                              }`}
                            >
                              <span className="text-sm font-medium">{item.text}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePriority(item.id)}
                                className="h-6 w-6 p-0 hover:bg-amber-200"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {dayData.priorities.length === 0 && (
                        <div className="text-amber-600 text-sm italic p-4 text-center border-2 border-dashed border-amber-300 rounded-lg">
                          Drag your most important items here (max 3)
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>

        {/* Hourly Schedule */}
        <div className="space-y-4">
          {dayData.timeSlots.map((slot) => {
            const hasContent = slot.task || slot.notes || slot.draggedItems.length > 0;
            
            return (
              <Card key={slot.id} className={`transition-all duration-200 hover:shadow-md border-l-4 border-l-blue-200 ${!hasContent ? 'py-2' : ''}`}>
                <CardContent className={hasContent ? "p-4" : "p-2"}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-slate-700">
                        {formatHour(slot.hour)}
                      </span>
                    </div>
                    
                    {hasContent ? (
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

                  <Droppable droppableId={`slot-${slot.hour}`}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`${hasContent ? 'min-h-[40px]' : 'min-h-[20px]'} rounded-lg transition-colors ${
                          snapshot.isDraggingOver ? 'bg-blue-100 border-2 border-dashed border-blue-300' : ''
                        }`}
                      >
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
                              <div className="bg-blue-50 p-2 rounded-md flex items-center justify-between">
                                <span className={`text-sm font-medium ${slot.completed ? 'line-through text-slate-400' : 'text-blue-800'}`}>
                                  {slot.task}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTaskComplete(slot.hour)}
                                  className="h-6 w-6 p-0 hover:bg-green-100"
                                >
                                  <Check className={`w-4 h-4 ${slot.completed ? 'text-green-600' : 'text-slate-400'}`} />
                                </Button>
                              </div>
                            )}
                            {slot.notes && (
                              <div className="bg-slate-50 p-2 rounded-md">
                                <span className="text-sm text-slate-600 whitespace-pre-wrap">
                                  {slot.notes}
                                </span>
                              </div>
                            )}
                            {slot.draggedItems.map((item) => (
                              <div key={item.id} className="bg-green-50 border border-green-200 p-2 rounded-md flex items-center justify-between">
                                <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-green-800'}`}>
                                  {item.text}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleTaskComplete(slot.hour, item.id)}
                                  className="h-6 w-6 p-0 hover:bg-green-100"
                                >
                                  <Check className={`w-4 h-4 ${item.completed ? 'text-green-600' : 'text-slate-400'}`} />
                                </Button>
                              </div>
                            ))}
                            {!hasContent && !snapshot.isDraggingOver && (
                              <div className="text-slate-400 text-xs italic">
                                Click + to add tasks or drag items here
                              </div>
                            )}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
};
