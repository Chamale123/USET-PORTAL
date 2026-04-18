import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { Calendar, Clock, MapPin, User, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  code: string;
  title: string;
  room: string;
  lecturer: string;
  order: number;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function Timetable() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'timetable'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TimetableEntry[];
      setEntries(fetchedEntries);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'timetable');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddEntry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const day = formData.get('day') as string;
    const time = formData.get('time') as string;
    const code = formData.get('code') as string;
    const title = formData.get('title') as string;
    const room = formData.get('room') as string;
    const lecturer = formData.get('lecturer') as string;

    const dayOrder = DAYS.indexOf(day);
    const order = dayOrder * 1000 + parseInt(time.replace(/[^0-9]/g, ''));

    try {
      await addDoc(collection(db, 'timetable'), {
        day, time, code, title, room, lecturer, order
      });
      toast.success('Timetable entry added successfully');
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'timetable');
      toast.error('Failed to add entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await deleteDoc(doc(db, 'timetable', id));
      toast.success('Entry deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `timetable/${id}`);
      toast.error('Failed to delete entry');
    }
  };

  if (profile?.role === 'applicant') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Available</h2>
        <p className="text-gray-600">Timetables are only available for admitted students and staff.</p>
      </div>
    );
  }

  // Group entries by day
  const scheduleByDay = DAYS.map(day => ({
    day,
    courses: entries.filter(e => e.day === day)
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Timetable</h1>
          <p className="text-gray-600 mt-1">View your weekly class schedule</p>
        </div>
        {profile?.role === 'admin' && (
          <Button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 hover:bg-blue-700">
            {isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Class</>}
          </Button>
        )}
      </div>

      {isAdding && profile?.role === 'admin' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-bold mb-4">Add New Class</h2>
          <form onSubmit={handleAddEntry} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Day</Label>
              <Select name="day" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time (e.g., 08:00 AM - 10:00 AM)</Label>
              <Input name="time" required placeholder="08:00 AM - 10:00 AM" />
            </div>
            <div className="space-y-2">
              <Label>Course Code</Label>
              <Input name="code" required placeholder="CS101" />
            </div>
            <div className="space-y-2">
              <Label>Course Title</Label>
              <Input name="title" required placeholder="Introduction to Computer Science" />
            </div>
            <div className="space-y-2">
              <Label>Room</Label>
              <Input name="room" required placeholder="Room A1" />
            </div>
            <div className="space-y-2">
              <Label>Lecturer</Label>
              <Input name="lecturer" required placeholder="Dr. Smith" />
            </div>
            <div className="md:col-span-2 pt-2">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save Class</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {scheduleByDay.map((daySchedule, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
                <h2 className="text-lg font-bold text-blue-900">{daySchedule.day}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {daySchedule.courses.length > 0 ? (
                  daySchedule.courses.map((course) => (
                    <div key={course.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50 transition-colors group">
                      <div className="md:w-48 flex-shrink-0">
                        <div className="flex items-center text-blue-700 font-semibold">
                          <Clock className="w-4 h-4 mr-2" />
                          {course.time}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                            {course.code}
                          </span>
                          <h3 className="font-bold text-gray-900">{course.title}</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            {course.room}
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1 text-gray-400" />
                            {course.lecturer}
                          </div>
                        </div>
                      </div>
                      {profile?.role === 'admin' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-100" onClick={() => handleDelete(course.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-gray-500 italic">No classes scheduled</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
