import { inject, Injectable, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '@models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  public currentUser = signal<User | null>(null);

  // Observable version for guards (they expect an Observable)
  public currentUser$: Observable<User | null> = new Observable((observer) => {
    this.auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        this.currentUser.set(null);
        observer.next(null);
        return;
      }

      const userDoc = await getDoc(doc(this.firestore, 'users', firebaseUser.uid));
      const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
      this.currentUser.set(userData);
      observer.next(userData);
    });
  });

  public async register(email: string, password: string, profile: Partial<User>) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    // Save the profile in Firestore with a 'pending' status
    await setDoc(doc(this.firestore, 'users', cred.user.uid), {
      ...profile,
      email,
      role: 'resident',
      status: 'pending', // admin has to approve
      createdAt: new Date(),
    });

    this.router.navigate(['/auth/pending']);
  }

  public async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password);
    // onAuthStateChanged will trigger by itself and update currentUser
    this.router.navigate(['/dashboard']);
  }

  public async logout() {
    await signOut(this.auth);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  public isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
