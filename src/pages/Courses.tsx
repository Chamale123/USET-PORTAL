import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, where, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { BookOpen, CheckCircle2, XCircle } from 'lucide-react';

interface Course {
  id: string;
  courseCode: string;
  title: string;
  credits: number;
  department: string;
}

interface Registration {
  id: string;
  courseId: string;
}

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        // Fetch all available courses
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(coursesData);

        // Fetch student's registrations
        const regQuery = query(collection(db, 'registrations'), where('studentId', '==', user.uid), where('status', '==', 'registered'));
        const regSnapshot = await getDocs(regQuery);
        const regData = regSnapshot.docs.map(doc => ({ id: doc.id, courseId: doc.data().courseId } as Registration));
        setRegistrations(regData);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'courses/registrations');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleRegister = async (courseId: string) => {
    if (!user) return;
    try {
      const newReg = {
        studentId: user.uid,
        courseId,
        semester: 'Fall 2026',
        status: 'registered',
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'registrations'), newReg);
      setRegistrations([...registrations, { id: docRef.id, courseId }]);
      toast.success('Successfully registered for course!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
      toast.error('Failed to register for course.');
    }
  };

  const handleDrop = async (registrationId: string, courseId: string) => {
    try {
      await deleteDoc(doc(db, 'registrations', registrationId));
      setRegistrations(registrations.filter(r => r.id !== registrationId));
      toast.success('Course dropped successfully.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `registrations/${registrationId}`);
      toast.error('Failed to drop course.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 p-3 rounded-xl">
          <BookOpen className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Course Registration</h1>
          <p className="text-gray-500 mt-1">Register for your classes for the upcoming semester.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-100">Semester Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">{registrations.length}</div>
            <p className="text-blue-100 text-sm">Registered Courses</p>
            <div className="mt-6 pt-6 border-t border-blue-500/30">
              <p className="text-sm text-blue-200">Term</p>
              <p className="font-semibold">Fall 2026</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 shadow-md border-gray-200 overflow-hidden">
          <div className="h-1.5 w-full bg-blue-500"></div>
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>Select courses to add to your schedule.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-gray-50">
                  <TableHead className="w-[100px] font-semibold">Code</TableHead>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Credits</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="text-right font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                      <div className="flex flex-col items-center justify-center">
                        <BookOpen className="h-8 w-8 text-gray-300 mb-3" />
                        <p>No courses available at the moment.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => {
                    const registration = registrations.find(r => r.courseId === course.id);
                    const isRegistered = !!registration;

                    return (
                      <TableRow key={course.id} className="hover:bg-blue-50/50 transition-colors group">
                        <TableCell className="font-medium text-blue-900">{course.courseCode}</TableCell>
                        <TableCell className="font-medium text-gray-900">{course.title}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {course.credits} cr
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600">{course.department}</TableCell>
                        <TableCell className="text-right">
                          {isRegistered ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all"
                              onClick={() => handleDrop(registration.id, course.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1.5" />
                              Drop
                            </Button>
                          ) : (
                            <Button 
                              variant="default" 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 shadow-sm transition-all group-hover:shadow-md"
                              onClick={() => handleRegister(course.id)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              Register
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
