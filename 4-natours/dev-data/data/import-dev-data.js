const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection successful!');
  })
  .catch(err => {
    console.error('DB connection error 💥:', err);
  });

// READ JSON FILES
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// IMPORT DATA INTO THE DB
const importData = async () => {
  try {
    console.log('🚀 Starting data import...');

    console.log('Importing tours...');
    await Tour.insertMany(tours);
    console.log('✅ Tours imported successfully!');

    console.log('Importing users...');
    // Map string 'id' to Mongoose recognized standard format
    const formattedUsers = users.map(user => {
      const newUser = { ...user };
      if (newUser.id) {
        newUser._id = newUser.id; // Assign to _id
        delete newUser.id;
      }
      return newUser;
    });

    // Mongoose insertMany with validation disabled to ignore missing passwordConfirm
    await User.insertMany(formattedUsers, { validateBeforeSave: false });
    console.log('✅ Users imported successfully!');

    console.log('Importing reviews...');
    await Review.insertMany(reviews);
    console.log('✅ Reviews imported successfully!');

    console.log('🎉 All data successfully loaded!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during import:', err);
    process.exit(1);
  }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    console.log('🗑️ Deleting data...');
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('✅ Data successfully deleted from database!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during deletion:', err);
    process.exit(1);
  }
};

// FLAG CHECKER
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Please provide a valid argument: --import or --delete');
  process.exit(0);
}