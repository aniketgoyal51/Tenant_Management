const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    units: {
        type: Number,
        required: true,
        min: 0
    },
    rate: {
        type: Number,
        required: true,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    breakdown: {
        electricityBill: {
            type: Number,
            required: true
        },
        maintenance: {
            type: Number,
            required: true,
            default: 0
        },
        waterBill: {
            type: Number,
            required: true,
            default: 0
        },
        otherCharges: {
            type: Number,
            required: true,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Create compound index for tenant, month, and year
unitSchema.index({ tenant: 1, month: 1, year: 1 }, { unique: true });

// Pre-save middleware to calculate total amount
unitSchema.pre('save', function (next) {
    const { electricityBill, maintenance, waterBill, otherCharges } = this.breakdown;
    this.totalAmount = electricityBill + maintenance + waterBill + otherCharges;
    next();
});

module.exports = mongoose.model('Unit', unitSchema); 