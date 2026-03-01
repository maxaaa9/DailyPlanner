import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

/**
 * Signs in a user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<boolean>} true on success, false on failure
 */
export async function signIn(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error) {
    console.error('Wrong credentials, please try again!');
    return false;
  }
}

export async function createAccount(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    console.log('Account created successfully');
    return true;
  } catch (error) {
    console.error('This email is already in use, please try another one!');
    return false;
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error('Sign out failed:', error.message);
    return false;
  }
}
