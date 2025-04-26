import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Audio } from 'expo-av';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';


// Mantener la pantalla de splash visible mientras se cargan los recursos
SplashScreen.preventAutoHideAsync();

export default function BoiledEggTimer() {
  // Estados
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [eggType, setEggType] = useState<'soft' | 'medium' | 'hard'>('soft');
  const [soundLoaded, setSoundLoaded] = useState(false);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Cargar fuentes
  const [fontsLoaded] = useFonts({
    'SpaceMono': require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Cargar sonido
  useEffect(() => {
    let isMounted = true;
    
    const loadSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/images/alarm-no3-14864.mp3'),
          { shouldPlay: false }
        );
        
        if (isMounted) {
          soundRef.current = sound;
          setSoundLoaded(true);
        }
      } catch (error) {
        console.error("Error cargando el sonido:", error);
      }
    };
    
    loadSound();
    
    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(err => 
          console.error("Error al descargar el sonido:", err)
        );
      }
    };
  }, []);

  // Ocultar splash screen
  useEffect(() => {
    if (fontsLoaded && soundLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, soundLoaded]);

  // Tiempos para cada tipo de huevo
  const eggTimes = {
    soft: 60,
    medium: 180,
    hard: 300,
  };

  // Manejar temporizador
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setIsActive(false);
            playSound();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      timerRef.current = interval;
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive]);

  // Función para reproducir sonido
  const playSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error("Error reproduciendo el sonido:", error);
    }
  };

  // Función para iniciar temporizador
  const startTimer = () => {
    setIsActive(true);
  };

  // Función para reiniciar temporizador
  const resetTimer = () => {
    setIsActive(false);
    setTimeRemaining(eggTimes[eggType]);
  };

  // Función para seleccionar tipo de huevo
  const selectEggType = (type: 'soft' | 'medium' | 'hard') => {
    if (!isActive) {
      setEggType(type);
      setTimeRemaining(eggTimes[type]);
    }
  };

  // Función para formatear tiempo
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}\nsec`;
    } else {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}\nmin`;
    }
  };

  if (!fontsLoaded || !soundLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Boiled Egg{'\n'}Timer</Text>
      
      <View style={styles.imageContainer}>
        <Image 
          source={require('../../assets/images/egg3.png')}
          style={styles.eggImage}
          resizeMode="contain"
        />
      </View>
      
      <Text style={styles.timer}>{formatTime(timeRemaining)}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.typeButton, eggType === 'soft' && styles.selectedType]} 
          onPress={() => selectEggType('soft')}
        >
          <Text style={styles.typeButtonText}>Soft boiled</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.typeButton, eggType === 'medium' && styles.selectedType]} 
          onPress={() => selectEggType('medium')}
        >
          <Text style={styles.typeButtonText}>Medium boiled</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.typeButton, eggType === 'hard' && styles.selectedType]} 
          onPress={() => selectEggType('hard')}
        >
          <Text style={styles.typeButtonText}>Hard boiled</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.startButtonContainer}>
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={isActive ? resetTimer : startTimer}
        >
          <Text style={styles.startButtonText}>{isActive ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4DC6F4',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  title: {
    fontFamily: 'SpaceMono',
    fontSize: 36,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 20,
  },
  imageContainer: {
    width: 200,
    height: 240,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4DC6F4',
    borderRadius: 20,
  },
  eggImage: {
    width: 200,
    height: 240,
    borderRadius: 20,
  },
  timer: {
    fontFamily: 'SpaceMono',
    fontSize: 48,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 40,
  },
  typeButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedType: {
    backgroundColor: '#E6E6E6',
    borderWidth: 2,
    borderColor: '#333',
  },
  typeButtonText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButtonContainer: {
    width: '80%',
    borderWidth: 2,
    borderColor: '#6B9EFF',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 5,
  },
  startButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'black',
  },
  startButtonText: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    fontWeight: 'bold',
  },
});