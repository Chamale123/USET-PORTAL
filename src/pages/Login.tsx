import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { GraduationCap, Upload, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { user, loading, signInWithEmail, signUpWithEmail } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Allow passing through if verified, or just if auto-logged after trying (though we check emailVerified)
  if (user && user.emailVerified) {
    return <Navigate to="/dashboard" />;
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Create an image element to resize the base64 string
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setPhotoBase64(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        if (!photoBase64) {
           toast.error('Please upload your profile picture.');
           setIsSubmitting(false);
           return;
        }
        await signUpWithEmail({
          email,
          password,
          name,
          phone,
          photoUrl: photoBase64,
          role: email.toLowerCase().includes('admin') ? 'admin' : 'applicant'
        });
        toast.success("Successfully registered! Please check your email inbox to verify your account.");
        // Switch to sign in view so they can sign in after verifying
        setIsSignUp(false);
      } else {
        await signInWithEmail(email, password);
        toast.success('Signed in successfully');
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please sign in instead.');
      } else if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email/Password sign-in is not enabled in your Firebase Console. Please go to Authentication -> Sign-in Method to enable it.');
      } else if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password. Make sure you have clicked "Register & Apply" to create an account first if you do not have one!');
      } else {
        toast.error(error.message || 'Authentication failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 my-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Admission Registration' : 'USET Portal Access'}
          </h1>
          <p className="text-gray-500 mt-2 text-center text-sm">
            {isSignUp 
              ? 'Register with your information to begin the application process.' 
              : 'Enter your email and password to access your portal.'}
          </p>
        </div>

        <form onSubmit={handleAuthAction} className="space-y-5">
          {isSignUp && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g., Momodou Jallow"
                  required 
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telephone Number</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="+220 300 0000"
                  required 
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePic">Profile Picture</Label>
                <Input 
                  id="profilePic" 
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload} 
                  required 
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer text-sm py-2"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="e.g., admin@uset.edu"
              required 
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
              className="h-11"
            />
          </div>

          <Button 
            type="submit"
            className="w-full h-11 text-base bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all mt-4" 
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isSignUp ? 'Registering...' : 'Accessing...') 
              : (isSignUp ? 'Sign Up' : 'Sign In')
            }
          </Button>
        </form>

        <div className="mt-6 text-center text-sm border-t border-gray-100 pt-6">
          <p className="text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account to apply?"}
          </p>
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 font-semibold hover:underline mt-1 inline-flex items-center gap-1"
          >
            {isSignUp ? (
               <><LogIn className="h-4 w-4" /> Sign in to your account</>
            ) : (
               <><UserPlus className="h-4 w-4" /> Register & Apply</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
{/* --- USET Portal Gallery Start --- */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
            Campus & Innovation Labs
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <img src="/assets/WhatsApp Image 2026-04-18 at 15.53.38 (1).jpeg" alt="USET Campus" className="rounded-lg object-cover h-24 w-full shadow-sm" />
            <img src="/assets/WhatsApp Image 2026-04-18 at 15.53.37.jpeg" alt="Electrical Lab" className="rounded-lg object-cover h-24 w-full shadow-sm" />
            <img src="/assets/WhatsApp Image 2026-04-18 at 15.53.34.jpeg" alt="Mechanical Workshop" className="rounded-lg object-cover h-24 w-full shadow-sm" />
            <img src="/assets/WhatsApp Image 2026-04-18 at 15.53.39 (1).jpeg" alt="Welding Section" className="rounded-lg object-cover h-24 w-full shadow-sm" />
            <img src="/assets/WhatsApp Image 2026-04-18 at 15.53.38.jpeg" alt="Research Lab" className="rounded-lg object-cover h-24 w-full shadow-sm" />
            <img src="/assets/WhatsApp Image 2026-04-18 at 15.53.39 (2).jpeg" alt="Innovation Lab" className="rounded-lg object-cover h-24 w-full shadow-sm" />
          </div>
        </div>
        {/* --- USET Portal Gallery End --- */}
