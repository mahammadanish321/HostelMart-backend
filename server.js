import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as dbConfig from './config/db.config.js';
import rateLimiter from './middlewares/rateLimiter.js';
import userRoutes from './routers/user.routers.js'
import sellerRouter from "./routers/seller.router.js";
import productRoutes from "./routers/product.routers.js";
import cartRoutes from "./routers/cart.routers.js";
import wishlistRoutes from "./routers/wishlist.router.js";
import orderRoutes from "./routers/order.router.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();


const allowedOrigins = [
    ...(process.env.FRONTEND_URL || "").split(",").map((origin) => origin.trim()),
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:4200',
    'http://127.0.0.1:4200',
].filter(Boolean);


app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
                callback(null, true);
                return;
            }
            callback(new Error('Not allowed by CORS policy'));
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    })
);



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter(200, 15 * 60 * 1000));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        database: dbConfig.isMongoConfigured() ? 'configured' : 'not-configured',
    });
});


// app.use('/api', healthRoutes);
app.use('/api/users', userRoutes);
app.use("/api/sellers", sellerRouter);
app.use('/api/products', productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// Return controller, authentication, and Mongoose errors as JSON
app.use((error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    if (error.name === 'ValidationError' || error.name === 'CastError') statusCode = 400;
    if (error.code === 11000) statusCode = 409;

    const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message;

    res.status(statusCode).json({
        success: false,
        message,
        errors: error.errors || [],
    });
});




const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await dbConfig.connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}


// if (require.main === module) {
//   server = app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
//   });
// }


export default app;
