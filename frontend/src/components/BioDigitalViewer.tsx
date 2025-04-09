"use client";

import React, { useEffect, useRef, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_BIODIGITAL_API_KEY; // Securely Load API Key
const MODEL_ID = "62qU"; // Your BioDigital Model ID
const ROTATION_DELAY = 2000; // Delay in milliseconds (2 seconds)

const BioDigitalViewer = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "READY") {
        console.log("✅ BioDigital Viewer Ready!");
        setViewerReady(true);
      }
    };

    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  useEffect(() => {
    if (!viewerReady || !iframeRef.current) return;

    const rotateModel = () => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "ROTATE",
          data: { axis: "y", degrees: 10 }, // Rotate 10 degrees on Y-axis
        },
        "*"
      );
    };

    // Rotate every ROTATION_DELAY milliseconds
    const rotationInterval = setInterval(rotateModel, ROTATION_DELAY);

    return () => clearInterval(rotationInterval);
  }, [viewerReady]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <iframe
        ref={iframeRef}
        id="embedded-human"
        frameBorder="0"
        width="100%"
        height="100%"
        allowFullScreen={true}
        loading="lazy"
        src={`https://human.biodigital.com/viewer/?id=${MODEL_ID}&apiKey=${API_KEY}&ui-anatomy-descriptions=true&ui-anatomy-pronunciations=true&ui-anatomy-labels=true&ui-audio=true&ui-chapter-list=false&ui-fullscreen=true&ui-help=true&ui-info=true&ui-label-list=true&ui-layers=true&ui-skin-layers=true&ui-loader=circle&ui-media-controls=full&ui-menu=true&ui-nav=true&ui-search=true&ui-tools=true&ui-tutorial=true&ui-undo=true&ui-whiteboard=true&initial.hand=true&disable-scroll=false&load-rotate=10&uaid=M1qty&paid=o_13e57052`}
      ></iframe>
    </div>
  );
};

export default BioDigitalViewer;
