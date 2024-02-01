import { Environment } from "@/config/environment";

export const endpointPath = `${Environment.apiUrl}/auth`;

export const correctUser = {
  name: "Huilen Solis",
  email: "huilensolis@skiff.com",
  password: Array(16).fill("h").join(""), // we send a password of 16 characteres
};
