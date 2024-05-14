const { Contact } = require('../models/contact');

exports.submitContactForm = async (req, res) => {
    try {
        // Extract form data from request body
        const { name, email, message } = req.body;

        // Create a new instance of the Contact model
        const newContact = new Contact({
            name,
            email,
            message
        });

        // Save the new contact entry to the database
        await newContact.save();

        // Send response to client
        res.status(200).json({ message: 'Thank you for contacting us!' });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
};

