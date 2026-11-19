
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();

const users = [];

const JWT_SECRET = 'bookshop_secret_key';

// Check whether username is already registered
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Check username and password
const authenticatedUser = (username, password) => {
    return users.some(user =>
        user.username === username && user.password === password
    );
};

// Login registered users
regd_users.post('/login', (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: 'Invalid username or password'
        });
    }

    const token = jwt.sign(
        { username },
        JWT_SECRET,
        { expiresIn: '2h' }
    );

    req.session.authorization = {
        token,
        username
    };

    return res.status(200).json({
        message: 'User successfully logged in',
        token
    });
});

// Add or update a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    const review = req.body && req.body.review;

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    if (typeof review !== 'string' || !review.trim()) {
        return res.status(400).json({
            message: 'A valid review is required'
        });
    }

    const username = req.authUser.username;

    if (!book.reviews) {
        book.reviews = {};
    }

    book.reviews[username] = review.trim();

    return res.status(200).json({
        message: 'Review successfully added/updated',
        reviews: book.reviews
    });
});

// Delete a review belonging to the logged-in user
regd_users.delete('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    const username = req.authUser.username;

    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({
            message: 'No review found for this user'
        });
    }

    delete book.reviews[username];

    return res.status(200).json({
        message: 'Review successfully deleted',
        reviews: book.reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.JWT_SECRET = JWT_SECRET;
