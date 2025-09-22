const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Dummy users data
const dummyUsers = [
  {
    user_id: 'prod001',
    name: 'Ahmad Produksi',
    role: 'produksi',
    password: 'password123'
  },
  {
    user_id: 'qc001',
    name: 'Sari QC',
    role: 'qc',
    password: 'password123'
  },
  {
    user_id: 'fin001',
    name: 'Lita Finance',
    role: 'finance',
    password: 'password123'
  },
  {
    user_id: 'help001',
    name: 'Lisa Helpdesk',
    role: 'helpdesk',
    password: 'password123'
  }
];

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create new users
    const createdUsers = await User.create(dummyUsers);
    console.log(`✅ Created ${createdUsers.length} users:`);

    createdUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.role}) - ID: ${user.user_id}`);
    });

    console.log('\n🔐 Login Credentials:');
    console.log('   Username: [user_id], Password: password123');
    console.log('   Example: help001 / password123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;