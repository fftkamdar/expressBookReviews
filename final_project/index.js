
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const JWT_SECRET = require('./router/auth_users.js').JWT_SECRET;

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
    '/customer',
    session({
        secret: 'fingerprint_customer',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax'
        }
    })
);

// Authenticate protected customer routes
app.use('/customer/auth/*', (req, res, next) => {
    const authorization = req.headers.authorization;

    let token = null;

    if (req.session.authorization) {
        token = req.session.authorization.token;
    }

    if (!token && authorization && authorization.startsWith('Bearer ')) {
        token = authorization.substring(7);
    }

    if (!token) {
        return res.status(401).json({
            message: 'Authentication required. Please login first.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.authUser = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
