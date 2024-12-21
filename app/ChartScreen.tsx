import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { LineChart } from "react-native-chart-kit";

const ChartScreen = ({ route }) => {
  const { coin } = route.params;
  const [priceData, setPriceData] = useState([]);
  const [timer, setTimer] = useState(30);
  const [isOffline, setIsOffline] = useState(false);
  const maxRequests = 5;

  useEffect(() => {
    let interval;
    let requestCount = 0;

    const fetchData = async () => {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setIsOffline(true);
        return;
      }
      setIsOffline(false);

      try {
        const response = await fetch(
          `https://api.coinlore.net/api/ticker/?id=${coin.id}`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const price = parseFloat(data[0].price_usd);
          const timestamp = new Date().toLocaleTimeString();

          const newDataPoint = { time: timestamp, price };
          const updatedData = [...priceData, newDataPoint];

          setPriceData(updatedData);
          await AsyncStorage.setItem(
            "priceData",
            JSON.stringify(updatedData)
          );
        }
      } catch (error) {
        Alert.alert("Error", "Unable to fetch data from the API.");
      }
    };

    const startFetching = () => {
      fetchData();
      interval = setInterval(() => {
        if (requestCount < maxRequests) {
          fetchData();
          requestCount += 1;
        } else {
          clearInterval(interval);
        }
      }, 30000);
    };

    startFetching();

    return () => clearInterval(interval);
  }, [coin, priceData]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prev) => (prev === 1 ? 30 : prev - 1));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const chartConfig = {
    backgroundColor: "#e26a00",
    backgroundGradientFrom: "#fb8c00",
    backgroundGradientTo: "#ffa726",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726",
    },
  };

  const screenWidth = Dimensions.get("window").width;

  const data = {
    labels: priceData.map((point) => point.time),
    datasets: [
      {
        data: priceData.map((point) => point.price),
      },
    ],
  };

  return (
    <View>
      {isOffline && (
        <View>
          <Text>You are offline</Text>
        </View>
      )}
      <Text>Coin Price Chart</Text>
      <Text>Next fetch in: {timer}s</Text>
      {/* <LineChart
        data={data}
        width={screenWidth - 20}
        height={220}
        chartConfig={chartConfig}
      /> */}
      <Text>{JSON.stringify(priceData)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  offlineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  offlineText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ChartScreen;


const TestScreen = () => {
  return (
    <View >
      <Text>Holaa</Text>
    </View>
  );
};

// export default ChartScreen;
