"use client";
import { Component } from "react";
import { CONTACT_EMAIL, WA_URL } from "@/config";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Algo salió mal</h1>
          <p className="text-gray-600 mb-6">
            Ocurrió un error inesperado. Podés volver al inicio o contactarnos si el problema persiste.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleReload}
              className="bg-rose-600 text-white px-6 py-3 rounded-full hover:bg-rose-500 transition font-medium"
            >
              Volver al inicio
            </button>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-50 transition font-medium"
            >
              Contactar por WhatsApp
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-6">
            También podés escribirnos a{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline">{CONTACT_EMAIL}</a>
          </p>
        </div>
      </div>
    );
  }
}
