import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { GraduationCap, Award, FileText } from 'lucide-react';

interface Result {
  id: string;
  courseCode: string;
  grade: string;
  score: number;
  semester: string;
}

export default function Results() {
  const { user } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!user) return;
      try {
        const q = query(collection(db, 'results'), where('studentId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const resultsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Result));
        setResults(resultsData);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'results');
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [user]);

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
          <GraduationCap className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Academic Results</h1>
          <p className="text-gray-500 mt-1">View your grades and academic performance.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-emerald-100">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Award className="h-10 w-10 text-emerald-200" />
              <div>
                <div className="text-3xl font-bold">{results.length}</div>
                <p className="text-emerald-100 text-sm">Completed Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 shadow-md border-gray-200 overflow-hidden">
          <div className="h-1.5 w-full bg-emerald-500"></div>
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle>Transcript</CardTitle>
            <CardDescription>All recorded grades for your completed courses.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="hover:bg-gray-50">
                  <TableHead className="font-semibold">Semester</TableHead>
                  <TableHead className="font-semibold">Course Code</TableHead>
                  <TableHead className="font-semibold">Score</TableHead>
                  <TableHead className="text-right font-semibold">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-12">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-8 w-8 text-gray-300 mb-3" />
                        <p>No results found.</p>
                        <p className="text-sm mt-1">Results will appear here once published by your lecturers.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((result) => (
                    <TableRow key={result.id} className="hover:bg-emerald-50/50 transition-colors group">
                      <TableCell className="text-gray-600">{result.semester}</TableCell>
                      <TableCell className="font-medium text-emerald-900">{result.courseCode}</TableCell>
                      <TableCell>{result.score}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                          ${result.grade.startsWith('A') ? 'bg-green-100 text-green-800' : 
                            result.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' : 
                            result.grade.startsWith('C') ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {result.grade}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
