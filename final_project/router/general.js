const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: 'User already exists'
        });
    }

    users.push({ username, password });

    return res.status(201).json({
        message: 'User successfully registered. Now you can login'
    });
});

// Retrieve all books
public_users.get('/', async (req, res) => {
    try {
        return res.status(200).json(books);
    } catch (error) {
        return res.status(500).json({ message: 'Unable to retrieve books' });
    }
});

// Retrieve book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const book = books[req.params.isbn];

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        return res.status(200).json(book);
    } catch (error) {
        return res.status(500).json({ message: 'Unable to retrieve book' });
    }
});

// Retrieve books by author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = decodeURIComponent(req.params.author).toLowerCase();

        const result = Object.entries(books).filter(([isbn, book]) =>
            String(book.author).toLowerCase().includes(author)
        );

        if (result.length === 0) {
            return res.status(404).json({ message: 'No books found for this author' });
        }

        return res.status(200).json(Object.fromEntries(result));
    } catch (error) {
        return res.status(500).json({ message: 'Unable to search books' });
    }
});

// Retrieve books by title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = decodeURIComponent(req.params.title).toLowerCase();

        const result = Object.entries(books).filter(([isbn, book]) =>
            String(book.title).toLowerCase().includes(title)
        );

        if (result.length === 0) {
            return res.status(404).json({ message: 'No books found for this title' });
        }

        return res.status(200).json(Object.fromEntries(result));
    } catch (error) {
        return res.status(500).json({ message: 'Unable to search books' });
    }
});

// Axios-based asynchronous book retrieval routes

const API_BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}`;

// Retrieve all books using Axios
public_users.get('/async', async (req, res) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Unable to retrieve books' }
        );
    }
});

// Retrieve book by ISBN using Axios
public_users.get('/async/isbn/:isbn', async (req, res) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/isbn/${encodeURIComponent(req.params.isbn)}`
        );
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Unable to retrieve book' }
        );
    }
});

// Retrieve books by author using Axios
public_users.get('/async/author/:author', async (req, res) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/author/${encodeURIComponent(req.params.author)}`
        );
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Unable to retrieve books by author' }
        );
    }
});

// Retrieve books by title using Axios
public_users.get('/async/title/:title', async (req, res) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/title/${encodeURIComponent(req.params.title)}`
        );
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json(
            error.response?.data || { message: 'Unable to retrieve books by title' }
        );
    }
});

// Retrieve reviews for a specific book
public_users.get('/review/:isbn', (req, res) => {
    const book = books[req.params.isbn];

    if (!book) {
        return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;
