import authConfig from "./../../auth_config.json";

export const environment = {
  production: true,
  googleClientId: authConfig.googleClientId,
  apiUrl: "http://localhost:4100/api/v1"
};
