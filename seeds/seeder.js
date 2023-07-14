const mongoose = require('mongoose');
const towns = require('./towns');
const { places, descriptors } = require('./campgroundGenerator');
const Campground = require('../models/campground');

const mapboxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mapboxGeoCoding({ accessToken: 'pk.eyJ1IjoiaXZhbnRhbjAyIiwiYSI6ImNsYngyenh1NTA1dGkzd3F6YXdlOGc0NzMifQ.RK9VLyxD76IllVAYoiZEUg' });

mongoose.connect('mongodb://localhost:27017/campbuddy', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection Error:'));
db.once('open', () => {
    console.log('Database connected.')
})

const randArrElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async function () {
    await Campground.deleteMany({});
    for (let i = 0; i < 20; i++) {
        const randLocation = Math.floor(Math.random() * towns.length)
        const campground = new Campground({
            name: `${randArrElement(places)} ${randArrElement(descriptors)}`,
            author: '64a92ca5dcd52778c65f76d3',
            images: [{
                url: 'https://res.cloudinary.com/dcyyue73r/image/upload/v1689216220/CampBuddy/campgrounds/default_jelesl.jpg',
                filename: 'CampBuddy/campgrounds/default_jelesl'
            }],
            location: `${towns[randLocation].town}, ${towns[randLocation].state}`,
            description: `Welcome to a picturesque campsite nestled amidst the serene beauty of nature. Surrounded by lush green forests and embraced by towering mountains, our campsite offers a tranquil escape from the bustling city life. Settle into your cozy tents and experience the joy of camping under the starlit sky. Wake up to the soothing melodies of chirping birds and the gentle rustling of leaves. Explore the nearby hiking trails, where you can discover hidden waterfalls and breathtaking vistas. Unwind by the crackling campfire, sharing stories and laughter with fellow campers. With basic amenities and a commitment to preserving the environment, our campsite provides an immersive and sustainable outdoor experience. Immerse yourself in nature's embrace and create lasting memories at our campsite.`,
            price: Math.floor(Math.random() * 20) + 20
        })
        const geodata = await geocoder.forwardGeocode({
            query: campground.location,
            limit: 1
        }).send();
        campground.geometry = geodata.body.features[0].geometry;
        await campground.save();
    }
}

seed().then(() => {
    mongoose.connection.close();
})