import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Pressable,
  Image,
  FlatList,
} from "react-native";
import { useState, useEffect } from "react";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import { myTopTracks, albumTracks } from "./utils/apiOptions";
import { REDIRECT_URI, SCOPES, CLIENT_ID, ALBUM_ID } from "./utils/constants";
import millisToMinutesAndSeconds from "./utils/millisToMinuteSeconds";
import Colors from "./Themes/colors";
import Images from "./Themes/images";
import { Webview } from "react-native-webview";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

// Endpoints for authorizing with Spotify
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export default function App() {
  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: CLIENT_ID,
      scopes: SCOPES,
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: REDIRECT_URI,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      setToken(access_token);
    }
  }, [response]);

  useEffect(() => {
    if (token) {
      // TODO: Select which option you want: Top Tracks or Album Tracks

      // Comment out the one you are not using
      // myTopTracks(setTracks, token);
      albumTracks(ALBUM_ID, setTracks, token);
    }
  }, [token]);

  function SpotifyAuthButton() {
    return (
      <View style={styles.container}>
        <Pressable onPress={promptAsync} style={styles.button}>
          <View style={styles.buttonContent}>
            <Image
              style={{ height: "100%", width: "8%", resizeMode: "contain" }}
              source={Images.spotify}
            />
            <Text style={{ fontWeight: "bold", color: "white", fontSize: 12 }}>
              CONNECT WITH SPOTIFY
            </Text>
          </View>
        </Pressable>
      </View>
    );
  }

  function Details({ navigation, route }) {
    return <Webview source={{ uri: route.params.data }}></Webview>;
  }

  function Preview({ navigation, route }) {
    return <Webview source={{ uri: route.params.data }}></Webview>;
  }

  function SongList() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Image
            style={{
              height: "100%",
              width: "8%",
              resizeMode: "contain",
              margin: 2,
            }}
            source={Images.spotify}
          />
          <Text style={{ fontWeight: "bold", color: "white", fontSize: 20 }}>
            TWOPOINTFIVE
          </Text>
        </View>
        <FlatList
          data={tracks}
          renderItem={({ item }) => renderItem(item)}
          keyExtractor={(item) => item.id}
        />
      </SafeAreaView>
    );
  }

  const renderItem = (item) => (
    <Songs
      name={item.name}
      url={item.album.images[0].url}
      track_number={item.track_number}
      album={item.album.name}
      artists={item.artists[0].name}
      duration={millisToMinutesAndSeconds(item.duration_ms)}
      id={item.id}
      external_urls={item.external_urls}
      preview_url={item.preview_url}
    />
  );

  let contentDisplayed = null;

  if (token) {
    contentDisplayed = SongList;
  } else {
    contentDisplayed = SpotifyAuthButton;
  }

  function Songs(
    {
      name,
      url,
      track_number,
      album,
      artists,
      duration,
      id,
      external_urls,
      preview_url,
    },
    { navigation }
  ) {
    return (
      <Pressable
        onPress={() => navigation.navigate("Details", { data: external_urls })}
      >
        <View style={styles.track}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("Preview", { data: preview_url });
            }}
          >
            <Ionicons name="md-play-circle" size={24} color={Colors.spotify} />
          </Pressable>
          <Image
            style={styles.image}
            source={{
              uri: url,
            }}
          />
          <View>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.artist}>{artists}</Text>
          </View>
          <Text style={styles.album} numberOfLines={1}>
            {album}
          </Text>
          <Text style={styles.duration}>{duration}</Text>
        </View>
      </Pressable>
    );
  }

  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="contentDisplayed"
          component={contentDisplayed}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="Preview" component={Preview} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },

  button: {
    backgroundColor: Colors.spotify,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 99999,
  },

  buttonContent: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
  },

  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "3%",
  },

  track: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "2%",
    width: "100%",
  },
  tracknum: {
    fontSize: 16,
    color: Colors.gray,
    justifyContent: "center",
    alignContent: "center",
    paddingHorizontal: "1%",
    width: 25,
    marginHorizontal: 5,
  },
  album: {
    fontSize: 14,
    color: "white",
    width: 100,
    justifyContent: "flex-start",
    marginHorizontal: 5,
  },
  duration: {
    fontSize: 14,
    color: "white",
    justifyContent: "flex-end",
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: "white",
    justifyContent: "flex-start",
    width: 110,
    marginHorizontal: 5,
  },
  artist: {
    fontSize: 14,
    color: Colors.gray,
    justifyContent: "flex-start",
    width: 110,
    marginHorizontal: 5,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    justifyContent: "flex-start",
    marginHorizontal: 5,
    marginLeft: 16,
  },
});
