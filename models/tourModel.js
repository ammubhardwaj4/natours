const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A Tour must have a Name.'],
      maxlength: [40, 'A Tour name must have less or equal than 40 character.'],
      minlength: [10, 'A Tour name must have more or equal than 40 character.'],
      unique: true,
      trim: true
    },
    slug: String,
    duration: {
      type: Number,
      require: [true, 'A Tour must have a Duration.']
    },
    maxGroupSize: {
      type: Number,
      require: [true, 'A Tour must have a MaxGroupSize.']
    },
    difficulty: {
      type: String,
      require: [true, 'A Tour must have a Difficulty Type.'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult.'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      require: [true, 'A Tour must have a Price.']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          //   this only points to current doc on NEW document creation.
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below reguler price.'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      require: [true, 'A Tour must have a Description.']
    },
    imageCover: {
      type: String,
      require: [true, 'A Tour must have a Cover Image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // For Embedded Document.
    // guides: Array
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dshepre' });

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// Document Middleware Run before .save() and .create() not for update()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

/*
// This is for EMBEDDED DOCUMENT.
tourSchema.pre('save', async function(next) {
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});
*/
// Query Middleware
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.post(/^find/, function(doc, next) {
  console.log(`Query tooks ${Date.now() - this.start} milliseconds!`);
  // console.log(doc);
  next();
});

// Aggregation Middleware
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
