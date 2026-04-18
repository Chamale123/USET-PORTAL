import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  Archive,
  Search,
  Plus,
  Trash2,
  X,
  Download,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function PastPapers() {
  const { profile } = useAuth();
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [studyYear, setStudyYear] = useState('');
  const [semester, setSemester] = useState('');
  const [examType, setExamType] = useState('');
  const [fileData, setFileData] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const fetchPapers = async () => {
    try {
      const q = query(collection(db, 'pastPapers'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const papersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPapers(papersData);
    } catch (error) {
      console.error("Error fetching past papers:", error);
      toast.error("Failed to load past papers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      toast.error("File is too big. Please upload a file smaller than 800KB.");
      e.target.value = '';
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData) {
      toast.error('Please select a file to upload.');
      return;
    }

    try {
      await addDoc(collection(db, 'pastPapers'), {
        courseCode: courseCode.toUpperCase(),
        title,
        academicYear,
        studyYear,
        semester,
        examType,
        fileData,
        fileName,
        uploadedBy: profile?.name || 'Admin',
        createdAt: serverTimestamp()
      });
      toast.success("Past paper uploaded successfully!");
      setIsAdding(false);
      setCourseCode('');
      setTitle('');
      setAcademicYear('');
      setStudyYear('');
      setSemester('');
      setExamType('');
      setFileData('');
      setFileName('');
      fetchPapers();
    } catch (error: any) {
      console.error("Error adding past paper:", error);
      toast.error("Failed to upload past paper. It might be too large.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this past paper?")) {
      try {
        await deleteDoc(doc(db, 'pastPapers', id));
        toast.success("Past paper deleted");
        fetchPapers();
      } catch (error) {
        console.error("Error deleting paper:", error);
        toast.error("Failed to delete past paper");
      }
    }
  };

  const handleDownload = (dataUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPapers = papers.filter(p => 
    p.courseCode?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.academicYear?.includes(searchQuery) ||
    p.studyYear?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.examType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Archive className="w-8 h-8 text-blue-600" />
            Past Papers Archive
          </h1>
          <p className="text-gray-500 mt-2">Access and download past examination papers for your courses.</p>
        </div>
        {profile?.role === 'admin' && (
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Upload Past Paper
          </Button>
        )}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Upload Past Paper</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPaper} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input 
                  type="text" 
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                  placeholder="e.g., CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Title / Description</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g., Final Examination"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Study Level</label>
                  <select 
                    required
                    value={studyYear}
                    onChange={(e) => setStudyYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="">Select Level...</option>
                    <option value="Year 1">Year 1 (First Year)</option>
                    <option value="Year 2">Year 2 (Second Year)</option>
                    <option value="Year 3">Year 3 (Third Year)</option>
                    <option value="Year 4">Year 4 (Fourth Year)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select 
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="">Select Semester...</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                  <select 
                    required
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="">Select Type...</option>
                    <option value="Mid-Semester Exam">Mid-Semester Exam</option>
                    <option value="Final Semester Exam">Final Semester Exam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <input 
                    type="text" 
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g., 2023/2024"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File (PDF, max 800KB)</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  required
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Upload</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Papers</h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course code or title..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading past papers...</div>
        ) : filteredPapers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No past papers found</h3>
            <p className="text-gray-500">
              {profile?.role === 'admin' 
                ? "Upload the first past paper using the button above." 
                : "No past papers have been uploaded for your search yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPapers.map((paper) => (
              <div key={paper.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group bg-white flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700">
                    {paper.courseCode}
                  </span>
                  {profile?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(paper.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 line-clamp-2 pb-1">{paper.title}</h3>
                
                <div className="mt-2 space-y-1 mb-6 flex-grow">
                  <span className="inline-block px-2 py-1 bg-yellow-50 text-yellow-800 text-xs font-semibold rounded mb-2">
                    {paper.examType}
                  </span>
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="w-20 inline-block font-medium">Level:</span> 
                    <span className="text-gray-700">{paper.studyYear}</span>
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="w-20 inline-block font-medium">Semester:</span> 
                    <span className="text-gray-700">{paper.semester}</span>
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="w-20 inline-block font-medium">Year:</span> 
                    <span className="text-gray-700">{paper.academicYear}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                    Uploaded by {paper.uploadedBy}
                  </p>
                </div>

                <Button 
                  onClick={() => handleDownload(paper.fileData, paper.fileName || `${paper.courseCode}_${paper.academicYear}.pdf`)}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 mt-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Paper
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
