import { signInWithEmailAndPassword } from 'firebase/auth';
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
    console.log('Sign in successful');
    return true;
  } catch (error) {
    console.error('Wrong credentials, please try again!');
    return false;
  }
}
