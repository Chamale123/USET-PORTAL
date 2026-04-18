import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Upload,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'applications' | 'results' | 'lecturers' | 'students' | 'courses'>('applications');

  if (profile?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
        <p className="text-gray-500 mt-2">Manage university operations, applications, results, and personnel.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'applications' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Applications</span>
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'results' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Results</span>
        </button>
        <button
          onClick={() => setActiveTab('lecturers')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'lecturers' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manage Lecturers</span>
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'students' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Manage Students</span>
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'courses' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manage Courses</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {activeTab === 'applications' && <ManageApplicationsTab />}
        {activeTab === 'results' && <UploadResultsTab />}
        {activeTab === 'lecturers' && <ManageLecturersTab />}
        {activeTab === 'students' && <ManageStudentsTab />}
        {activeTab === 'courses' && <ManageCoursesTab />}
      </div>
    </div>
  );
}

function ManageApplicationsTab() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      try {
        const querySnapshot = await getDocs(collection(db, 'applications'));
        const appsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort to show pending first, or by date
        appsData.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (b.status === 'pending' && a.status !== 'pending') return 1;
          return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
        });
        setApplications(appsData);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications.");
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'applications', id), { status: newStatus });
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      
      const app = selectedApp?.id === id ? selectedApp : applications.find(a => a.id === id);
      
      if (selectedApp?.id === id) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }

      const statusMap: Record<string, string> = {
        'under_review': 'Document Review',
        'selection': 'Selection Phase',
        'approved': 'Approved',
        'rejected': 'Rejected'
      };
      
      let emailBody = `Dear ${app?.applicantName},\n\n`;
      if (newStatus === 'under_review') {
        emailBody += `Your application for the ${app?.program} program is now undergoing Document Review.\nWe are verifying your records and will update you shortly.\n\n`;
      } else if (newStatus === 'selection') {
        emailBody += `Your application has passed document review and is now in the Selection phase.\nOur committee is carefully evaluating your profile.\n\n`;
      } else if (newStatus === 'approved') {
        emailBody += `Congratulations! Your application for the ${app?.program} program has been APPROVED.\nPlease log in to view next steps.\n\n`;
      } else if (newStatus === 'rejected') {
        emailBody += `After careful consideration, we regret to inform you we are unable to offer you admission at this time.\n\n`;
      }
      emailBody += `Best regards,\nUSET Admissions Office`;

      console.log(`\n=======================================\n[EMAIL SENT: ${app?.applicantEmail}]\nSubject: Update on your USET Application - ${statusMap[newStatus]}\n\n${emailBody}\n=======================================\n`);
      
      toast.success(`Application updated. Notification email formally dispatched to ${app?.applicantEmail}.`);
    } catch (error) {
       console.error(error);
       toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status || 'pending';
    if (s === 'approved') return 'bg-green-100 text-green-800';
    if (s === 'rejected') return 'bg-red-100 text-red-800';
    if (s === 'draft') return 'bg-gray-100 text-gray-800';
    if (s === 'under_review') return 'bg-blue-100 text-blue-800';
    if (s === 'selection') return 'bg-purple-100 text-purple-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const handleDocumentAction = async (docObj: any, action: 'view' | 'download') => {
    try {
      if (!docObj.value || docObj.value === 'Not provided') return;
      if (!docObj.id) {
        toast.info(action === 'view' ? `Viewing ${docObj.label}... (Simulation, file lacks data)` : `Downloading ${docObj.label}...`);
        return;
      }
      
      const { getDoc, doc } = await import('firebase/firestore');
      const fileDoc = await getDoc(doc(db, 'application_files', docObj.id));
      if (!fileDoc.exists()) {
        toast.error('File no longer exists securely');
        return;
      }
      const fileData = fileDoc.data()?.data;
      if (!fileData) {
        toast.error("File is corrupted or empty");
        return;
      }
      
      if (action === 'view') {
        const win = window.open();
        if (win) {
          win.document.write(`<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
        } else {
           toast.error("Popup blocked. Could not open viewer.");
        }
      } else {
        const link = document.createElement('a');
        link.href = fileData;
        link.download = docObj.value || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloaded ${docObj.value}`);
      }
    } catch (err) {
      toast.error(`Could not ${action} file`);
    }
  };

  if (selectedApp) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Button variant="outline" onClick={() => setSelectedApp(null)} className="mb-2">
            ← Back to Applications
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
             <Button 
               variant="outline"
               size="sm"
               disabled={selectedApp.status === 'under_review'}
               onClick={() => handleUpdateStatus(selectedApp.id, 'under_review')}
               className="border-blue-200 text-blue-700 hover:bg-blue-50"
             >
               Move to Document Review
             </Button>
             <Button 
               variant="outline"
               size="sm"
               disabled={selectedApp.status === 'selection'}
               onClick={() => handleUpdateStatus(selectedApp.id, 'selection')}
               className="border-purple-200 text-purple-700 hover:bg-purple-50"
             >
               Move to Selection
             </Button>
             <Button 
               variant={selectedApp.status === 'rejected' ? "secondary" : "destructive"}
               size="sm"
               disabled={selectedApp.status === 'rejected'}
               onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
             >
               Reject
             </Button>
             <Button 
               className="bg-green-600 hover:bg-green-700 text-white" 
               size="sm"
               disabled={selectedApp.status === 'approved'}
               onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
             >
               Approve
             </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Application Review: {selectedApp.id.slice(0, 8).toUpperCase()}</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold capitalize ${getStatusBadge(selectedApp.status)}`}>
              {selectedApp.status?.replace('_', ' ') || 'pending'}
            </span>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Applicant Information</h4>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-bold text-gray-900">{selectedApp.applicantName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">{selectedApp.applicantEmail || 'Not securely attached'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">{selectedApp.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="font-medium text-gray-900">{selectedApp.dateOfBirth || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="font-medium text-gray-900">{selectedApp.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nationality</p>
                    <p className="font-medium text-gray-900">{selectedApp.nationality || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{selectedApp.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Guardian Information</h4>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Guardian Name</p>
                    <p className="font-medium text-gray-900">{selectedApp.guardianName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Guardian Phone</p>
                    <p className="font-medium text-gray-900">{selectedApp.guardianPhone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Academic Details</h4>
                <div className="space-y-3 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                  <div>
                    <p className="text-xs text-gray-500">Program Applied For</p>
                    <p className="font-bold text-blue-900">{selectedApp.program || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Highest Qualification</p>
                    <p className="font-medium text-gray-900">{selectedApp.qualification || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Previous School Attended</p>
                    <p className="font-medium text-gray-900">{selectedApp.previousSchool || 'Not provided'} ({selectedApp.yearOfCompletion || 'N/A'})</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Uploaded Documents</h4>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  
                  {[{ label: 'Passport Photo', value: selectedApp.passportPhoto, id: selectedApp.passportPhotoId }, 
                    { label: 'Academic Transcript', value: selectedApp.transcriptFile, id: selectedApp.transcriptFileId }, 
                    { label: 'Academic Certificate', value: selectedApp.academicCertificateFile, id: selectedApp.academicCertificateId },
                    { label: 'Birth Certificate', value: selectedApp.birthCertificateFile, id: selectedApp.birthCertificateId }].map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                         <div className="p-2 bg-blue-50 text-blue-600 rounded-md shrink-0">
                           <FileText className="w-4 h-4" />
                         </div>
                         <div className="flex flex-col min-w-0">
                           <p className="text-sm font-medium text-gray-900 truncate">{doc.label}</p>
                           <p className="text-xs text-gray-500 truncate">{doc.value && doc.value !== 'Not provided' ? doc.value : 'Missing'}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={!doc.value || doc.value === 'Not provided'}
                          onClick={() => handleDocumentAction(doc, 'view')}
                          className="h-8 w-8 p-0"
                          title="View Document"
                        >
                          <ExternalLink className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={!doc.value || doc.value === 'Not provided'}
                          onClick={() => handleDocumentAction(doc, 'download')}
                          className="h-8 w-8 p-0"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Student Applications</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID or program..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">Applicant</th>
              <th className="px-6 py-3 font-medium text-gray-500">Program</th>
              <th className="px-6 py-3 font-medium text-gray-500">Date Applied</th>
              <th className="px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading applications...</td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No applications received yet.</td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{app.applicantName || 'Unknown Applicant'}</p>
                    <p className="text-xs text-gray-500 uppercase">{app.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{app.program}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {app.createdAt ? new Date(app.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(app.status)}`}>
                      {app.status?.replace('_', ' ') || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100"
                      onClick={() => setSelectedApp(app)}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UploadResultsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Upload Student Results</h2>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload CSV
        </Button>
      </div>
      
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Drag and drop result files here</h3>
        <p className="text-gray-500 mt-2 mb-6">Support for CSV and Excel files containing student IDs, course codes, and grades.</p>
        <Button variant="outline" className="bg-white">
          Browse Files
        </Button>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Uploads</h3>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500">File Name</th>
                <th className="px-6 py-3 font-medium text-gray-500">Date Uploaded</th>
                <th className="px-6 py-3 font-medium text-gray-500">Uploaded By</th>
                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-6 py-4 text-gray-900">MECH_101_Results_Fall2025.csv</td>
                <td className="px-6 py-4 text-gray-500">Oct 24, 2025</td>
                <td className="px-6 py-4 text-gray-500">Dr. Smith</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Processed
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-gray-900">ELEC_201_Results_Fall2025.csv</td>
                <td className="px-6 py-4 text-gray-500">Oct 23, 2025</td>
                <td className="px-6 py-4 text-gray-500">Prof. Johnson</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Processed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ManageLecturersTab() {
  const [isAdding, setIsAdding] = useState(false);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');

  const fetchLecturers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'lecturers'));
      const lecturersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLecturers(lecturersData);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
      toast.error("Failed to load lecturers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  const handleAddLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'lecturers'), {
        name,
        email,
        department,
        status: 'Active',
        createdAt: serverTimestamp()
      });
      toast.success("Lecturer added successfully!");
      setIsAdding(false);
      setName('');
      setEmail('');
      setDepartment('');
      fetchLecturers();
    } catch (error) {
      console.error("Error adding lecturer:", error);
      toast.error("Failed to add lecturer");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this lecturer?")) {
      try {
        await deleteDoc(doc(db, 'lecturers', id));
        toast.success("Lecturer removed");
        fetchLecturers();
      } catch (error) {
        console.error("Error deleting lecturer:", error);
        toast.error("Failed to remove lecturer");
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Add Lecturer Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Register New Lecturer</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddLecturer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Dr. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="jane.doe@uset.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select 
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="">Select Department</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Register Lecturer</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Lecturers Directory</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search lecturers..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Add Lecturer
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 font-medium text-gray-500">Department</th>
              <th className="px-6 py-3 font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading lecturers...</td>
              </tr>
            ) : lecturers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No lecturers registered yet.</td>
              </tr>
            ) : (
              lecturers.map((lecturer) => (
                <tr key={lecturer.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{lecturer.name}</td>
                  <td className="px-6 py-4 text-gray-500">{lecturer.department}</td>
                  <td className="px-6 py-4 text-gray-500">{lecturer.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {lecturer.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleDelete(lecturer.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ManageStudentsTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Student Directory</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">Student ID</th>
              <th className="px-6 py-3 font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 font-medium text-gray-500">Program</th>
              <th className="px-6 py-3 font-medium text-gray-500">Year</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { id: 'USET-2025-001', name: 'Alex Johnson', program: 'BSc Mechanical Engineering', year: 'Year 1' },
              { id: 'USET-2025-002', name: 'Maria Garcia', program: 'BSc Electrical Engineering', year: 'Year 2' },
              { id: 'USET-2025-003', name: 'James Smith', program: 'BSc Civil Engineering', year: 'Year 3' },
            ].map((student, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{student.id}</td>
                <td className="px-6 py-4 text-gray-900">{student.name}</td>
                <td className="px-6 py-4 text-gray-500">{student.program}</td>
                <td className="px-6 py-4 text-gray-500">{student.year}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100">
                      View Profile
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ManageCoursesTab() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [credits, setCredits] = useState('');
  const [department, setDepartment] = useState('');

  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'courses'), {
        courseCode,
        title,
        credits: parseInt(credits),
        department,
        createdAt: serverTimestamp()
      });
      toast.success("Course added successfully!");
      setIsAdding(false);
      setCourseCode('');
      setTitle('');
      setCredits('');
      setDepartment('');
      fetchCourses();
    } catch (error) {
      console.error("Error adding course:", error);
      toast.error("Failed to add course");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this course?")) {
      try {
        await deleteDoc(doc(db, 'courses', id));
        toast.success("Course removed");
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        toast.error("Failed to remove course");
      }
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Add Course Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Add New Course</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input 
                  type="text" 
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g., CS101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Introduction to Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                <input 
                  type="number" 
                  min="1"
                  max="10"
                  required
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select 
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="">Select Department</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Save Course</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Course Catalog</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">Course Code</th>
              <th className="px-6 py-3 font-medium text-gray-500">Course Title</th>
              <th className="px-6 py-3 font-medium text-gray-500">Credits</th>
              <th className="px-6 py-3 font-medium text-gray-500">Department</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading courses...</td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No courses available.</td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{course.courseCode}</td>
                  <td className="px-6 py-4 text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 text-gray-500">{course.credits}</td>
                  <td className="px-6 py-4 text-gray-500">{course.department}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleDelete(course.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
