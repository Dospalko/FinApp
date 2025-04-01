import React from "react";
import { Link, Navigate } from "react-router-dom";
import RegisterForm from "../components/Auth/RegisterForm"; // Formulár
import { useAuth } from "../contexts/AuthContext"; // Na kontrolu stavu

const RegisterPage = () => {
  const { isAuthenticated } = useAuth();

  // Ak je už používateľ prihlásený, presmeruj ho na hlavnú stránku
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Registrácia
        </h2>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-gray-500">
          Máte už účet?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Prihláste sa
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
