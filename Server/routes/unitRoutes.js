const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');

// Get all units
router.get('/', async (req, res) => {
    try {
        const units = await Unit.find()
            .populate('tenant', 'name portion')
            .sort({ createdAt: -1 });
        res.json(units);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get units by tenant ID
router.get('/tenant/:tenantId', async (req, res) => {
    try {
        const units = await Unit.find({ tenant: req.params.tenantId })
            .sort({ year: -1, month: -1 });
        res.json(units);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new unit record
router.post('/', async (req, res) => {
    const { units, rate, maintenance, waterBill, otherCharges } = req.body;
    const electricityBill = units * rate;

    const unit = new Unit({
        tenant: req.body.tenantId,
        month: req.body.month,
        year: req.body.year,
        units,
        rate,
        breakdown: {
            electricityBill,
            maintenance: maintenance || 0,
            waterBill: waterBill || 0,
            otherCharges: otherCharges || 0
        }
    });

    try {
        const newUnit = await unit.save();
        res.status(201).json(newUnit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update unit record
router.patch('/:id', async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ message: 'Unit record not found' });
        }

        if (req.body.units) {
            unit.units = req.body.units;
            unit.breakdown.electricityBill = req.body.units * unit.rate;
        }
        if (req.body.rate) {
            unit.rate = req.body.rate;
            unit.breakdown.electricityBill = unit.units * req.body.rate;
        }
        if (req.body.maintenance !== undefined) {
            unit.breakdown.maintenance = req.body.maintenance;
        }
        if (req.body.waterBill !== undefined) {
            unit.breakdown.waterBill = req.body.waterBill;
        }
        if (req.body.otherCharges !== undefined) {
            unit.breakdown.otherCharges = req.body.otherCharges;
        }
        if (req.body.isPaid !== undefined) {
            unit.isPaid = req.body.isPaid;
        }

        const updatedUnit = await unit.save();
        res.json(updatedUnit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete unit record
router.delete('/:id', async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ message: 'Unit record not found' });
        }

        await unit.remove();
        res.json({ message: 'Unit record deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 