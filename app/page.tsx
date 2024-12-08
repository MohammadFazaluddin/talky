"use client";
import { GetTranscribedText } from "@/service/whisperservice";
import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { start } from "repl";

export default function Home() {
  const recordBtnRef = useRef<HTMLButtonElement>(null);
  const audioSecRef = useRef<HTMLElement>(null);

  const constraints = { audio: true };
  let audioChunck: BlobPart[] = [];

  let onSucess = function (stream: MediaStream) {
    const mediaRecorder = new MediaRecorder(stream);

    recordBtnRef.current!.onclick = startRecording;

    function startRecording() {
      mediaRecorder.start();
      recordBtnRef.current!.innerText = "Recording...";
      recordBtnRef.current!.style.backgroundColor = "red";

      recordBtnRef.current!.onclick = stopRecord;
    }

    function stopRecord() {
      mediaRecorder.stop();

      recordBtnRef.current!.innerText = "Start";
      recordBtnRef.current!.style.backgroundColor = "white";
      recordBtnRef.current!.onclick = startRecording;
    }

    mediaRecorder.ondataavailable = function (e: BlobEvent) {
      audioChunck.push(e.data);
    };

    mediaRecorder.onstop = async function (e) {
      audioSecRef.current!.innerText = "Transcribing...";
      const container = document.createElement("article");
      const audio = document.createElement("audio");

      audio.setAttribute("controls", "");

      container.appendChild(audio);

      audio.controls = true;
      const blob = new Blob(audioChunck, { type: mediaRecorder.mimeType });

      const blobUrl = window.URL.createObjectURL(blob);
      audio.src = blobUrl;
      audioChunck = [];

      const text = await GetTranscribedText(blob);

      audioSecRef.current!.innerHTML = "";
      const transcribe = document.createElement("div");
      
      if (text) {
        transcribe.innerText = "Transcription: " + text;
      } else {
        transcribe.innerText = "An error occured";
      }

      audioSecRef.current?.append(transcribe);
      audioSecRef.current?.appendChild(container);
    };
  };

  let onError = function (err: any) {
    alert("There was an error, Error: " + err);
  };

  // actual function to record
  navigator.mediaDevices.getUserMedia(constraints).then(onSucess, onError);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <button
          ref={recordBtnRef}
          className="rounded-full p-10 text-black bg-gray-50 m-auto"
        >
          Start
        </button>
        <section ref={audioSecRef}></section>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
