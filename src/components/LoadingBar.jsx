import React from 'react'
import { useState, useEffect } from 'react';

const LoadingBar = ({ isDone }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval;

    if (!isDone) {
      // Fill gradually up to 90%
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) {
            return prev + 5;
          }
          return prev;
        });
      }, 200);
    } else {
      // When process is done → fill to 100%
      setProgress(100);
    }

    return () => clearInterval(interval);
  }, [isDone]);

  return (
    <div className="w-80 bg-gray-300 h-4 rounded-lg overflow-hidden mt-4">
      <div
        className="h-4 bg-[#9898D9] transition-all duration-500"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default LoadingBar
