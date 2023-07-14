const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const options = {
    toJSON: {
        virtuals: true
    }
}

const CampgroundSchema = new Schema({
    name: String,
    images: [{
        url: String,
        filename: String
    }],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, options)

const thumbnailImageOptions = 'e_improve,c_scale,w_225,h_150';
CampgroundSchema.path('images').schema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload/', `/upload/${thumbnailImageOptions}/`);
});

CampgroundSchema.virtual('properties.popupMarkup').get(function () {
    const markup = `<div class="card">
                        <img src="${this.images[0].url}" alt="Image of ${this.name}" class="card-img-top">
                        <div class="card-body">
                            <h6>${this.name}</h6>
                            <a class="btn btn-primary" href="/campgrounds/${this._id}">Click to Learn More</a>
                        </div>
                    </div>`
    return markup;
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);

