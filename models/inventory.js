// models/inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    userId: { type: String, required: true }, // User's Discord ID
    items: [{ 
        itemId: String, // ID of the item from the shopItem collection
        name: String,   // Item name
        quantity: { type: Number, default: 1 } // Quantity of the item owned
    }]
});

module.exports = mongoose.model('Inventory', inventorySchema);
