const { Readable } = require('stream');
const cloudinary = require("./cloudinary");

const handleFileUploads = async (files) => {
    let brandLogoUrl = "";
    let imageUrls = [];

    // Helper function to upload a buffer to Cloudinary using streams
    const uploadToCloudinary = (buffer, options) => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                ...options,
                transformation: [
                    {
                        overlay: { public_id: "FullLogo_s0dndn" },
                        gravity: "center",
                        width: 150, // small logo
                    }
                ]
            },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            const readableStream = new Readable();
            readableStream.push(buffer); // Push the buffer into the stream
            readableStream.push(null);   // Signal the end of the stream
            readableStream.pipe(uploadStream); // Pipe the stream to Cloudinary
        });
    };

    try {
        // Upload brand logo (optional)
        if (files?.brandLogo?.length > 0) {
            const brandLogoFile = files.brandLogo[0];
            const brandLogoResult = await uploadToCloudinary(brandLogoFile.buffer, {
                folder: "product_logos",
                resource_type: "image",
            });
            brandLogoUrl = brandLogoResult.secure_url;
        }

        // Upload product images (optional)
        if (files?.images?.length > 0) {
            const uploadPromises = files.images.map(file =>
                uploadToCloudinary(file.buffer, {
                    folder: "product_images",
                    resource_type: "image",
                })
            );
            const results = await Promise.all(uploadPromises);
            imageUrls = results.map(result => result.secure_url);
        }

        return { brandLogoUrl, imageUrls };
    } catch (error) {
        throw new Error(`Failed to upload files to Cloudinary: ${error.message}`);
    }
};

module.exports = handleFileUploads;