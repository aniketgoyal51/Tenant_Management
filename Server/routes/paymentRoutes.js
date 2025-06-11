const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Unit = require('../models/Unit');

// Get all payments
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('tenant', 'name portion')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get payments by tenant ID
router.get('/tenant/:tenantId', async (req, res) => {
    try {
        const payments = await Payment.find({ tenant: req.params.tenantId })
            .sort({ year: -1, month: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new payment
router.post('/', async (req, res) => {
    const payment = new Payment({
        tenant: req.body.tenantId,
        month: req.body.month,
        year: req.body.year,
        amount: req.body.amount,
        paymentMethod: req.body.paymentMethod,
        notes: req.body.notes
    });

    try {
        const newPayment = await payment.save();

        // Update unit payment status if payment is for units
        if (req.body.isUnitPayment) {
            await Unit.findOneAndUpdate(
                {
                    tenant: req.body.tenantId,
                    month: req.body.month,
                    year: req.body.year
                },
                { isPaid: true }
            );
        }

        res.status(201).json(newPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update payment status
router.patch('/:id', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (req.body.status) {
            payment.status = req.body.status;
        }
        if (req.body.notes) {
            payment.notes = req.body.notes;
        }

        const updatedPayment = await payment.save();
        res.json(updatedPayment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete payment
router.delete('/:id', async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        await payment.remove();
        res.json({ message: 'Payment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 