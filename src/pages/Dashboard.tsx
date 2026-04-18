import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, GraduationCap, Users, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-blue-400/20 blur-xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Welcome back, {profile.name}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            You are logged in as {['admin', 'applicant'].includes(profile.role) ? 'an' : 'a'} 
            <span className="font-semibold capitalize text-white bg-white/20 px-2 py-0.5 rounded-md ml-1">{profile.role}</span>. 
            Access your university resources below.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Applicant View */}
        {profile.role === 'applicant' && (
          <Card className="col-span-full md:col-span-2 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-blue-100 overflow-hidden">
            <div className="h-2 w-full bg-blue-600"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                Admission Application
              </CardTitle>
              <CardDescription className="text-base mt-2">Start or check the status of your university application.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/apply">
                <Button className="w-full sm:w-auto group-hover:bg-blue-700 transition-colors">
                  Go to Application
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Student View */}
        {profile.role === 'student' && (
          <>
            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 hover:border-indigo-200 overflow-hidden">
              <div className="h-1.5 w-full bg-indigo-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  Course Registration
                </CardTitle>
                <CardDescription>Register for your semester courses.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/courses">
                  <Button variant="outline" className="w-full group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200 transition-all">
                    Register Courses
                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 hover:border-emerald-200 overflow-hidden">
              <div className="h-1.5 w-full bg-emerald-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <GraduationCap className="h-5 w-5 text-emerald-600" />
                  </div>
                  Academic Results
                </CardTitle>
                <CardDescription>View your grades and academic standing.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/results">
                  <Button variant="outline" className="w-full group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-all">
                    View Results
                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 hover:border-amber-200 overflow-hidden">
              <div className="h-1.5 w-full bg-amber-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  Lecturers Directory
                </CardTitle>
                <CardDescription>Find contact information for your lecturers.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/lecturers">
                  <Button variant="outline" className="w-full group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-200 transition-all">
                    View Directory
                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 hover:border-cyan-200 overflow-hidden">
              <div className="h-1.5 w-full bg-cyan-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  </div>
                  Course Timetable
                </CardTitle>
                <CardDescription>View your weekly class schedule.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/timetable">
                  <Button variant="outline" className="w-full group-hover:bg-cyan-50 group-hover:text-cyan-700 group-hover:border-cyan-200 transition-all">
                    View Timetable
                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}

        {/* Announcements Card (visible to all) */}
        <Card className="col-span-full md:col-span-1 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-200 hover:border-rose-200 overflow-hidden">
          <div className="h-1.5 w-full bg-rose-500"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </div>
              Announcements
            </CardTitle>
            <CardDescription>Latest updates from administration.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/announcements">
              <Button variant="outline" className="w-full group-hover:bg-rose-50 group-hover:text-rose-700 group-hover:border-rose-200 transition-all">
                View Updates
                <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Admin/Lecturer View */}
        {(profile.role === 'admin' || profile.role === 'lecturer') && (
          <Card className="col-span-full group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-purple-200 overflow-hidden">
            <div className="h-2 w-full bg-purple-600"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                Staff Dashboard
              </CardTitle>
              <CardDescription className="text-base mt-2">Access administrative tools and student records.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Use the sidebar navigation to access specific modules.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
