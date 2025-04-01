import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import PasswordChangeForm from '../components/Auth/PasswordChangeForm';
import Spinner from '../components/UI/Spinner';

const ProfilePage = () => {
    const { user, isLoading } = useAuth();

    if (isLoading || !user) {
        // Center spinner within the main content area provided by AppLayout
        return (
            <div className="flex justify-center items-center min-h-[300px]">
                <Spinner size="lg" color="border-cyan-700" /> {/* Updated spinner color */}
            </div>
        );
    }

    return (
        // Increased spacing between sections, wider max-width for a more spacious feel
        <div className="max-w-3xl mx-auto space-y-10">
            {/* Larger, bolder title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Profil Používateľa
            </h1>

            {/* Information Card - More padding, softer shadow, larger rounding */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Informácie o účte
                </h2>
                <div className="space-y-4 text-base"> {/* Increased base text size and spacing */}
                    {/* Using flex for better label/value alignment */}
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <span className="font-medium text-gray-600">Používateľské meno:</span>
                        <span className="text-gray-800">{user.username}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <span className="font-medium text-gray-600">Emailová adresa:</span>
                        <span className="text-gray-800">{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3"> {/* No border on last item */}
                        <span className="font-medium text-gray-600">Dátum registrácie:</span>
                        <span className="text-gray-800">{new Date(user.date_registered).toLocaleDateString('sk-SK')}</span> {/* Format date */}
                    </div>
                </div>
                 {/* Consider adding an "Edit Profile" button here later if needed */}
            </div>

            {/* Password Change Card - Consistent styling */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
                 {/* PasswordChangeForm will inherit the container styling */}
                <PasswordChangeForm />
            </div>
        </div>
    );
};

export default ProfilePage;