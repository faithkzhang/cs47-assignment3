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
import Songs from "./Songs";
import { Webview } from "react-native-webview";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

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
    );
  }

  function SongList() {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }
  console.log(tracks);
  const renderItem = (item) => (
    <Pressable onPress={() => {
      navigation.navigate('ItemDetail', {data: item}
    )>
      <Songs
        name={item.name}
        url={item.album.images[0].url}
        track_number={item.track_number}
        album={item.album.name}
        artists={item.artists[0].name}
        duration={millisToMinutesAndSeconds(item.duration_ms)}
        id={item.id}
        details={item.external_urls}
        preview={item.preview_url}
      />
    </Pressable>
  );

  let contentDisplayed = null;

  if (token) {
    contentDisplayed = <SongList />;
  } else {
    contentDisplayed = <SpotifyAuthButton />;
  }

  return (
    <SafeAreaView style={styles.container}>{contentDisplayed}</SafeAreaView>
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
});
