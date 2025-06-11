const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    members: {
        type: Number,
        required: true,
        min: 1
    },
    vehicles: {
        type: Number,
        default: 0
    },
    portion: {
        type: String,
        required: true,
        enum: ['Front Portion', 'Back Portion', 'Roof Room']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    rent: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Tenant', tenantSchema); 