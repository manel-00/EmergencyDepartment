import MortalityPrediction from '@/components/MortalityPrediction';

export default function MortalityPage() {
    return (
        <div className="min-h-screen bg-gray-100 py-12  mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Patient Mortality Prediction</h1>
                    <p className="mt-2 text-gray-600">
                        Enter patient details to predict mortality risk
                    </p>
                </div>
                <MortalityPrediction />
            </div>
        </div>
    );
} 