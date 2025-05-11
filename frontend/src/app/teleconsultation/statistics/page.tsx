'use client';

import React, { useState, useEffect } from 'react';
import ConsultationStats from '@/components/teleconsultation/ConsultationStats';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const StatisticsPage: React.FC = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserSession = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('No token found, redirecting to login');
                    router.push('/signin?redirect=/teleconsultation/statistics');
                    return;
                }

                console.log('Fetching user session...');
                const response = await axios.get('http://localhost:3000/user/session', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('User session response:', response.data);
                if (response.data?.user?.userId) {
                    setUserId(response.data.user.userId);
                    console.log('User ID set:', response.data.user.userId);
                } else {
                    console.error('User ID not found in response:', response.data);
                    setError('Unable to get user information');
                    router.push('/signin?redirect=/teleconsultation/statistics');
                }
            } catch (error: any) {
                console.error('Error fetching user session:', error);
                setError(error.message || 'Error fetching user session');

                // Check if it's an authentication error
                if (error.response?.status === 401) {
                    console.log('Authentication error, redirecting to login');
                    localStorage.removeItem('token'); // Clear invalid token
                    router.push('/signin?redirect=/teleconsultation/statistics');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserSession();
    }, [router]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error || !userId) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error || 'User not authenticated'}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Teleconsultation Statistics</h1>
            <ConsultationStats doctorId={userId} />
        </div>
    );
};

export default StatisticsPage;
