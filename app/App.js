import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { signIn } from './utils/authenticator';
import { useState } from 'react';

export default function App() {
  const [signedIn, setSignedIn] = useState(false);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
      <View style={[styles.statusBadge, signedIn ? styles.statusOn : styles.statusOff]}>
        <Text style={styles.statusText}>
          {signedIn ? 'Signed In' : 'Signed Out'}
        </Text>
      </View>
      <Button
        onPress={() => signIn('maxaaa9@abv.bg', '1234567').then(result => setSignedIn(result))}
        title="Sign In"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
