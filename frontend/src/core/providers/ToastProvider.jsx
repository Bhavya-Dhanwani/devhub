"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function ToastProvider() {
  return (
    <ToastContainer
      autoClose={3500}
      closeOnClick
      newestOnTop
      pauseOnFocusLoss={false}
      position="top-right"
      theme="colored"
    />
  );
}
