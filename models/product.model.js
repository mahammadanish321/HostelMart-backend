import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true,
            maxlength: [100, 'Product name cannot exceed 100 characters'],
        },
        description: {
            type: String,
            default: '',
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
            min: [0, 'Price cannot be negative'],
        },
        originalPrice: {
            type: Number,
            min: [0, 'Original price cannot be negative'],
        },
        productImages: {
            type: [String], // Cloudinary image URLs
            default: [],
            validate: {
                validator: function (images) {
                    return images.length > 0 || Boolean(this.productVideo?.url);
                },
                message: 'Please provide at least one product image or video',
            },
        },
        productVideo: {
            url: {
                type: String,
                trim: true,
            },
            duration: {
                type: Number,
                min: 0,
                max: [120, 'Product video cannot exceed 120 seconds'],
            },
        },
        category: {
            type: String,
            enum: {
                values: [
                    'electronics',
                    'clothing',
                    'food',
                    'books',
                    'furniture',
                    'mobility',
                    'housing',
                    'mess',
                    'hostel',
                    'hotel',
                    'other'
                ],
                message: '{VALUE} is not a valid product category',
            },
            default: 'other',
        },
        condition: {
            type: String,
            enum: [
                'Brand New',
                'Like New',
                'Gently Used',
                'Good Condition',
                'Used',
                'For Rent',
                'Other'
            ],
            default: 'Brand New',
        },
        listingType: {
            type: String,
            enum: ['sell', 'rent'],
            default: 'sell',
        },
        inStock: {
            type: Boolean,
            default: true,
        },
        quantity: {
            type: Number,
            default: 1,
            min: [0, 'Quantity cannot be negative'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        location: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(document, ret) {
                delete ret.__v;
                return ret;
            },
        },
    }
);


export const Product = mongoose.model("Product", productSchema);