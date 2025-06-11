const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'UPI'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Create compound index for tenant, month, and year
paymentSchema.index({ tenant: 1, month: 1, year: 1 });

module.exports = mongoose.model('Payment', paymentSchema); 