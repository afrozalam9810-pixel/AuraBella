"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Critical root collapse:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Critical Error | AuraBella</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body {
            background-color: #0b0713;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
          }
          .container {
            max-width: 480px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
          }
          .icon {
            font-size: 48px;
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          .title {
            font-size: 28px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0 0 8px 0;
          }
          .desc {
            color: #9d8bbb;
            font-style: italic;
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
          }
          .btn {
            background: linear-gradient(135deg, #7c3aed 0%, #d946ef 100%);
            border: none;
            color: #ffffff;
            padding: 12px 28px;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.1em;
            border-radius: 9999px;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .btn:hover {
            opacity: 0.9;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="icon">⚠️</div>
          <div>
            <h1 className="title">System Error</h1>
            <p className="desc">A critical interface collapse occurred. We are working to restore service alignment.</p>
          </div>
          <button className="btn" onClick={() => reset()}>
            Restore Portal
          </button>
        </div>
      </body>
    </html>
  );
}
