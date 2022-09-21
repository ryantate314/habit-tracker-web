import authConfig from "./../../auth_config.json";

export const environment = {
  production: true,
  googleClientId: authConfig.googleClientId,
  apiUrl: "https://ryantate314.ddns.net/habits-api/api/v1"
};
