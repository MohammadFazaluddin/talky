import { configDotenv } from "dotenv"

export function getSecretKey() {
    return process.env.OPENAI_API
}