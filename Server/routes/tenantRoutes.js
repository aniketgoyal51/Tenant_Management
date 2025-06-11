const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');

// Get all tenants
router.get('/', async (req, res) => {
    try {
        const tenants = await Tenant.find().sort({ createdAt: -1 });
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get tenant by ID
router.get('/:id', async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new tenant
router.post('/', async (req, res) => {
    let rent = 0;
    if (req.body.portion === 'Front Portion') {
        rent = 10000;
    } else if (req.body.portion === 'Back Portion') {
        rent = 8000;
    } else if (req.body.portion === 'Roof Room') {
        rent = 3000;
    }

    const tenant = new Tenant({
        name: req.body.name,
        phone: req.body.phone,
        startDate: req.body.startDate,
        members: req.body.members,
        vehicles: req.body.vehicles,
        portion: req.body.portion,
        rent: rent
    });


    try {
        const newTenant = await tenant.save();
        res.status(201).json(newTenant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update tenant
router.patch('/:id', async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        Object.keys(req.body).forEach(key => {
            tenant[key] = req.body[key];
        });

        const updatedTenant = await tenant.save();
        res.json(updatedTenant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete tenant
router.delete('/:id', async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        await tenant.remove();
        res.json({ message: 'Tenant deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 