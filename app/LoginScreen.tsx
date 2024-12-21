import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState("");
  
    useEffect(() => {
      const loadUsername = async () => {
        const savedUsername = await AsyncStorage.getItem("username");
        if (savedUsername) {
          setUsername(savedUsername);
        }
      };
  
      loadUsername();
    }, []);
  
    const handleLogin = async () => {
      if (username === "") return;
  
      try {
        await AsyncStorage.setItem("username", username);
        navigation.navigate("List");
      } catch (error) {
        Alert.alert("Error", "Failed to save the username.");
      }
    };
  
    return (
      <View>
        <TextInput
          onChangeText={setUsername}
          onSubmitEditing={handleLogin}
          value={username}
          placeholder="Username"
        />
        <Button title="Login" onPress={handleLogin} />
      </View>
    );
  }