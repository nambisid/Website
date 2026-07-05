require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@yumeyarns.com',
      password: 'Admin@123!',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log('Admin user created: admin@yumeyarns.com / Admin@123!');

    // Create test customer
    await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Customer@123!',
      role: 'customer',
      isEmailVerified: true,
    });
    console.log('Test customer created: jane@example.com / Customer@123!');

    // Create categories
    const categories = await Category.create([
      { name: 'Amigurumi', description: 'Adorable crocheted stuffed animals and characters', sortOrder: 1 },
      { name: 'Home Decor', description: 'Beautiful crocheted items for your home', sortOrder: 2 },
      { name: 'Accessories', description: 'Handmade crocheted accessories', sortOrder: 3 },
      { name: 'Baby & Kids', description: 'Soft, safe crocheted items for little ones', sortOrder: 4 },
      { name: 'Seasonal', description: 'Holiday and seasonal crochet creations', sortOrder: 5 },
    ]);
    console.log('Categories created');

    // Create sample products
    const sampleProducts = [
      {
        name: 'Cozy Teddy Bear',
        description: '<p>This adorable hand-crocheted teddy bear is made with 100% cotton yarn, making it soft, durable, and safe for all ages. Each bear is carefully crafted with attention to detail.</p><p>Perfect as a gift or a keepsake for your little one.</p>',
        shortDescription: 'Hand-crocheted cotton teddy bear, perfect for cuddling',
        price: 89900,
        category: categories[0]._id,
        tags: ['amigurumi', 'teddy bear', 'cotton', 'gift'],
        images: [{ url: 'https://placehold.co/600x600/E8C4C4/3E3A36?text=Teddy+Bear', publicId: 'sample-1', isPrimary: true }],
        attributes: new Map([['material', '100% Cotton Yarn'], ['color', 'Honey Brown'], ['size', '12 inches'], ['careInstructions', 'Hand wash cold, lay flat to dry']]),
        inventory: { quantity: 10, sku: 'SB-AMI-001', trackInventory: true },
        shipping: { weight: 6, processingDays: 5 },
        isFeatured: true,
      },
      {
        name: 'Boho Wall Hanging',
        description: '<p>A stunning bohemian-style crocheted wall hanging that adds warmth and texture to any room. Made with natural cotton rope and finished with wooden beads.</p>',
        shortDescription: 'Bohemian crocheted wall hanging with wooden accents',
        price: 129900,
        category: categories[1]._id,
        tags: ['boho', 'wall hanging', 'home decor', 'cotton'],
        images: [{ url: 'https://placehold.co/600x600/8FA98C/FFFBF5?text=Wall+Hanging', publicId: 'sample-2', isPrimary: true }],
        attributes: new Map([['material', 'Natural Cotton Rope'], ['color', 'Natural/Cream'], ['dimensions', '24" x 36"']]),
        inventory: { quantity: 5, sku: 'SB-HOME-001', trackInventory: true },
        shipping: { weight: 12, processingDays: 7 },
        isFeatured: true,
      },
      {
        name: 'Granny Square Blanket',
        description: '<p>A classic granny square blanket crocheted with premium acrylic yarn. This cozy blanket features a beautiful blend of warm colors perfect for snuggling on cool evenings.</p>',
        shortDescription: 'Classic granny square throw blanket in warm tones',
        price: 249900,
        category: categories[1]._id,
        tags: ['blanket', 'granny square', 'home decor', 'cozy'],
        images: [{ url: 'https://placehold.co/600x600/C9928E/FFFBF5?text=Blanket', publicId: 'sample-3', isPrimary: true }],
        attributes: new Map([['material', 'Premium Acrylic Yarn'], ['color', 'Multicolor Warm Tones'], ['dimensions', '50" x 60"'], ['careInstructions', 'Machine wash gentle, tumble dry low']]),
        inventory: { quantity: 3, sku: 'SB-HOME-002', trackInventory: true },
        shipping: { weight: 32, processingDays: 14, freeShipping: true },
        isFeatured: true,
      },
      {
        name: 'Flower Headband',
        description: '<p>A delicate crocheted headband featuring a beautiful flower design. Stretchy and comfortable, perfect for everyday wear or special occasions.</p>',
        shortDescription: 'Delicate crocheted flower headband',
        price: 34900,
        category: categories[2]._id,
        tags: ['headband', 'flower', 'accessories', 'wearable'],
        images: [{ url: 'https://placehold.co/600x600/E8C4C4/3E3A36?text=Headband', publicId: 'sample-4', isPrimary: true }],
        attributes: new Map([['material', 'Bamboo Cotton Blend'], ['color', 'Dusty Rose'], ['size', 'One Size (stretchy)']]),
        inventory: { quantity: 15, sku: 'SB-ACC-001', trackInventory: true },
        shipping: { weight: 2, processingDays: 3 },
        isFeatured: true,
      },
      {
        name: 'Baby Booties Set',
        description: '<p>Adorable hand-crocheted baby booties made with the softest organic cotton yarn. Hypoallergenic and gentle on baby\'s skin. Comes in a beautiful gift box.</p>',
        shortDescription: 'Soft organic cotton baby booties in a gift box',
        price: 59900,
        category: categories[3]._id,
        tags: ['baby', 'booties', 'organic', 'gift'],
        images: [{ url: 'https://placehold.co/600x600/8FA98C/FFFBF5?text=Baby+Booties', publicId: 'sample-5', isPrimary: true }],
        attributes: new Map([['material', 'Organic Cotton'], ['color', 'Sage Green'], ['size', '0-6 months'], ['careInstructions', 'Hand wash cold']]),
        inventory: { quantity: 20, sku: 'SB-BABY-001', trackInventory: true },
        shipping: { weight: 3, processingDays: 3 },
        isFeatured: true,
      },
      {
        name: 'Market Tote Bag',
        description: '<p>A sturdy and stylish crocheted market tote bag. Perfect for grocery shopping, trips to the farmers market, or as an everyday carry bag. The open-weave design is both beautiful and practical.</p>',
        shortDescription: 'Sturdy crocheted market tote in natural cotton',
        price: 99900,
        category: categories[2]._id,
        tags: ['tote', 'bag', 'market', 'cotton', 'eco-friendly'],
        images: [{ url: 'https://placehold.co/600x600/C4A265/FFFBF5?text=Tote+Bag', publicId: 'sample-6', isPrimary: true }],
        attributes: new Map([['material', 'Natural Cotton Cord'], ['color', 'Natural'], ['dimensions', '14" x 16" x 6"']]),
        inventory: { quantity: 8, sku: 'SB-ACC-002', trackInventory: true },
        shipping: { weight: 8, processingDays: 5 },
      },
    ];

    await Product.create(sampleProducts);
    console.log('Sample products created');

    console.log('\nSeed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
