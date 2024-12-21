import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Assuming you are using React Navigation
import NetInfo from "@react-native-community/netinfo"; // Library to check internet connection

export default function ListScreen() {
  const [username, setUsername] = useState("");
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [minChange, setMinChange] = useState(""); // For input field value
  const [isOffline, setIsOffline] = useState(false); // To handle offline status
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  // Load username from AsyncStorage
  const loadUsername = async () => {
    const savedUsername = await AsyncStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      Alert.alert("Error", "Failed to load username.");
    }
  };

  // Fetch coins from API and cache them in AsyncStorage
  const loadCoins = async () => {
    setLoading(true);
    try {
      // Check if we have cached data in AsyncStorage
      const cachedCoins = await AsyncStorage.getItem("coins");
      if (cachedCoins) {
        setCoins(JSON.parse(cachedCoins));
        setFilteredCoins(JSON.parse(cachedCoins)); // Initially set filtered coins to all
      } else {
        // If no cache, fetch from the API
        const response = await fetch("https://api.coinlore.net/api/tickers/?limit=50");
        const data = await response.json();
        if (data && data.data) {
          setCoins(data.data);
          setFilteredCoins(data.data); // Initially set filtered coins to all
          await AsyncStorage.setItem("coins", JSON.stringify(data.data)); // Cache the data
        } else {
          Alert.alert("Error", "Failed to load coins.");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch coins: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter the list based on the minimum percentage change
  const filterCoins = () => {
    if (minChange === "") {
      setFilteredCoins(coins); // If no filter, show all coins
    } else {
      const filtered = coins.filter((coin) => coin.percent_change_24h >= parseFloat(minChange));
      setFilteredCoins(filtered);
    }
  };

  // Handle online/offline status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadUsername();
    loadCoins();
  }, []);

  // Handle tapping on a coin to navigate to Screen 3
  const handleCoinPress = (coin) => {
    if (!isOffline) {
      navigation.navigate("Chart", { coin });
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome, {username}</Text>

      {/* Offline overlay */}
      {isOffline && (
        <View style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center"
        }}>
          <Text style={{ color: "white", fontSize: 18 }}> You are offline. Tapping on a coin is disabled. </Text>
        </View>
      )}

      {/* Input and filter button */}
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        placeholder="Minimum 24-hr % Change"
        value={minChange}
        onChangeText={setMinChange}
        keyboardType="numeric"
      />
      <Button title="Filter" onPress={filterCoins}/>

      <View style={{ marginTop: 20 }} >
        {loading ? (
            <ActivityIndicator size="large"/>
            ) : (
                <FlatList
                data={filteredCoins}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleCoinPress(item)} disabled={isOffline}>
                <View style={{ padding: 10, marginBottom: 10, backgroundColor: "lightgray" }}>
                    <Text>{item.name} ({item.symbol})</Text>
                    <Text>Price: ${item.price_usd}</Text>
                    <Text>24h Change: {item.percent_change_24h}%</Text>
                </View>
                </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            />
            )}
        </View>
    </View>
  );
}
