"use client";

import { Suspense } from "react";
import { Provider } from "react-redux";
import store from "../store/store";
import { ThemeProvider } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Toast from "../components/Toast";

export default function AppShell({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Suspense fallback={null}>
          <div className="flex flex-col min-h-screen bg-dark-900">
            <Navbar />
            <Toast />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Suspense>
      </ThemeProvider>
    </Provider>
  );
}
