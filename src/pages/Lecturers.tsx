import { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Mail, User, Building2, Search } from 'lucide-react';
import { Input } from '../components/ui/input';

interface Lecturer {
  id: string;
  name: string;
  email: string;
  department?: string;
  photoUrl?: string;
}

export default function Lecturers() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchLecturers() {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'lecturer'));
        const querySnapshot = await getDocs(q);
        const lecturersData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          name: doc.data().name,
          email: doc.data().email,
          department: doc.data().department || 'General',
          photoUrl: doc.data().photoUrl
        } as Lecturer));
        setLecturers(lecturersData);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
      } finally {
        setLoading(false);
      }
    }
    fetchLecturers();
  }, []);

  const filteredLecturers = lecturers.filter(lecturer => 
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lecturer.department && lecturer.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Lecturers Directory</h1>
          <p className="text-gray-500 mt-2">Find contact information for university faculty.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search by name or department..." 
            className="pl-9 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLecturers.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="bg-gray-50 p-4 rounded-full inline-block mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900">No lecturers found</p>
              <p className="text-gray-500 mt-1">Try adjusting your search terms.</p>
            </div>
          ) : (
            filteredLecturers.map((lecturer) => (
              <Card key={lecturer.id} className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 overflow-hidden bg-white">
                <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  {lecturer.photoUrl ? (
                    <img src={lecturer.photoUrl} alt={lecturer.name} className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-2xl shadow-md border-2 border-white group-hover:scale-105 transition-transform">
                      {lecturer.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg group-hover:text-blue-700 transition-colors">{lecturer.name}</CardTitle>
                    <p className="text-sm text-gray-500 capitalize flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3" />
                      {lecturer.department} Department
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <a href={`mailto:${lecturer.email}`} className="hover:text-blue-600 hover:underline transition-colors truncate">
                        {lecturer.email}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
