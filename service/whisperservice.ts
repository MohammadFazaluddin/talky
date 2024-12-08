"use server"
import { getSecretKey } from "@/utils/openaiutils";
import axios from "axios";

const apiKey = getSecretKey();
const modelName = "whisper-1";

export async function GetTranscribedText(
  blob: Blob
): Promise<string | undefined> {

  let transcribe: string = "";
  const formData = new FormData();
  formData.append("file", blob, "audio.webm");
  formData.append("model", "whisper-1");

  try {
    const response = await axios
      .post("https://api.openai.com/v1/audio/transcriptions", formData, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
      .then((resp) => {
        console.log("res data " + resp.data.text);
        transcribe = resp.data.text;
      });

    return transcribe;
  } catch (err) {
    console.error(err);
  }
}
