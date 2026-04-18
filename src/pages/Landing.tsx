import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  GraduationCap, 
  ArrowRight, 
  BookOpen, 
  Building2, 
  Globe,
  MapPin,
  Mail,
  Phone,
  Newspaper,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Landing() {
  const { user, loading } = useAuth();

  const popularProgrammes = [
    {
      name: "Civil Engineering",
      degree: "BSc (Bachelor of Science)",
      college: "College of Science & Engineering (CoSE)",
      desc: "Focuses on the design, construction, and maintenance of the physical and naturally built environment.",
      careers: "Structural Engineer, Urban Planner, Construction Manager"
    },
    {
      name: "Mechanical Engineering",
      degree: "BSc (Bachelor of Science)",
      college: "College of Science & Engineering (CoSE)",
      desc: "Applies physics and materials science principles for the design, analysis, and manufacturing of mechanical systems.",
      careers: "Automotive Engineer, Robotics Specialist, Mechanical Designer"
    },
    {
      name: "Electrical & Electronics Engineering",
      degree: "BSc (Bachelor of Science)",
      college: "College of Science & Engineering (CoSE)",
      desc: "Explores the application of electricity, electronics, and electromagnetism in modern technology.",
      careers: "Power Systems Engineer, Electronics Designer, Control Systems Engineer"
    },
    {
      name: "Computer Science",
      degree: "Diploma & Certificate",
      college: "Institute of Technology (IoT)",
      desc: "Provides foundational and advanced knowledge in computation, systems administration, and information technology.",
      careers: "Software Developer, Network Administrator, Database Administrator"
    },
    {
      name: "Software Application",
      degree: "Diploma & Certificate",
      college: "Institute of Technology (IoT)",
      desc: "Specialized training in software development, web applications, and software testing lifecycles.",
      careers: "App Developer, QA Tester, UI/UX Designer"
    },
    {
      name: "Business courses",
      degree: "Diploma & Certificate",
      college: "Institute of Innovation & Entrepreneurship (IIE)",
      desc: "Covers essential principles of business management, corporate strategy, and modern entrepreneurship.",
      careers: "Business Manager, Entrepreneur, Operations Analyst"
    },
    {
      name: "Legal studies",
      degree: "Diploma & Certificate",
      college: "Institute of Innovation & Entrepreneurship (IIE)",
      desc: "An introduction to corporate law, commercial regulations, and ethical legal practices in business.",
      careers: "Legal Assistant, Paralegal, Compliance Officer"
    },
    {
      name: "Accounting",
      degree: "Diploma & Certificate",
      college: "Institute of Innovation & Entrepreneurship (IIE)",
      desc: "In-depth training on financial accounting, auditing, taxation, and financial management.",
      careers: "Accountant, Financial Auditor, Tax Advisor"
    }
  ];

  const [selectedProg, setSelectedProg] = useState(popularProgrammes[0]);
  const [recentNews, setRecentNews] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'announcements'), 
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const colleges = [
    { name: "College of Science & Engineering (CoSE)", icon: Building2 },
    { name: "Institute of Technology (IoT)", icon: GraduationCap },
    { name: "Institute of Innovation & Entrepreneurship (IIE)", icon: Globe },
  ];

  const scrollToSection = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner Navigation */}
      <div className="bg-blue-900 text-white text-sm py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-blue-300" /> +220 3495779</span>
            <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-300" /> info@uset.edu.gm</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-blue-100 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-white after:scale-x-0 hover:after:scale-x-100 after:origin-right hover:after:origin-left after:transition-transform">About Us</a>
            <a href="#academic-resources" onClick={(e) => scrollToSection(e, 'academic-resources')} className="text-blue-100 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-white after:scale-x-0 hover:after:scale-x-100 after:origin-right hover:after:origin-left after:transition-transform">Academic Calendar</a>
            <a href="#news" onClick={(e) => scrollToSection(e, 'news')} className="text-blue-100 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-white after:scale-x-0 hover:after:scale-x-100 after:origin-right hover:after:origin-left after:transition-transform">News</a>
            <div className="w-px h-4 bg-blue-700 mx-2"></div>
            <Link to="/login" className="font-semibold text-yellow-400 hover:text-yellow-300 hover:scale-105 transition-all">Staff / Student Login</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-900">
            {/* The Logo substituting the text lockup */}
            <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center">
              <img 
                src="/uset-logo.png" 
                alt="USET Logo" 
                className="h-full w-full object-contain"
                onError={(e) => { 
                  // If the user hasn't uploaded the logo to /public/uset-logo.png yet, fallback cleanly
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('bg-blue-100', 'rounded-xl', 'p-2');
                  const fallback = document.createElement('div');
                  fallback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-blue-700"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
                  e.currentTarget.parentElement?.appendChild(fallback.firstChild as Node);
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none text-blue-900">USET</h1>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest hidden sm:block">The Gambia</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-gray-600">
            <a href="#programmes" onClick={(e) => scrollToSection(e, 'programmes')} className="relative py-2 text-gray-600 hover:text-blue-700 transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:scale-x-0 hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300">Programmes</a>
            <a href="#colleges" onClick={(e) => scrollToSection(e, 'colleges')} className="relative py-2 text-gray-600 hover:text-blue-700 transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 after:scale-x-0 hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300">Colleges</a>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <Link to="/login">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold px-6 shadow-sm">
                Apply Now
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">Portal Login</Button>
            </Link>
          </nav>
          <div className="md:hidden flex gap-2">
            <Link to="/login">
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">Portal</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white overflow-hidden">
        {/* Placeholder image representation since we don't have direct access to user environment background assets */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-multiply"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2940&auto=format&fit=crop")' }}
        ></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-32 lg:py-40">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-800/50 border border-blue-400 text-blue-100 text-sm font-semibold mb-6 backdrop-blur-sm">
              Shaping the Future Together
            </span>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              University of Science, Engineering and Technology
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 leading-relaxed max-w-2xl font-light">
              Pioneering excellence in STEM, entrepreneurship, and innovation across The Gambia and beyond.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 w-full sm:w-auto text-lg px-8 h-14 font-semibold shadow-lg">
                  Start Online Application <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')}>
                <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto text-lg px-8 h-14 backdrop-blur-sm">
                  Discover USET
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2">About USET</h3>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">A Legacy of Innovation and Excellence</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                The University of Science, Engineering and Technology (USET) was established with a clear mandate: to drive technological and scientific advancement in The Gambia. Through rigorous academic programs and hands-on practical training, we equip our students to become global leaders in their fields.
              </p>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <h4 className="font-bold text-gray-900 mb-2">Our Mission & Vision</h4>
                <p className="text-gray-600 text-sm">To be a world-class center of excellence driving scientific innovation, ethical leadership, and sustainable development through cutting-edge research and immersive education.</p>
              </div>
              <Button variant="link" className="text-blue-600 p-0 font-semibold h-auto">
                Read our full history and leadership structure <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80" alt="Students studying" className="rounded-2xl shadow-md h-48 w-full object-cover" />
                <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80" alt="Engineering Lab" className="rounded-2xl shadow-md h-64 w-full object-cover" />
              </div>
              <div className="space-y-4 pt-12">
                <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80" alt="Campus Building" className="rounded-2xl shadow-md h-64 w-full object-cover" />
                <div className="bg-blue-900 rounded-2xl p-6 text-white shadow-md flex flex-col justify-center h-48">
                  <span className="text-4xl font-black mb-2">10k+</span>
                  <span className="text-blue-200">Active Students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structure & Colleges */}
      <section id="colleges" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Institutions</h2>
            <p className="text-xl text-gray-600">USET is systematically structured into specialized colleges and institutes focusing on targeted disciplinary excellence.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {colleges.map((college, idx) => {
              const Icon = college.icon;
              return (
                <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition-shadow group">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">{college.name}</h3>
                  <p className="text-gray-500 mb-6">Discover specialized programs, research opportunities, and expert faculty dedicated to this academic pillar.</p>
                  <Button variant="outline" className="w-full justify-between group-hover:border-blue-600 group-hover:text-blue-700">
                    Explore Institute <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Programmes Directory Section */}
      <section id="programmes" className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Programmes Directory</h2>
            <p className="text-xl text-gray-600">Explore our extensive catalog of specialized courses.</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Tabs List */}
            <div className="lg:w-1/3 flex flex-col gap-2">
              {popularProgrammes.map((prog, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedProg(prog)}
                  className={`text-left px-5 py-4 rounded-xl border transition-all ${selectedProg.name === prog.name ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  <div className="font-bold text-lg">{prog.name}</div>
                  <div className={`text-xs mt-1 font-medium ${selectedProg.name === prog.name ? 'text-blue-200' : 'text-gray-500'}`}>{prog.degree}</div>
                </button>
              ))}
            </div>
            
            {/* Detailed View Pane */}
            <div className="lg:w-2/3">
               <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-10 shadow-lg h-full flex flex-col animate-in fade-in duration-500 slide-in-from-right-4">
                 <div className="mb-6 border-b border-gray-100 pb-6">
                   <div className="flex flex-wrap items-center gap-3 mb-4">
                     <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${selectedProg.degree.includes('BSc') ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                       {selectedProg.degree}
                     </span>
                     <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider">
                       Applications Open
                     </span>
                   </div>
                   <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{selectedProg.name}</h3>
                   <p className="text-blue-700 font-bold flex items-center gap-2">
                     <Building2 className="w-5 h-5" /> {selectedProg.college}
                   </p>
                 </div>
                 
                 <div className="prose prose-blue max-w-none mb-8">
                   <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                     <BookOpen className="w-5 h-5 text-gray-500" /> Program Overview
                   </h4>
                   <p className="text-gray-600 leading-relaxed text-lg">{selectedProg.desc}</p>
                 </div>
                 
                 <div className="mt-auto bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-inner">
                   <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                     <GraduationCap className="w-5 h-5 text-gray-500" /> Career Opportunities
                   </h4>
                   <div className="flex gap-2 flex-wrap">
                     {selectedProg.careers.split(', ').map((career, idx) => (
                       <span key={idx} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:border-blue-300 transition-colors cursor-default">
                         {career}
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="text-center mt-12 pt-8 border-t border-gray-100">
            <Button size="lg" className="bg-blue-900 hover:bg-blue-800 text-white px-8 h-14 shadow-md font-semibold font-xl">
              View Complete Academic Catalogue <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Academic Resources Quick Links */}
      <section id="academic-resources" className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
            <div className="px-4">
              <h4 className="font-bold text-gray-900 mb-2">Academic Calendar</h4>
              <p className="text-sm text-gray-500 mb-4">Key semester dates and holidays.</p>
              <Button variant="link" className="text-blue-600 text-sm p-0 h-auto" onClick={(e) => scrollToSection(e, 'news')}>View Updates</Button>
            </div>
            <div className="px-4">
              <h4 className="font-bold text-gray-900 mb-2">Admissions Links</h4>
              <p className="text-sm text-gray-500 mb-4">Required documents & fees.</p>
              <Link to="/login">
                <Button variant="link" className="text-blue-600 text-sm p-0 h-auto">Applicant Portal</Button>
              </Link>
            </div>
            <div className="px-4">
              <h4 className="font-bold text-gray-900 mb-2">Useful Links</h4>
              <p className="text-sm text-gray-500 mb-4">Library, IT Help, and Policies.</p>
              <Button variant="link" className="text-blue-600 text-sm p-0 h-auto" onClick={(e) => scrollToSection(e, 'programmes')}>Directory</Button>
            </div>
            <div className="px-4">
              <h4 className="font-bold text-gray-900 mb-2">Campus Info</h4>
              <p className="text-sm text-gray-500 mb-4">Maps, facilities, and contact.</p>
              <Button variant="link" className="text-blue-600 text-sm p-0 h-auto" onClick={(e) => scrollToSection(e, 'about')}>Find Us</Button>
            </div>
          </div>
        </div>
      </section>

      {/* News & Updates */}
      <section id="news" className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">News & Announcements</h2>
              <p className="text-gray-600">The latest happenings and updates from around the campus.</p>
            </div>
            <Link to="/login">
              <Button variant="outline" className="hidden sm:flex text-blue-600 border-blue-200 hover:bg-blue-50">View All News</Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {recentNews.length > 0 ? recentNews.map((news, i) => (
              <div key={news.id || i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10" />
                  <img 
                    src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=600&q=80`} 
                    alt="News cover" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1524169358666-79f22534bc6e?w=600&q=80" }}
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                     <span className="text-xs font-bold text-white bg-blue-600 px-2 py-1 rounded">Update</span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <span className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" /> 
                    {news.createdAt ? new Date(news.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">{news.title}</h3>
                  <Link to="/login" className="mt-auto">
                    <Button variant="link" className="p-0 h-auto justify-start text-blue-600">Read Article <ArrowRight className="w-4 h-4 ml-1" /></Button>
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No recent announcements from administration yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 text-white mb-4">
              <GraduationCap className="h-8 w-8" />
              <span className="text-xl font-bold tracking-tight">USET</span>
            </div>
            <p className="text-sm mb-6 max-w-sm">
              University of Science, Engineering and Technology. Shaping the future through cutting-edge education and real-world innovation.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Brikama Campus, The Gambia</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +220 123 4567</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> admissions@uset.edu.gm</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition">Vacancies</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Student Portal</Link></li>
              <li><a href="#programmes" onClick={(e) => scrollToSection(e, 'programmes')} className="hover:text-white transition">Programme Finder</a></li>
              <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-white transition">Campuses</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Colleges</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#colleges" onClick={(e) => scrollToSection(e, 'colleges')} className="hover:text-white transition">CoSE</a></li>
              <li><a href="#colleges" onClick={(e) => scrollToSection(e, 'colleges')} className="hover:text-white transition">Institute of Technology</a></li>
              <li><a href="#colleges" onClick={(e) => scrollToSection(e, 'colleges')} className="hover:text-white transition">Institute of Innovation & Entrepreneurship (IIE)</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {new Date().getFullYear()} University of Science, Engineering and Technology (USET). All rights reserved.
        </div>
      </footer>
    </div>
  );
}
