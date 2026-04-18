import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'applicant' | 'student' | 'lecturer' | 'admin';
  studentId?: string;
  department?: string;
  level?: number;
  phone?: string;
  photoUrl?: string;
  createdAt: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signUpWithEmail: (data: any) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchMockRole: (role: UserProfile['role']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Fallback profile if doc missing
          const defaultRole = firebaseUser.email?.includes('admin') ? 'admin' : 'applicant';
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'New User',
            role: defaultRole as any,
            createdAt: new Date()
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchMockRole = (role: UserProfile['role']) => {
    localStorage.setItem('mockRole', role);
    window.location.reload();
  };

  const signUpWithEmail = async ({ email, password, name, phone, photoUrl, role = 'applicant' }: any) => {
    // Create the user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Update their display name
    await updateProfile(newUser, { displayName: name });
    
    // Send email verification
    await sendEmailVerification(newUser);

    // Create their profile in Firestore
    const userDocRef = doc(db, 'users', newUser.uid);
    const newProfile: Partial<UserProfile> = {
      uid: newUser.uid,
      email: email,
      name: name,
      phone: phone,
      photoUrl: photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      role: role,
      createdAt: serverTimestamp(),
    };
    await setDoc(userDocRef, newProfile);
    
    // Sign out to enforce manual sign in post-verification
    await firebaseSignOut(auth);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    if (!userCredential.user.emailVerified) {
      await firebaseSignOut(auth);
      throw new Error("Please verify your email before logging in. Check your inbox.");
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUpWithEmail, signInWithEmail, signInWithGoogle, signOut, switchMockRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

