export const NASA_API_KEY = "cfXPBhduNhvWeTRgNllsjmdjpLxf2sgdyINNlcrG"; // Substitua pela sua chave API NASA
export const NASA_APOD_URL = "https://api.nasa.gov/planetary/apod";

export const AUTH_CONFIG = {
  clientId: "22332176985-o1m31q76l9psr0o4gep64msps583lnhj.apps.googleusercontent.com", // Substitua pelo seu Client ID OAuth
  redirectUri: "apodapp://callback",
  responseType: "token",
  scopes: ["profile", "email"],
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
};

export const COLORS = {
  primary: "#121212",
  secondary: "#1F2937",
  accent: "#6366F1",
  text: "#F9FAFB",
  textSecondary: "#9CA3AF",
  background: "#000000",
  card: "#1C1C1E",
  border: "#374151",
  notification: "#EF4444",
};

export const COMMON_STYLES = {
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};