import React from 'react';

function BreakdownModal({ isOpen, onClose, unit }) {
    if (!isOpen) return null;

    const { breakdown } = unit;
    const total = breakdown.electricityBill + breakdown.maintenance + breakdown.waterBill + breakdown.otherCharges + breakdown.rent;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Bill Breakdown</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Rent</span>
                        <span className="font-semibold">₹{breakdown.rent}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Electricity Bill</span>
                        <span className="font-semibold">₹{breakdown.electricityBill}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Maintenance</span>
                        <span className="font-semibold">₹{breakdown.maintenance}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Water Bill</span>
                        <span className="font-semibold">₹{breakdown.waterBill}</span>
                    </div>
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Total Amount</span>
                            <span className="text-lg font-bold text-blue-600">₹{total}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BreakdownModal; 