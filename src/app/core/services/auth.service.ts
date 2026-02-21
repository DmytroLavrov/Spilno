import { inject, Injectable, Injector, runInInjectionContext, signal } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { User } from '@models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private injector = inject(Injector);

  public currentUser = signal<User | null>(null);

  public currentUser$: Observable<User | null> = authState(this.auth).pipe(
    switchMap(async (firebaseUser) => {
      if (!firebaseUser) {
        this.currentUser.set(null);
        return null; // Return null to the stream
      }

      return runInInjectionContext(this.injector, async () => {
        const userDoc = await getDoc(doc(this.firestore, 'users', firebaseUser.uid));
        const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;

        this.currentUser.set(userData);
        return userData; // Return the user to the stream
      });
    }),
  );

  public async register(email: string, password: string, profile: Partial<User>) {
    const cred = await runInInjectionContext(this.injector, async () => {
      return await createUserWithEmailAndPassword(this.auth, email, password);
    });

    // Save the profile in Firestore with a 'pending' status
    await runInInjectionContext(this.injector, async () => {
      await setDoc(doc(this.firestore, 'users', cred.user.uid), {
        ...profile,
        email,
        role: 'resident',
        status: 'pending', // admin has to approve
        createdAt: new Date(),
      });
    });

    this.router.navigate(['/auth/pending']);
  }

  public async login(email: string, password: string) {
    await runInInjectionContext(this.injector, async () => {
      await signInWithEmailAndPassword(this.auth, email, password);
    });
    // onAuthStateChanged will trigger by itself and update currentUser
    this.router.navigate(['/dashboard']);
  }

  public async logout() {
    await runInInjectionContext(this.injector, async () => {
      await signOut(this.auth);
    });
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  public isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
