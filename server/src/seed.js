// seed.js - Seed script to add dummy blogs to the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Blog from './models/Blog.js';

dotenv.config();

const dummyBlogs = [
    {
        title: "The Future of Artificial Intelligence",
        content: "Artificial intelligence is rapidly transforming every aspect of our lives. From healthcare to transportation, AI is making things smarter, faster, and more efficient. Machine learning algorithms are now capable of diagnosing diseases, driving cars, and even creating art. As we stand on the brink of this technological revolution, it's crucial to understand both the opportunities and challenges that lie ahead. The ethical implications of AI decision-making, job displacement concerns, and the need for responsible development are topics that demand our attention.",
        tags: ["AI", "Technology", "Future"],
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
        isPublished: true
    },
    {
        title: "Minimalist Living: Less is More",
        content: "In a world obsessed with consumption, minimalism offers a refreshing alternative. By consciously choosing to own fewer possessions, we can focus on what truly matters in life. Minimalist living isn't about deprivation—it's about intentionality. It's about creating space for experiences, relationships, and personal growth. When we let go of the excess, we often find that we have more time, more money, and more peace of mind. The journey to minimalism starts with a single question: Does this add value to my life?",
        tags: ["Lifestyle", "Minimalism", "Wellness"],
        coverImage: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800",
        isPublished: true
    },
    {
        title: "The Art of Coffee Brewing",
        content: "Coffee is more than just a morning ritual—it's an art form. From selecting the perfect beans to mastering the pour-over technique, every step in the brewing process affects the final cup. The origin of the beans, the roast level, the grind size, and the water temperature all play crucial roles. Whether you prefer a bold espresso or a smooth cold brew, understanding these fundamentals will elevate your coffee experience. Join me as we explore the fascinating world of specialty coffee and unlock the secrets to brewing the perfect cup.",
        tags: ["Coffee", "Lifestyle", "Food"],
        coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
        isPublished: true
    },
    {
        title: "Remote Work: The New Normal",
        content: "The global shift to remote work has fundamentally changed how we think about productivity and work-life balance. What started as a temporary measure has become a permanent fixture for many companies. Remote work offers flexibility, eliminates commute time, and allows people to work from anywhere in the world. However, it also presents challenges like isolation, communication barriers, and the blurring of boundaries between work and personal life. Success in remote work requires intentional habits, clear communication, and a dedicated workspace.",
        tags: ["Work", "Remote", "Productivity"],
        coverImage: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800",
        isPublished: true
    },
    {
        title: "Sustainable Fashion: A Guide to Conscious Shopping",
        content: "The fashion industry is one of the largest polluters in the world. Fast fashion has created a culture of disposable clothing, with devastating environmental consequences. Sustainable fashion offers an alternative—choosing quality over quantity, supporting ethical brands, and embracing secondhand shopping. By making more conscious choices, we can reduce our environmental footprint without sacrificing style. This guide will help you navigate the world of sustainable fashion and build a wardrobe that's both beautiful and responsible.",
        tags: ["Fashion", "Sustainability", "Environment"],
        coverImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
        isPublished: true
    },
    {
        title: "The Power of Morning Routines",
        content: "How you start your morning sets the tone for the entire day. Successful people across the world share one common trait: a consistent morning routine. Whether it's meditation, exercise, journaling, or simply enjoying a quiet cup of tea, these intentional practices help center the mind and body. A well-designed morning routine can boost productivity, reduce stress, and improve overall well-being. The key is to find what works for you and commit to it consistently. Start small, be patient, and watch how these small changes transform your life.",
        tags: ["Productivity", "Wellness", "Habits"],
        coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        isPublished: true
    },
    {
        title: "Exploring the World of Digital Art",
        content: "Digital art has revolutionized creative expression, making art more accessible than ever before. With tools like Procreate, Photoshop, and Blender, artists can create stunning works without traditional materials. NFTs have added a new dimension to digital art ownership and monetization. From illustrations to 3D sculptures, the possibilities are endless. Whether you're a seasoned artist or a curious beginner, the digital medium offers a playground for experimentation and innovation. Let's explore the techniques, tools, and trends shaping the future of digital art.",
        tags: ["Art", "Digital", "Creativity"],
        coverImage: "https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=800",
        isPublished: true
    },
    {
        title: "The Science of Sleep",
        content: "Sleep is not a luxury—it's a biological necessity. Yet in our always-on culture, sleep is often the first thing we sacrifice. The consequences of chronic sleep deprivation are severe: impaired cognitive function, weakened immunity, and increased risk of chronic diseases. Understanding the science of sleep can help us prioritize rest. Our bodies follow circadian rhythms, and disrupting these patterns has profound effects on health. This deep dive into sleep science will help you understand why you need those seven to nine hours and how to get them.",
        tags: ["Health", "Science", "Wellness"],
        coverImage: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800",
        isPublished: true
    },
    {
        title: "Building Your First Web Application",
        content: "Learning to code opens doors to endless possibilities. Building your first web application is a milestone every developer remembers. Start with the fundamentals: HTML for structure, CSS for styling, and JavaScript for interactivity. Then explore frameworks like React or Vue to build more complex applications. The journey may seem daunting, but with persistence and practice, you'll be amazed at what you can create. This guide walks you through the essential concepts and provides resources to kickstart your development journey.",
        tags: ["Coding", "Web Development", "Technology"],
        coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
        isPublished: true
    },
    {
        title: "The Joy of Slow Travel",
        content: "In an age of bucket lists and Instagram highlights, slow travel offers a different approach. Instead of rushing from one tourist spot to another, slow travel encourages depth over breadth. Stay longer in one place, connect with locals, and immerse yourself in the culture. You'll discover hidden gems that guidebooks miss and create memories that last a lifetime. Slow travel is not just about seeing more—it's about experiencing more deeply. Let's explore how this mindful approach to travel can enrich your journeys.",
        tags: ["Travel", "Lifestyle", "Adventure"],
        coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        isPublished: true
    },
    {
        title: "Plant-Based Cooking Made Simple",
        content: "Transitioning to a plant-based diet doesn't have to be complicated or boring. With the right ingredients and techniques, plant-based meals can be delicious, satisfying, and nutritious. From hearty Buddha bowls to creamy cashew sauces, the possibilities are endless. Start by incorporating more vegetables, legumes, and whole grains into your meals. Experiment with spices and herbs to add flavor without relying on meat. This guide provides practical tips and recipes to make your plant-based journey smooth and enjoyable.",
        tags: ["Food", "Health", "Vegan"],
        coverImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
        isPublished: true
    },
    {
        title: "Understanding Cryptocurrency",
        content: "Cryptocurrency has moved from a niche interest to mainstream conversation. Bitcoin, Ethereum, and thousands of other digital currencies are reshaping how we think about money and finance. But what exactly is cryptocurrency? At its core, it's a decentralized digital currency secured by cryptography. Understanding blockchain technology, wallets, and exchanges is essential for anyone looking to participate in this new financial frontier. This beginner's guide breaks down the complex concepts into digestible explanations.",
        tags: ["Crypto", "Finance", "Technology"],
        coverImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
        isPublished: true
    },
    {
        title: "The Healing Power of Nature",
        content: "There's a reason we feel better after a walk in the park or a hike in the mountains. Science confirms what we've always intuitively known: nature heals. Studies show that spending time in natural environments reduces stress, lowers blood pressure, and boosts mood. The Japanese practice of 'forest bathing' has gained worldwide attention for its documented health benefits. In our increasingly urban and digital lives, reconnecting with nature is more important than ever. Discover how to incorporate more nature into your daily routine.",
        tags: ["Nature", "Wellness", "Mental Health"],
        coverImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
        isPublished: true
    },
    {
        title: "Mastering the Art of Public Speaking",
        content: "Public speaking consistently ranks as one of the most common fears. Yet it's also one of the most valuable skills you can develop. Whether you're presenting to a small team or addressing a large audience, effective communication can advance your career and amplify your ideas. The good news? Public speaking is a skill that can be learned and improved with practice. From managing nervousness to crafting compelling narratives, this guide covers the essential techniques to become a confident and engaging speaker.",
        tags: ["Communication", "Career", "Skills"],
        coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
        isPublished: true
    },
    {
        title: "The Renaissance of Vinyl Records",
        content: "In an era of streaming, vinyl records have made a remarkable comeback. Audiophiles and casual listeners alike are rediscovering the warm, rich sound of analog music. There's something magical about the ritual of vinyl: selecting a record, placing it on the turntable, and dropping the needle. Beyond the superior sound quality, vinyl offers a tangible connection to music that digital formats can't replicate. From building your first setup to hunting for rare pressings, let's explore the revival of this classic medium.",
        tags: ["Music", "Vinyl", "Culture"],
        coverImage: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800",
        isPublished: true
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find an existing user to associate blogs with
        const user = await User.findOne();
        if (!user) {
            console.log('No user found. Please create a user first.');
            process.exit(1);
        }

        console.log(`Using user: ${user.name} (${user._id})`);

        // Create blogs
        for (const blogData of dummyBlogs) {
            const blog = new Blog({
                ...blogData,
                author: user._id
            });
            await blog.save();
            console.log(`Created: ${blog.title}`);
        }

        console.log(`\n✅ Successfully seeded ${dummyBlogs.length} blogs!`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
