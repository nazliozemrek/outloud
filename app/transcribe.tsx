// app/transcribe.tsx
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { analyzeMood } from '../lib/therapistAi';
import Constants from 'expo-constants';

const OPENAI_KEY = Constants.expoConfig?.extra?.OPENAI_API_KEY;


export default function TranscribeScreen() {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [moodData, setMoodData] = useState<any>(null);


  useEffect(() => { 
    const transcribeAudio = async () => {
      if (!uri) return;

      try {
        const formData = new FormData();
        formData.append('file', {
          uri,
          type: 'audio/m4a',
          name: 'voice.m4a',
        } as any);
        formData.append('model', 'whisper-1');
        formData.append('language', 'en');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`, 
            
          },
          body: formData,
        });

        if(!response.ok) {
            const errorText = await response.text();
            console.error("Transcription failed",errorText);
            setTranscript("Failed to transcribe.");
            return;
        }




        const data = await response.json();
        console.log('Transcription:', data.text);
        setTranscript(data.text || 'No transcription returned.');

        const mood = await analyzeMood(data.text);
        setMoodData(mood);
        Speech.speak(mood.message);

      } catch (error) {
        console.error('Transcription error:', error);
        setTranscript('Failed to transcribe.');
      } finally {
        setLoading(false);
      }
    };

    transcribeAudio();
  }, [uri]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Transcription</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#36c" />
      ) : (
        <ScrollView>
          <Text style={styles.transcript}>{transcript}</Text>
                    {moodData && (
            <View style={{ marginTop: 20 }}>
                <Text style={{ color: "#fff" }}>🧠 Mood: {moodData.mood}</Text>
                <Text style={{ color: "#fff" }}>🔥 Intensity: {moodData.intensity}/10</Text>
                <Text style={{ color: "#fff" }}>❤️ Emotions: {moodData.emotions?.join(", ")}</Text>
                <Text style={{ color: "#ccc", marginTop: 10 }}>{moodData.message}</Text>
            </View>
)}

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  transcript: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
});
