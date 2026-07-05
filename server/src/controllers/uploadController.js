const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

// Project root → server/uploads/products
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'products');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !process.env.CLOUDINARY_CLOUD_NAME.includes('placeholder') &&
      !process.env.CLOUDINARY_API_KEY.includes('placeholder') &&
      !process.env.CLOUDINARY_API_SECRET.includes('placeholder')
  );

const extFromMime = (mime) => {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return map[mime] || '';
};

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'stitch-and-bloom/products',
        transformation: [
          {
            width: 1200,
            height: 1200,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            storage: 'cloudinary',
          });
      }
    );
    stream.end(file.buffer);
  });

const uploadToLocal = async (file) => {
  const ext = extFromMime(file.mimetype);
  const id = crypto.randomBytes(16).toString('hex');
  const filename = `${Date.now()}-${id}${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);
  await fs.promises.writeFile(filepath, file.buffer);
  return {
    // Public-facing URL — served by Express static middleware below
    url: `/uploads/products/${filename}`,
    publicId: `local:${filename}`,
    storage: 'local',
  };
};

// @desc    Upload images (Cloudinary if configured, else local disk)
// @route   POST /api/v1/uploads/images
exports.uploadImages = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No images provided');
  }

  const useCloudinary = isCloudinaryConfigured();
  const uploaders = req.files.map((file) =>
    useCloudinary ? uploadToCloudinary(file) : uploadToLocal(file)
  );
  const images = await Promise.all(uploaders);

  res.status(201).json({ success: true, data: images });
});

// @desc    Delete image (handles both Cloudinary and local)
// @route   DELETE /api/v1/uploads/images/:publicId
exports.deleteImage = catchAsync(async (req, res) => {
  const { publicId } = req.params;

  if (publicId.startsWith('local:')) {
    const filename = publicId.slice('local:'.length);
    const filepath = path.join(UPLOADS_DIR, path.basename(filename));
    try {
      await fs.promises.unlink(filepath);
    } catch (err) {
      // Already gone — not fatal
      if (err.code !== 'ENOENT') throw err;
    }
  } else if (publicId.startsWith('external-')) {
    // URL-pasted image — nothing to delete on our side
  } else {
    if (isCloudinaryConfigured()) {
      await cloudinary.uploader.destroy(publicId);
    }
  }

  res.json({ success: true, message: 'Image deleted' });
});
