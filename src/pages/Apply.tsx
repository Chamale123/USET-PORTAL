import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { FileText, CheckCircle2, Clock, XCircle, GraduationCap, User, MapPin, Phone, Calendar, BookOpen, Building2, Award, Users, FileUp } from 'lucide-react';

export default function Apply() {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [editingDraft, setEditingDraft] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        // Fetch User Applications
        const q = query(collection(db, 'applications'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const appsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApplications(appsData);
        
        if (appsData.length === 0) {
          setActiveView('form');
        }

        // Fetch Courses
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(coursesData);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'applications/courses');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const nativeEvent = e.nativeEvent as SubmitEvent;
    const submitter = nativeEvent.submitter as HTMLButtonElement | null;
    const isDraft = submitter?.value === 'draft';

    if (!isDraft) {
      const confirmSubmit = window.confirm("Are you sure all information entered is correct? Applications cannot be edited after submission.");
      if (!confirmSubmit) return;
    }

    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const program = formData.get('program') as string;
    const previousSchool = formData.get('previousSchool') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const address = formData.get('address') as string;
    const qualification = formData.get('qualification') as string;
    const gender = formData.get('gender') as string;
    const nationality = formData.get('nationality') as string;
    const guardianName = formData.get('guardianName') as string;
    const guardianPhone = formData.get('guardianPhone') as string;
    const yearOfCompletion = formData.get('yearOfCompletion') as string;
    
    // File uploads (simulate saving file name)
    const passportPhotoObj = formData.get('passportPhoto') as File;
    const transcriptFileObj = formData.get('transcriptFile') as File;
    const birthCertificateFileObj = formData.get('birthCertificateFile') as File;
    const academicCertificateFileObj = formData.get('academicCertificateFile') as File;
    
    try {
      const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const uploadFileIfPresent = async (fileObj: File, existingName: string, existingId: string) => {
        if (!fileObj || fileObj.size === 0) return { name: existingName, id: existingId };
        if (fileObj.size > 800 * 1024) {
          throw new Error(`File ${fileObj.name} exceeds prototype size limit of 800KB.`);
        }
        const data = await readFileAsBase64(fileObj);
        const fileDoc = await addDoc(collection(db, 'application_files'), { name: fileObj.name, type: fileObj.type, data });
        return { name: fileObj.name, id: fileDoc.id };
      };

      const passportData = await uploadFileIfPresent(passportPhotoObj, editingDraft?.passportPhoto || 'Not provided', editingDraft?.passportPhotoId || null);
      const transcriptData = await uploadFileIfPresent(transcriptFileObj, editingDraft?.transcriptFile || 'Not provided', editingDraft?.transcriptFileId || null);
      const birthData = await uploadFileIfPresent(birthCertificateFileObj, editingDraft?.birthCertificateFile || 'Not provided', editingDraft?.birthCertificateId || null);
      const academicData = await uploadFileIfPresent(academicCertificateFileObj, editingDraft?.academicCertificateFile || 'Not provided', editingDraft?.academicCertificateId || null);

      const newApp = {
        userId: user.uid,
        applicantName: profile?.name || user.displayName || 'Unknown',
        applicantEmail: user.email || 'Unknown',
        program,
        previousSchool,
        phoneNumber,
        dateOfBirth,
        address,
        qualification,
        gender,
        nationality,
        guardianName,
        guardianPhone,
        yearOfCompletion,
        passportPhoto: passportData.name,
        passportPhotoId: passportData.id,
        transcriptFile: transcriptData.name,
        transcriptFileId: transcriptData.id,
        birthCertificateFile: birthData.name,
        birthCertificateId: birthData.id,
        academicCertificateFile: academicData.name,
        academicCertificateId: academicData.id,
        status: isDraft ? 'draft' : 'submitted',
        updatedAt: serverTimestamp(),
      };

      if (editingDraft) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'applications', editingDraft.id);
        await updateDoc(docRef, newApp);
        
        setApplications(prev => prev.map(a => a.id === editingDraft.id ? { ...a, ...newApp } : a));
        toast.success(isDraft ? 'Draft updated successfully!' : 'Application submitted successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'applications'), {
          ...newApp,
          createdAt: serverTimestamp()
        });
        setApplications(prev => [{ id: docRef.id, ...newApp, createdAt: new Date() }, ...prev]);
        toast.success(isDraft ? 'Draft saved successfully!' : 'Application submitted successfully!');
      }
      
      setActiveView('list');
      setEditingDraft(null);
    } catch (error) {
      handleFirestoreError(error, editingDraft ? OperationType.UPDATE : OperationType.CREATE, 'applications');
      toast.error('Failed to save application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (activeView === 'list' && applications.length > 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Applications</h1>
              <p className="text-gray-500 mt-1">Manage and track the status of your USET applications.</p>
            </div>
          </div>
          <Button onClick={() => { setActiveView('form'); setEditingDraft(null); }} className="bg-blue-600 hover:bg-blue-700">
            Apply
          </Button>
        </div>

        {applications.map((app) => (
          <Card key={app.id} className="border-none shadow-xl overflow-hidden bg-white mb-8">
            <div className={`h-2 w-full ${
              app.status === 'draft' ? 'bg-gray-400' :
              app.status === 'submitted' || app.status === 'pending' ? 'bg-blue-400' : 
              app.status === 'under_review' ? 'bg-indigo-400' :
              app.status === 'selection' ? 'bg-purple-400' :
              app.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            
            <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl">{app.program || 'Draft Application'}</CardTitle>
                  <CardDescription className="mt-1">
                    {app.status === 'draft' ? 'Last modified' : 'Submitted on'} {app.updatedAt?.toDate?.().toLocaleDateString() || app.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {['draft', 'submitted', 'pending'].includes(app.status) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this application?')) {
                          try {
                            const { deleteDoc, doc } = await import('firebase/firestore');
                            await deleteDoc(doc(db, 'applications', app.id));
                            setApplications(prev => prev.filter(a => a.id !== app.id));
                            toast.success("Application deleted");
                          } catch (e) {
                            toast.error("Failed to delete");
                          }
                        }
                      }} 
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  )}
                  {['draft', 'submitted', 'pending'].includes(app.status) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setEditingDraft(app);
                        setActiveView('form');
                      }} 
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Edit Application
                    </Button>
                  )}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold capitalize shadow-sm border
                    ${app.status === 'draft' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                      app.status === 'submitted' || app.status === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      app.status === 'under_review' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                      app.status === 'selection' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                      app.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                      'bg-red-50 text-red-700 border-red-200'}`}>
                    {app.status === 'draft' && <FileText className="h-4 w-4" />}
                    {(app.status === 'submitted' || app.status === 'pending' || app.status === 'under_review' || app.status === 'selection') && <Clock className="h-4 w-4" />}
                    {app.status === 'approved' && <CheckCircle2 className="h-4 w-4" />}
                    {app.status === 'rejected' && <XCircle className="h-4 w-4" />}
                    {app.status?.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {app.status !== 'draft' && (
                <div className="bg-gray-50/50 p-6 sm:px-8 border-b border-gray-100">
                  <h3 className="text-sm font-bold tracking-tight text-gray-900 mb-4 uppercase">Application Progress</h3>
                  <div className="relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-gray-200 rounded-full"></div>
                    <div 
                      className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out
                        ${app.status === 'rejected' ? 'bg-red-500' : 'bg-blue-600'}`
                      }
                      style={{ 
                        width: app.status === 'submitted' || app.status === 'pending' ? '25%' :
                               app.status === 'under_review' ? '50%' :
                               app.status === 'selection' ? '75%' :
                               app.status === 'approved' || app.status === 'rejected' ? '100%' : '0%'
                      }}
                    ></div>
                    <div className="relative flex justify-between">
                       {/* Step 1: Submitted */}
                       <div className="flex flex-col items-center">
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 transition-colors ${
                             ['submitted', 'pending', 'under_review', 'selection', 'approved', 'rejected'].includes(app.status) 
                             ? 'bg-blue-600' : 'bg-gray-300'
                           }`}>
                           1
                         </div>
                         <span className="text-xs font-medium text-gray-500 mt-2 absolute top-8 whitespace-nowrap">Submitted</span>
                       </div>
                       
                       {/* Step 2: Document Review */}
                       <div className="flex flex-col items-center">
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 transition-colors ${
                             ['under_review', 'selection', 'approved', 'rejected'].includes(app.status) 
                             ? 'bg-blue-600' : 'bg-gray-300 ring-4 ring-gray-50'
                           }`}>
                           2
                         </div>
                         <span className="text-xs font-medium text-gray-500 mt-2 absolute top-8 whitespace-nowrap">Document Review</span>
                       </div>

                       {/* Step 3: Selection */}
                       <div className="flex flex-col items-center">
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 transition-colors ${
                             ['selection', 'approved', 'rejected'].includes(app.status) 
                             ? 'bg-blue-600' : 'bg-gray-300 ring-4 ring-gray-50'
                           }`}>
                           3
                         </div>
                         <span className="text-xs font-medium text-gray-500 mt-2 absolute top-8 whitespace-nowrap">Selection</span>
                       </div>

                       {/* Step 4: Decision */}
                       <div className="flex flex-col items-center">
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-10 transition-colors ${
                             app.status === 'approved' ? 'bg-green-500' :
                             app.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300 ring-4 ring-gray-50'
                           }`}>
                           4
                         </div>
                         <span className="text-xs font-medium text-gray-500 mt-2 absolute top-8 whitespace-nowrap">Decision</span>
                       </div>
                    </div>
                  </div>
                  <div className="h-6"></div> {/* Spacer for absolute text */}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {/* Personal Details */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-2 text-blue-900 mb-2">
                    <User className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Personal Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-4">
                      {app.passportPhoto ? (
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 border-2 border-white shadow-sm overflow-hidden text-xs text-center p-1 font-medium">Uploaded</div>
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-white shadow-sm">
                          <User className="h-8 w-8" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Applicant ID</p>
                        <p className="font-bold text-gray-900">{app.id?.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{profile?.name}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Phone Number
                      </p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.phoneNumber}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Date of Birth
                      </p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.dateOfBirth}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Gender</p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.gender}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Nationality</p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.nationality}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Address
                      </p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.address}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Users className="h-3 w-3" /> Guardian
                      </p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.guardianName} ({app.guardianPhone})</p>
                    </div>
                  </div>
                </div>

                {/* Academic Details */}
                <div className="p-6 sm:p-8 space-y-6 bg-gray-50/30">
                  <div className="flex items-center gap-2 text-blue-900 mb-2">
                    <GraduationCap className="h-5 w-5" />
                    <h3 className="text-lg font-bold">Academic Details</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> Program
                      </p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.program}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Award className="h-3 w-3" /> Qualification
                      </p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.qualification}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> Previous School
                      </p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.previousSchool} ({app.yearOfCompletion})</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" /> Transcripts
                      </p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.transcriptFile || 'Uploaded'}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FileUp className="h-3 w-3" /> Birth Certificate
                      </p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.birthCertificateFile || 'Uploaded'}</p>
                    </div>
                    <div className="group">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Award className="h-3 w-3" /> Academic Certificate
                      </p>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{app.academicCertificateFile || 'Uploaded'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{editingDraft ? 'Edit Draft Application' : 'New Admission Application'}</h1>
            <p className="text-gray-500 mt-1">Please provide your personal and academic details to apply for admission.</p>
          </div>
        </div>
        {applications.length > 0 && (
          <Button variant="outline" onClick={() => { setActiveView('list'); setEditingDraft(null); }}>
            Cancel
          </Button>
        )}
      </div>

      <Card className="border-none shadow-xl overflow-hidden bg-white">
        <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-blue-400"></div>
        <CardContent className="p-6 sm:p-10">
          <form key={editingDraft ? editingDraft.id : 'new-form'} onSubmit={handleSubmit} className="space-y-10">
            
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name</Label>
                  <Input id="fullName" value={profile?.name || ''} disabled className="bg-gray-50 border-gray-200 text-gray-500" />
                  <p className="text-xs text-gray-400">Pulled from your account profile</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                  <Input id="email" value={profile?.email || ''} disabled className="bg-gray-50 border-gray-200 text-gray-500" />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="phoneNumber" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500" />
                    <Input id="phoneNumber" name="phoneNumber" defaultValue={editingDraft?.phoneNumber} type="tel" placeholder="+220 300 0000" required className="pl-9 focus:border-blue-500 focus:ring-blue-500 transition-all" />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="dateOfBirth" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Date of Birth</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" defaultValue={editingDraft?.dateOfBirth} type="date" required className="focus:border-blue-500 focus:ring-blue-500 transition-all" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-gray-700 font-medium">Gender</Label>
                  <Select name="gender" defaultValue={editingDraft?.gender} required>
                    <SelectTrigger className="focus:ring-blue-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="nationality" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Nationality</Label>
                  <Input id="nationality" name="nationality" defaultValue={editingDraft?.nationality} placeholder="e.g., Gambian" required className="focus:border-blue-500 focus:ring-blue-500 transition-all" />
                </div>

                <div className="space-y-2 md:col-span-2 group">
                  <Label htmlFor="address" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Residential Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500" />
                    <Input id="address" name="address" defaultValue={editingDraft?.address} placeholder="e.g., Senegambia, Serrekunda, The Gambia" required className="pl-9 focus:border-blue-500 focus:ring-blue-500 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Guardian Information Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Guardian / Emergency Contact</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <Label htmlFor="guardianName" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Guardian's Full Name</Label>
                  <Input id="guardianName" name="guardianName" defaultValue={editingDraft?.guardianName} placeholder="Full Name" required className="focus:border-blue-500 focus:ring-blue-500 transition-all" />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="guardianPhone" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Guardian's Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500" />
                    <Input id="guardianPhone" name="guardianPhone" defaultValue={editingDraft?.guardianPhone} type="tel" placeholder="+220 700 0000" required className="pl-9 focus:border-blue-500 focus:ring-blue-500 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Academic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="program" className="text-gray-700 font-medium">Course Application</Label>
                  <Select name="program" defaultValue={editingDraft?.program} required>
                    <SelectTrigger className="focus:ring-blue-500">
                      <SelectValue placeholder="Select course to apply for" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length > 0 ? (
                        courses.map(course => (
                           <SelectItem key={course.id} value={`${course.courseCode} - ${course.title}`}>
                             {course.courseCode} - {course.title}
                           </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="BSc Mechanical Engineering (4 Years)">BSc Mechanical Engineering (4 Years)</SelectItem>
                          <SelectItem value="BSc Electrical Engineering (4 Years)">BSc Electrical Engineering (4 Years)</SelectItem>
                          <SelectItem value="BSc Civil Engineering (4 Years)">BSc Civil Engineering (4 Years)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualification" className="text-gray-700 font-medium">Highest Qualification</Label>
                  <Select name="qualification" defaultValue={editingDraft?.qualification} required>
                    <SelectTrigger className="focus:ring-blue-500">
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WASSCE">WASSCE</SelectItem>
                      <SelectItem value="Diploma">Diploma</SelectItem>
                      <SelectItem value="HND">HND</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 group">
                  <Label htmlFor="previousSchool" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Previous School Attended</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500" />
                    <Input id="previousSchool" name="previousSchool" defaultValue={editingDraft?.previousSchool} placeholder="e.g., Gambia Senior Secondary School" required className="pl-9 focus:border-blue-500 focus:ring-blue-500 transition-all" />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2 group">
                  <Label htmlFor="yearOfCompletion" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Year of Completion</Label>
                  <Input id="yearOfCompletion" name="yearOfCompletion" defaultValue={editingDraft?.yearOfCompletion} type="number" min="1990" max={new Date().getFullYear()} placeholder="YYYY" required className="focus:border-blue-500 focus:ring-blue-500 transition-all" />
                </div>
              </div>
            </div>

            {/* Document Uploads Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <FileUp className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Document Uploads</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Please clearly scan and upload the following required documents in PDF or Image format (Max 800KB each for this trial environment).</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2 flex items-center gap-6 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                  <div className="h-24 w-24 rounded-2xl bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden shrink-0 group-hover:border-blue-500 transition-colors">
                    <User className="h-10 w-10 text-gray-300" />
                  </div>
                  <div className="space-y-2 group flex-1">
                    <Label htmlFor="passportPhoto" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Passport Photograph *</Label>
                    <div className="relative">
                      <Input id="passportPhoto" name="passportPhoto" type="file" accept=".jpg,.jpeg,.png" required={!editingDraft?.passportPhoto} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 transition-all cursor-pointer bg-white" />
                    </div>
                    {editingDraft?.passportPhoto && <p className="text-xs text-blue-600 font-medium mt-1">Currently uploaded: {editingDraft.passportPhoto}</p>}
                    <p className="text-xs text-gray-500">Recent passport-sized photo (white or red background, max 800KB). JPG or PNG format.</p>
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="transcriptFile" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Academic Transcript</Label>
                  <div className="relative">
                    <Input id="transcriptFile" name="transcriptFile" type="file" accept=".pdf,.jpg,.jpeg,.png" required={!editingDraft?.transcriptFile} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 transition-all cursor-pointer" />
                  </div>
                  {editingDraft?.transcriptFile && <p className="text-xs text-blue-600 font-medium">Currently uploaded: {editingDraft.transcriptFile}</p>}
                  <p className="text-xs text-gray-400">Official high school transcript.</p>
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="academicCertificateFile" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Academic Certificate (e.g., WASSCE)</Label>
                  <div className="relative">
                    <Input id="academicCertificateFile" name="academicCertificateFile" type="file" accept=".pdf,.jpg,.jpeg,.png" required={!editingDraft?.academicCertificateFile} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 transition-all cursor-pointer" />
                  </div>
                  {editingDraft?.academicCertificateFile && <p className="text-xs text-blue-600 font-medium">Currently uploaded: {editingDraft.academicCertificateFile}</p>}
                  <p className="text-xs text-gray-400">Your final examination certificate.</p>
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="birthCertificateFile" className="text-gray-700 font-medium group-focus-within:text-blue-600 transition-colors">Birth Certificate</Label>
                  <div className="relative">
                    <Input id="birthCertificateFile" name="birthCertificateFile" type="file" accept=".pdf,.jpg,.jpeg,.png" required={!editingDraft?.birthCertificateFile} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 focus:ring-blue-500 transition-all cursor-pointer" />
                  </div>
                  {editingDraft?.birthCertificateFile && <p className="text-xs text-blue-600 font-medium">Currently uploaded: {editingDraft.birthCertificateFile}</p>}
                  <p className="text-xs text-gray-400">Valid birth certificate or national ID.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
              <Button type="submit" name="action" value="draft" variant="outline" className="flex-[1] h-14 text-lg border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button type="submit" name="action" value="submit" className="flex-[2] h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" disabled={submitting}>
                {submitting ? 'Submitting Application...' : 'Submit Final Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
