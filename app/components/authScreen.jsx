import { Button, StyleSheet, TextInput, View, KeyboardAvoidingView, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from "react";
import { signIn, createAccount } from "../utils/authenticator";

const AuthScreen = ({ onAuthSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const errorTimer = useRef(null);
    const passwordRef = useRef(null);

    const showError = (message) => {
        setError(message);
        clearTimeout(errorTimer.current);
        errorTimer.current = setTimeout(() => setError(''), 3000);
    };

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const handleSignIn = async () => {
        if (!isValidEmail(email)) return showError('Please enter a valid email address.');
        const success = await signIn(email, password);
        if (success) onAuthSuccess();
        else showError('Wrong credentials, please try again.');
    };

    const handleRegister = async () => {
        if (!isValidEmail(email)) return showError('Please enter a valid email address.');
        const success = await createAccount(email, password);
        if (success) onAuthSuccess();
        else showError('This email is already in use, please try another one.');
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView behavior="padding" style={styles.keyboard}>
                <View style={styles.container}>
                    <Image source={require('../../assets/dailyPlanner.jpg')} style={styles.wallpaper} resizeMode="cover" />
                    <Text style={styles.title}>{isRegistering ? 'Create Account' : 'Sign In'}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={(text) => setEmail(text.trim())}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                    {error !== '' && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                    <TextInput
                        ref={passwordRef}
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                        returnKeyType="done"
                        onSubmitEditing={isRegistering ? handleRegister : handleSignIn}
                    />
                    <Button
                        title={isRegistering ? 'Register' : 'Sign In'}
                        onPress={isRegistering ? handleRegister : handleSignIn}
                    />
                    <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
                        <Text style={styles.toggleText}>
                            {isRegistering ? 'Already have an account? Sign in.' : "Don't have an account? Sign up."}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AuthScreen;

const styles = StyleSheet.create({
    errorBanner: {
        width: '80%',
        backgroundColor: '#F44336',
        borderRadius: 8,
        padding: 12,
    },
    errorText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    keyboard: {
        flex: 1,
        flexDirection: 'column',
        borderColor: 'black',
        borderWidth: 1,
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    wallpaper: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    input: {
        width: '80%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
    },
    toggleText: {
        color: 'blue',
        marginTop: 8,
    },
});
