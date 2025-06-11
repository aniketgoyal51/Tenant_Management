import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { tenantAPI, unitAPI, paymentAPI } from '../services/api';
import BreakdownModal from '../components/BreakdownModal';

const portionCards = [
    { title: 'Front Portion', color: 'from-pink-400 to-pink-500' },
    { title: 'Back Portion', color: 'from-green-400 to-green-500' },
    { title: 'Roof Room', color: 'from-yellow-400 to-yellow-500' },
];

function Home() {
    const navigate = useNavigate();
    const month = new Date().toLocaleString('default', { month: 'long' });
    const year = new Date().getFullYear();
    const [tenants, setTenants] = useState([]);
    const [units, setUnits] = useState({});
    const [payments, setPayments] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tenantsRes, unitsRes, paymentsRes] = await Promise.all([
                tenantAPI.getAll(),
                unitAPI.getAll(),
                paymentAPI.getAll()
            ]);

            setTenants(tenantsRes.data);

            // Organize units by tenant
            const unitsByTenant = {};
            unitsRes.data.forEach(unit => {
                if (!unitsByTenant[unit.tenant._id]) {
                    unitsByTenant[unit.tenant._id] = {};
                }
                unitsByTenant[unit.tenant._id][`${unit.month}-${unit.year}`] = unit;
            });
            setUnits(unitsByTenant);

            // Organize payments by tenant
            const paymentsByTenant = {};
            paymentsRes.data.forEach(payment => {
                if (!paymentsByTenant[payment.tenant._id]) {
                    paymentsByTenant[payment.tenant._id] = {};
                }
                paymentsByTenant[payment.tenant._id][`${payment.month}-${payment.year}`] = payment;
            });
            setPayments(paymentsByTenant);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUnitChange = async (tenantId, value) => {
        try {
            const unitData = {
                tenantId,
                month,
                year,
                units: parseInt(value),
                rate: 10, // You might want to make this configurable
            };

            const existingUnit = units[tenantId]?.[`${month}-${year}`];
            if (existingUnit) {
                await unitAPI.update(existingUnit._id, { units: parseInt(value) });
            } else {
                await unitAPI.create(unitData);
            }

            // Refresh data
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handlePaymentUpdate = async (tenantId, isPaid) => {
        try {
            const paymentData = {
                tenantId,
                month,
                year,
                amount: units[tenantId]?.[`${month}-${year}`]?.totalAmount || 0,
                paymentMethod: 'Cash',
                isUnitPayment: true
            };

            const existingPayment = payments[tenantId]?.[`${month}-${year}`];
            if (existingPayment) {
                await paymentAPI.update(existingPayment._id, { status: isPaid ? 'Completed' : 'Pending' });
            } else {
                await paymentAPI.create(paymentData);
            }

            // Refresh data
            fetchData();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-semibold text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-semibold text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-8">
            <div className="max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        🏠 Tenant Management
                    </h1>
                    <button
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500"
                        onClick={() => navigate('/add_Tenant')}
                    >
                        ➕ Add Tenant
                    </button>
                </div>

                {/* Cards */}
                <div className="flex flex-wrap gap-6 justify-center">
                    {portionCards.map((card, index) => {
                        const portionTenants = tenants.filter(tenant => tenant.portion === card.title);
                        return portionTenants.map(tenant => (
                            <TenantCard
                                key={tenant._id}
                                tenant={tenant}
                                members={tenant.members}
                                month={month}
                                year={year}
                                portion={tenant.portion}
                                color={card.color}
                                units={units[tenant._id]?.[`${month}-${year}`]}
                                payment={payments[tenant._id]?.[`${month}-${year}`]}
                                onUnitChange={handleUnitChange}
                                onPaymentUpdate={handlePaymentUpdate}
                            />
                        ));
                    })}
                </div>
            </div>
        </div>
    );
}

function TenantCard({ tenant, members, month, year, portion, color, units, payment, onUnitChange, onPaymentUpdate }) {
    const [electricityDisplay, setElectricityDisplay] = useState(false);
    const [paymentDisplay, setPaymentDisplay] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [additionalCharges, setAdditionalCharges] = useState({
        maintenance: 500,
        waterBill: members * 100,
        rent: 5000 // Adding default rent
    });

    const calculateTotal = () => {
        const electricityBill = units * 100 || 0;
        return electricityBill + additionalCharges.maintenance + additionalCharges.waterBill + additionalCharges.rent;
    };

    const handleAdditionalChargesChange = async (field, value) => {
        const newCharges = { ...additionalCharges, [field]: parseFloat(value) || 0 };
        setAdditionalCharges(newCharges);

        try {
            await unitAPI.update(units._id, {
                maintenance: newCharges.maintenance,
                waterBill: newCharges.waterBill,
                otherCharges: newCharges.otherCharges
            });
        } catch (err) {
            console.error('Error updating charges:', err);
        }
    };

    return (
        <>
            <div className="flex-none w-80 sm:w-96 rounded-3xl bg-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-100">
                {/* Header */}
                <div className={`rounded-t-3xl p-5 bg-gradient-to-r ${color} text-white`}>
                    <h2 className="text-2xl font-semibold">{tenant.portion}</h2>
                    <p className="text-sm opacity-80">Unit Overview</p>
                </div>

                {/* Avatar */}
                <div className="w-24 h-24 mx-auto -mt-12 rounded-full overflow-hidden ring-4 ring-white shadow-md">
                    <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(tenant.name)}`}
                        alt="Tenant"
                        className="w-full h-full object-cover bg-white"
                    />
                </div>

                {/* Body */}
                <div className="p-6 space-y-3 text-gray-700 text-sm">
                    <InfoRow label="👤 Name:" value={tenant.name} />
                    <InfoRow label="📞 Phone:" value={tenant.phone} />
                    <InfoRow label="📅 Start Date:" value={new Date(tenant.startDate).toLocaleDateString()} />
                    <InfoRow label="👥 Members:" value={tenant.members} />
                    <InfoRow label="🚗 Vehicles:" value={tenant.vehicles} />

                    {/* Units Input */}
                    <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-dashed border-blue-200">
                        <h3 className="text-base font-semibold text-blue-800 mb-2">
                            📆 Month: {month}
                        </h3>
                        <div className="flex items-center gap-2">
                            {electricityDisplay ? (
                                <>
                                    <label className="text-gray-600 text-sm">⚡ Units:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={units?.units || ''}
                                        onChange={(e) => onUnitChange(tenant._id, e.target.value)}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                                    />
                                    <button
                                        className="bg-green-500 text-white px-3 py-2 rounded-lg"
                                        onClick={() => setElectricityDisplay(false)}
                                    >
                                        Save
                                    </button>
                                </>
                            ) : (
                                <button
                                    className='bg-blue-500 text-white px-4 py-2 rounded-lg'
                                    onClick={() => setElectricityDisplay(true)}
                                >
                                    {units ? 'Update Units' : 'Enter Units'}
                                </button>
                            )}
                        </div>

                        {/* Total Amount Button */}
                        <div className="mt-4">
                            <button
                                onClick={() => setShowBreakdown(true)}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500"
                            >
                                <div className="flex justify-between items-center">
                                    <span>Total Amount</span>
                                    <span className="font-bold text-lg">₹{calculateTotal()}</span>
                                </div>
                            </button>
                        </div>

                        {/* Payment Status */}
                        <div className="flex items-center gap-2 mt-4">
                            {paymentDisplay ? (
                                <>
                                    <label className="text-gray-600 text-sm">💰 Payment Status:</label>
                                    <select
                                        value={payment?.status || 'Pending'}
                                        onChange={(e) => onPaymentUpdate(tenant._id, e.target.value === 'Completed')}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                    <select
                                        value={payment?.method || 'Cash'}
                                        onChange={(e) => onPaymentUpdate(tenant._id, e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="Bank">Bank</option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                    <button
                                        className="bg-green-500 text-white px-3 py-2 rounded-lg"
                                        onClick={() => setPaymentDisplay(false)}
                                    >
                                        Save
                                    </button>
                                </>
                            ) : (
                                <button
                                    className='bg-blue-500 text-white px-4 py-2 rounded-lg'
                                    onClick={() => setPaymentDisplay(true)}
                                >
                                    {payment ? 'Update Payment' : 'Add Payment'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Breakdown Modal */}
            <BreakdownModal
                isOpen={showBreakdown}
                onClose={() => setShowBreakdown(false)}
                unit={{
                    breakdown: {
                        electricityBill: units * 100,
                        maintenance: portion !== 'Roof Room' ? additionalCharges.maintenance : 0,
                        waterBill: additionalCharges.waterBill,
                        rent: additionalCharges.rent,
                        otherCharges: 0
                    }
                }}
            />
        </>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className="text-gray-900 font-medium text-sm">{value}</span>
        </div>
    );
}

export default Home;
