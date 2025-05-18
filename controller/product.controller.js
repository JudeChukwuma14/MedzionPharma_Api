const Product = require("../model/product.model");
const userAuth = require("../model/auth.model");
const upload = require("../lib/multer");
const handleFileUploads = require("../lib/handlefile");

const updateProduct = async (req, res) => {
    try {
        // Check authentication
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        // Verify admin role
        const accountId = req.user.id;
        const checkUser = await userAuth.findById(accountId);
        if (!checkUser || checkUser.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized: Only admins can update products", success: false });
        }

        // Check product existence
        const updateId = req.params.productId;
        const checkProduct = await Product.findById(updateId);
        if (!checkProduct) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        // Define allowed fields to update (from frontend and schema)
        const allowedFields = [
            'name', 'category', 'brandName', 'stock', 'price', 'description', 'costPrice',
            'weight', 'containerType', 'productForm', 'featured', 'published'
        ];
        const updateFields = {};
        Object.keys(req.body).forEach(key => {
            // Map frontend 'brand' to 'brandName'
            const field = key === 'brand' ? 'brandName' : key;
            if (allowedFields.includes(field)) {
                updateFields[field] = req.body[key];
            }
        });

        // Handle file uploads if provided
        if (req.files) {
            if (req.files.brandLogo) {
                updateFields.brandLogo = req.files.brandLogo[0].path;
            }
            if (req.files.images) {
                updateFields.images = req.files.images.map(file => file.path);
            }
        }

        // Set updatedBy
        updateFields.updatedBy = accountId;

        // Update product using findByIdAndUpdate for atomic operation
        const updatedProduct = await Product.findByIdAndUpdate(
            updateId,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: "Product updated successfully",
            success: true,
            product: updatedProduct
        });
    } catch (error) {
        // Differentiate validation errors
        if (error.name === 'ValidationError') {
            return res.status(422).json({ message: error.message, success: false });
        }
        return res.status(500).json({ message: "Server error", success: false, error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        // Check authentication
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        // Verify admin role
        const accountId = req.user.id;
        const checkUser = await userAuth.findById(accountId);
        if (!checkUser || checkUser.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized: Only admins can delete products", success: false });
        }

        // Delete product
        const deleteId = req.params.productId;
        const deletedProduct = await Product.findByIdAndDelete(deleteId);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        return res.status(200).json({ message: "Product deleted successfully", success: true });
    } catch (error) {
        return res.status(500).json({ message: "Server error", success: false, error: error.message });
    }
};

const getAllProduct = async (req, res) => {
    try {
        const allProducts = await Product.find()
            .select('-__v') // Exclude version key if not needed
            .lean(); // Convert to plain JavaScript objects for better performance

        const products = allProducts.map(item => ({
            ...item,
            oneImageUrl: item.images[0] || "",
        }));

        return res.status(200).json({ products, success: true, count: products.length });
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
};

const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false });
        }

        return res.status(200).json({ product, success: true });
    } catch (error) {
        return res.status(400).json({ message: error.message, success: false });
    }
};

const createProduct = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false
            });
        }
        const accountId = req.user.id;
        const user = await userAuth.findById(accountId);
        if (!user || user.role !== "admin") {
            return res.status(401).json({
                message: "Unauthorized: Only admins can create products",
                success: false
            });
        }

        await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        const { brandLogoUrl, imageUrls } = await handleFileUploads(req.files);
        const productData = {
            ...req.body,
            brandLogo: brandLogoUrl,
            images: imageUrls,
        };

        const newProduct = await Product.create(productData);


        return res.status(201).json({
            message: "Product created successfully",
            success: true,
            product: newProduct
        });

    } catch (error) {
        return res.status(500).json({
            message: "An error occurred while creating the product",
            success: false,
            error: error.message
        });
    }
};



const searchProduct = async (req, res) => {
    try {
        const { query, brandName, category, minPrice, maxPrice, inStock } = req.query;
        let filter = {};

        // General search query for name, description, or category
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
            ];
        }

        // BrandName filter
        if (brandName && brandName !== 'all') {
            filter.brandName = { $regex: brandName, $options: 'i' };
        }

        // Category filter
        if (category && category !== 'all') {
            filter.category = { $regex: category, $options: 'i' };
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice && !isNaN(minPrice)) {
                filter.price.$gte = parseFloat(minPrice);
            }
            if (maxPrice && !isNaN(maxPrice)) {
                filter.price.$lte = parseFloat(maxPrice);
            }
        }

        // InStock filter
        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
        }

        // Execute the query
        const products = await Product.find(filter);

        // Send response
        return res.status(200).json({ products, success: true });
    } catch (error) {
        console.error('Error searching products:', error.message);
        return res.status(400).json({ message: error.message, success: false });
    }
};

module.exports = { searchProduct };




module.exports = {
    updateProduct,
    deleteProduct,
    getAllProduct,
    getProductById,
    createProduct,
    searchProduct
};