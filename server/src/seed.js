
// seed.js - Seed script to add dummy blogs to the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Blog from './models/Blog.js';

dotenv.config();

const blogs = [
    {
        title: "The Future of Artificial Intelligence: A Double-Edged Sword",
        content: `
            <p>Artificial intelligence is rapidly transforming every aspect of our lives. From healthcare to transportation, AI is making things smarter, faster, and more efficient. Machine learning algorithms are now capable of diagnosing diseases, driving cars, and even creating art.</p>
            <h2>The Promise of AI</h2>
            <p>We are standing on the brink of a technological revolution that will fundamentally alter the way we live, work, and relate to one another. In its scale, scope, and complexity, the transformation will be unlike anything humankind has experienced before.</p>
            <blockquote>"The development of full artificial intelligence could spell the end of the human race." - Stephen Hawking</blockquote>
            <p>However, many experts believe that AI will augment human capabilities rather than replace them. Imagine a world where:</p>
            <ul>
                <li><strong>Healthcare is personalized:</strong> AI analyzes your genetic makeup to prescribe the perfect treatment.</li>
                <li><strong>Cities are smart:</strong> Traffic lights adjust in real-time to eliminate congestion.</li>
                <li><strong>Education is tailored:</strong> Every student gets a personalized curriculum based on their learning pace.</li>
            </ul>
        `,
        tags: ["AI", "Technology", "Future", "Ethics"],
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
        isPublished: true
    },
    {
        title: "Minimalist Living: How to Declutter Your Mind",
        content: `
            <p>In a world obsessed with consumption, minimalism offers a refreshing alternative. By consciously choosing to own fewer possessions, we can focus on what truly matters in life. Minimalist living isn't about deprivation—it's about intentionality.</p>
            <h2>The benefits of less</h2>
            <p>When we let go of the excess, we often find that we have more time, more money, and more peace of mind. The journey to minimalism starts with a single question: <em>Does this add value to my life?</em></p>
            <p>Start with these simple steps:</p>
            <ol>
                <li><strong>The 90/90 Rule:</strong> If you haven't used it in 90 days and won't use it in the next 90, let it go.</li>
                <li><strong>One in, One out:</strong> For every new item you buy, donate or discard an old one.</li>
                <li><strong>Digitize everything:</strong> Scan documents and photos to reduce physical clutter.</li>
            </ol>
            <p>Remember, minimalism is a journey, not a destination. It looks different for everyone.</p>
        `,
        tags: ["Lifestyle", "Minimalism", "Wellness", "Self-Improvement"],
        coverImage: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800",
        isPublished: true
    },
    {
        title: "The Art of Coffee Brewing: From Bean to Cup",
        content: `
            <p>Coffee is more than just a morning ritual—it's an art form. From selecting the perfect beans to mastering the pour-over technique, every step in the brewing process affects the final cup.</p>
            <h2>Understanding the Variables</h2>
            <p>The origin of the beans, the roast level, the grind size, and the water temperature all play crucial roles.</p>
            <ul>
                <li><strong>Grind Size:</strong> Fine for espresso, coarse for French press.</li>
                <li><strong>Water Temp:</strong> Between 195°F and 205°F is the sweet spot.</li>
                <li><strong>Ratio:</strong> Scientific consensus suggests a 1:16 ratio of coffee to water.</li>
            </ul>
            <p>Whether you prefer a bold espresso or a smooth cold brew, understanding these fundamentals will elevate your coffee experience. Join me as we explore the fascinating world of specialty coffee.</p>
        `,
        tags: ["Coffee", "Lifestyle", "Food", "Hobbies"],
        coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
        isPublished: true
    },
    {
        title: "Remote Work: Surviving and Thriving at Home",
        content: `
            <p>The global shift to remote work has fundamentally changed how we think about productivity and work-life balance. What started as a temporary measure has become a permanent fixture for many companies.</p>
            <h2>The Challenges</h2>
            <p>Remote work offers flexibility, eliminates commute time, and allows people to work from anywhere in the world. However, it also presents challenges like isolation, communication barriers, and the blurring of boundaries between work and personal life.</p>
            <blockquote>"Work is something you do, not a place you go."</blockquote>
            <p>Success in remote work requires intentional habits, clear communication, and a dedicated workspace. Prioritize your mental health by setting strict start and end times for your workday.</p>
        `,
        tags: ["Work", "Remote", "Productivity", "Career"],
        coverImage: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800",
        isPublished: true
    },
    {
        title: "Sustainable Fashion: Why Vintage is the New Luxury",
        content: `
            <p>The fashion industry is one of the largest polluters in the world. Fast fashion has created a culture of disposable clothing, with devastating environmental consequences. Sustainable fashion offers an alternative—choosing quality over quantity.</p>
            <h2>Building a Capsule Wardrobe</h2>
            <p>By making more conscious choices, we can reduce our environmental footprint without sacrificing style. This guide will help you navigate the world of sustainable fashion and build a wardrobe that's both beautiful and responsible.</p>
            <p>Key principles:</p>
            <ul>
                <li><strong>Buy less, choose well:</strong> Invest in high-quality staples.</li>
                <li><strong>Support ethical brands:</strong> Research where your clothes come from.</li>
                <li><strong>Embrace secondhand:</strong> Thrifting is eco-friendly and unique.</li>
            </ul>
        `,
        tags: ["Fashion", "Sustainability", "Environment", "Style"],
        coverImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
        isPublished: true
    },
    {
        title: "The Power of Morning Routines",
        content: `
            <p>How you start your morning sets the tone for the entire day. Successful people across the world share one common trait: a consistent morning routine. Whether it's meditation, exercise, journaling, or simply enjoying a quiet cup of tea, these intentional practices help center the mind and body.</p>
            <p>A well-designed morning routine can:</p>
            <ul>
                <li>Boost productivity by 30%</li>
                <li>Reduce stress and anxiety</li>
                <li>Improve overall physical health</li>
            </ul>
            <p>The key is to find what works for you and commit to it consistently. Start small, be patient, and watch how these small changes transform your life.</p>
        `,
        tags: ["Productivity", "Wellness", "Habits", "Morning"],
        coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
        isPublished: true
    },
    {
        title: "Exploring the World of Digital Art",
        content: `
            <p>Digital art has revolutionized creative expression, making art more accessible than ever before. With tools like Procreate, Photoshop, and Blender, artists can create stunning works without traditional materials.</p>
            <h2>NFTs and Ownership</h2>
            <p>NFTs have added a new dimension to digital art ownership and monetization. From simple illustrations to complex 3D sculptures, the possibilities are endless. Whether you're a seasoned artist or a curious beginner, the digital medium offers a playground for experimentation and innovation.</p>
            <p>Popular tools for beginners:</p>
            <ul>
                <li><strong>Procreate:</strong> Best for iPad illustration.</li>
                <li><strong>Blender:</strong> Powerful, free 3D modeling software.</li>
                <li><strong>Figma:</strong> Great for vector art and UI design.</li>
            </ul>
        `,
        tags: ["Art", "Digital", "Creativity", "Design"],
        coverImage: "https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=800",
        isPublished: true
    },
    {
        title: "The Science of Sleep: Why We Need It",
        content: `
            <p>Sleep is not a luxury—it's a biological necessity. Yet in our always-on culture, sleep is often the first thing we sacrifice. The consequences of chronic sleep deprivation are severe: impaired cognitive function, weakened immunity, and increased risk of chronic diseases.</p>
            <h2>Circadian Rhythms</h2>
            <p>Our bodies follow natural 24-hour cycles. Disrupting these patterns has profound effects on health. This deep dive into sleep science will help you understand why you need those seven to nine hours and how to get them.</p>
            <blockquote>"Sleep is the golden chain that ties health and our bodies together." - Thomas Dekker</blockquote>
            <p>Tips for better sleep:</p>
            <ul>
                <li>Keep your room cool (around 65°F).</li>
                <li>Avoid blue light screens 1 hour before bed.</li>
                <li>Stick to a consistent wake-up time.</li>
            </ul>
        `,
        tags: ["Health", "Science", "Wellness", "Sleep"],
        coverImage: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800",
        isPublished: true
    },
    {
        title: "Building Your First Web Application",
        content: `
            <p>Learning to code opens doors to endless possibilities. Building your first web application is a milestone every developer remembers. Start with the fundamentals: HTML for structure, CSS for styling, and JavaScript for interactivity.</p>
            <h2>Choosing a Stack</h2>
            <p>The MERN stack (MongoDB, Express, React, Node.js) is a popular choice for beginners because it uses JavaScript throughout the entire application. It allows for rapid development and has a massive community for support.</p>
            <p>Steps to get started:</p>
            <ol>
                <li>Learn the basics of JavaScript (ES6+).</li>
                <li>Build a simple static website.</li>
                <li>Add interactivity with React.</li>
                <li>Connect a backend API with Node.js.</li>
            </ol>
            <p>The journey may seem daunting, but with persistence and practice, you'll be amazed at what you can create.</p>
        `,
        tags: ["Coding", "Web Development", "Technology", "MERN"],
        coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
        isPublished: true
    },
    {
        title: "The Joy of Slow Travel",
        content: `
            <p>In an age of bucket lists and Instagram highlights, slow travel offers a different approach. Instead of rushing from one tourist spot to another, slow travel encourages depth over breadth. Stay longer in one place, connect with locals, and immerse yourself in the culture.</p>
            <h2>Why Rush?</h2>
            <p>You'll discover hidden gems that guidebooks miss and create memories that last a lifetime. Slow travel is not just about seeing more—it's about experiencing more deeply. It's about sitting in a cafe for hours, watching the world go by.</p>
            <p>Benefits of slow travel:</p>
            <ul>
                <li>Lower environmental impact.</li>
                <li>More authentic cultural connection.</li>
                <li>Less stress and burnout.</li>
            </ul>
        `,
        tags: ["Travel", "Lifestyle", "Adventure", "Mindfulness"],
        coverImage: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        isPublished: true
    },
    {
        title: "Plant-Based Cooking Made Simple",
        content: `
            <p>Transitioning to a plant-based diet doesn't have to be complicated or boring. With the right ingredients and techniques, plant-based meals can be delicious, satisfying, and nutritious. From hearty Buddha bowls to creamy cashew sauces, the possibilities are endless.</p>
            <h2>Flavor First</h2>
            <p>Start by incorporating more vegetables, legumes, and whole grains into your meals. Experiment with spices and herbs to add flavor without relying on meat. Umami bombs like soy sauce, nutritional yeast, and mushrooms can replace the savory depth of meat.</p>
            <p>Easy swaps:</p>
            <ul>
                <li>Lentils instead of ground beef in tacos.</li>
                <li>Coconut milk for heavy cream in curries.</li>
                <li>Flax eggs for baking.</li>
            </ul>
        `,
        tags: ["Food", "Health", "Vegan", "Cooking"],
        coverImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
        isPublished: true
    },
    {
        title: "Understanding Cryptocurrency: Beyond the Hype",
        content: `
            <p>Cryptocurrency has moved from a niche interest to mainstream conversation. Bitcoin, Ethereum, and thousands of other digital currencies are reshaping how we think about money and finance. But what exactly is cryptocurrency?</p>
            <h2>The Blockchain</h2>
            <p>At its core, it's a decentralized digital currency secured by cryptography. Understanding blockchain technology, wallets, and exchanges is essential for anyone looking to participate in this new financial frontier.</p>
            <p>Key concepts:</p>
            <ul>
                <li><strong>Decentralization:</strong> No central bank controls it.</li>
                <li><strong>Transparency:</strong> Every transaction is on a public ledger.</li>
                <li><strong>Immutability:</strong> Once data is written, it cannot be changed.</li>
            </ul>
        `,
        tags: ["Crypto", "Finance", "Technology", "Blockchain"],
        coverImage: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
        isPublished: true
    },
    {
        title: "The Healing Power of Nature",
        content: `
            <p>There's a reason we feel better after a walk in the park or a hike in the mountains. Science confirms what we've always intuitively known: nature heals. Studies show that spending time in natural environments reduces stress, lowers blood pressure, and boosts mood.</p>
            <h2>Forest Bathing</h2>
            <p>The Japanese practice of 'Shinrin-yoku' or forest bathing has gained worldwide attention for its documented health benefits. In our increasingly urban and digital lives, reconnecting with nature is more important than ever.</p>
            <p>Simple ways to connect:</p>
            <ul>
                <li>Take your lunch break outside.</li>
                <li>Keep plants in your home office.</li>
                <li>Leave your phone behind on walks.</li>
            </ul>
        `,
        tags: ["Nature", "Wellness", "Mental Health", "Environment"],
        coverImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
        isPublished: true
    },
    {
        title: "Mastering the Art of Public Speaking",
        content: `
            <p>Public speaking consistently ranks as one of the most common fears. Yet it's also one of the most valuable skills you can develop. Whether you're presenting to a small team or addressing a large audience, effective communication can advance your career and amplify your ideas.</p>
            <h2>Storytelling is Key</h2>
            <p>The good news? Public speaking is a skill that can be learned and improved with practice. From managing nervousness to crafting compelling narratives, focusing on the audience rather than yourself is the first step.</p>
            <blockquote>"There are only two types of speakers in the world. 1. The nervous and 2. Liars." - Mark Twain</blockquote>
        `,
        tags: ["Communication", "Career", "Skills", "Leadership"],
        coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
        isPublished: true
    },
    {
        title: "The Renaissance of Vinyl Records",
        content: `
            <p>In an era of streaming, vinyl records have made a remarkable comeback. Audiophiles and casual listeners alike are rediscovering the warm, rich sound of analog music. There's something magical about the ritual of vinyl: selecting a record, placing it on the turntable, and dropping the needle.</p>
            <h2>Tangible Music</h2>
            <p>Beyond the superior sound quality, vinyl offers a tangible connection to music that digital formats can't replicate. The album art, the liner notes, the physical weight of the disc—it all contributes to the experience.</p>
            <p>From building your first setup to hunting for rare pressings, the vinyl community is vibrant and welcoming. It slows down the consumption of music, making it an active listening experience rather than passive background noise.</p>
        `,
        tags: ["Music", "Vinyl", "Culture", "Hobbies"],
        coverImage: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=800",
        isPublished: true
    },
    {
        title: "Mindfulness in the Digital Age",
        content: `
            <p>We live in an attention economy. Apps are designed to be addictive, notifications constantly demand our focus, and we scroll endlessly through feeds. Mindfulness is the antidote to this digital distraction.</p>
            <h2>Reclaiming Your Attention</h2>
            <p>Mindfulness isn't just about meditation on a cushion. It's about bringing awareness to our digital habits. It's about choosing when to engage with technology rather than reacting compulsively.</p>
            <p>Try a digital detox:</p>
            <ul>
                <li>Turn off non-essential notifications.</li>
                <li>Designate "phone-free zones" in your house (like the bedroom).</li>
                <li>Practice "unitasking" instead of multitasking.</li>
            </ul>
        `,
        tags: ["Mindfulness", "Technology", "Wellness", "Mental Health"],
        coverImage: "https://images.unsplash.com/photo-1515023115689-589c33041697?w=800",
        isPublished: true
    },
    {
        title: "The Beginners Guide to Investing",
        content: `
            <p>Investing is the most reliable way to build long-term wealth, yet it intimidates many. The jargon—stocks, bonds, ETFs, dividends—can be overwhelming. But the principles of successful investing are actually quite simple.</p>
            <h2>Time in the Market</h2>
            <p>The biggest advantage you have is time. Compound interest is the eighth wonder of the world. The earlier you start, the less you actually need to save to reach your goals.</p>
            <p>Golden rules:</p>
            <ol>
                <li><strong>Diversify:</strong> Don't put all your eggs in one basket.</li>
                <li><strong>Keep costs low:</strong> High fees eat your returns. Index funds are great for this.</li>
                <li><strong>Stay the course:</strong> Don't panic sell during market dips.</li>
            </ol>
        `,
        tags: ["Finance", "Investing", "Money", "wealth"],
        coverImage: "https://images.unsplash.com/photo-1579621970563-ebec7560eb3e?w=800",
        isPublished: true
    },
    {
        title: "Photography Basics for Beginners",
        content: `
            <p>You don't need a $3,000 camera to take great photos. In fact, the best camera is the one you have with you. Photography is more about light, composition, and perspective than it is about gear.</p>
            <h2>The Exposure Triangle</h2>
            <p>Understanding the relationship between ISO, Aperture, and Shutter Speed gives you creative control over your images.</p>
            <ul>
                <li><strong>Aperture:</strong> Controls depth of field (blurry background vs. sharp everything).</li>
                <li><strong>Shutter Speed:</strong> Freezes motion or creates blur.</li>
                <li><strong>ISO:</strong> Digital sensitivity to light (and noise).</li>
            </ul>
            <p>Master these, and you can take stunning photos on anything from a DSLR to an iPhone.</p>
        `,
        tags: ["Photography", "Art", "Creativity", "Hobbies"],
        coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
        isPublished: true
    },
    {
        title: "Why We Love Sci-Fi",
        content: `
            <p>Science fiction is more than just spaceships and lasers. It's a mirror we hold up to society to examine our current path. From <em>Frankenstein</em> to <em>Black Mirror</em>, sci-fi asks the big "What If?" questions.</p>
            <h2>Exploring Human Nature</h2>
            <p>By placing humans in futuristic or alien settings, sci-fi strips away cultural baggage and allows us to explore raw human nature. It tackles themes of colonization, artificial intelligence, climate change, and social inequality long before they become headline news.</p>
            <p>Great sci-fi doesn't predict the future; it prevents it—or inspires us to build a better one.</p>
        `,
        tags: ["Sci-Fi", "Books", "Movies", "Culture"],
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        isPublished: true
    },
    {
        title: "The Ultralearning Experiment",
        content: `
            <p>Traditional education is slow and expensive. Ultralearning is a strategy for acquiring skills and knowledge that is both self-directed and intense. It's how people learn new languages in months or master coding without a degree.</p>
            <h2>Principles of Ultralearning</h2>
            <p>Based on Scott Young's research, deep focus and direct practice are essential. Don't just read about programming—write code. Don't just study grammar—speak the language.</p>
            <p>If you want to stay relevant in a changing economy, the ability to learn hard things quickly is the ultimate superpower.</p>
        `,
        tags: ["Learning", "Education", "Self-Improvement", "Productivity"],
        coverImage: "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=800",
        isPublished: true
    },
    {
        title: "Gardening for Mental Health",
        content: `
            <p>Getting your hands dirty is good for your brain. Horticulture therapy is a real field of study, and gardening has been shown to decrease cortisol levels and improve mood. There is something profoundly grounding about caring for a living thing.</p>
            <h2>Patience and Growth</h2>
            <p>Gardening teaches us patience. You can't rush a tomato plant. It reminds us of the seasons and the cycle of life. Even in a small apartment, nurturing a few houseplants can provide a daily connection to the natural world.</p>
            <p>Plus, growing your own food—even just herbs—tastes infinitely better than anything from the grocery store.</p>
        `,
        tags: ["Gardening", "Wellness", "Nature", "Mental Health"],
        coverImage: "https://images.unsplash.com/photo-1416879895691-30ada63a3045?w=800",
        isPublished: true
    },
    {
        title: "The History of Jazz",
        content: `
            <p>Jazz is often called America's classical music. Born in New Orleans in the late 19th century, it is a fusion of African rhythmic traditions and European harmonic structures. But more than that, jazz is the sound of freedom and improvisation.</p>
            <h2>Evolution of Style</h2>
            <p>From Swing to Bebop, Cool Jazz to Fusion, the genre is constantly reinventing itself. Legends like Miles Davis, John Coltrane, and Ella Fitzgerald didn't just play music; they told stories of pain, joy, and resilience.</p>
            <p>To listen to jazz is to witness a conversation in real-time between musicians. It demands presence and rewards deep listening.</p>
        `,
        tags: ["Music", "History", "Culture", "Jazz"],
        coverImage: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800",
        isPublished: true
    },
    {
        title: "Stoicism for Modern Life",
        content: `
            <p>Stoicism is an ancient Greek philosophy that has seen a massive resurgence in Silicon Valley and beyond. Why? Because it offers a practical operating system for thriving in high-stress environments.</p>
            <h2>Control What You Can</h2>
            <p>Epictetus taught that we must distinguish between what is up to us and what is not. We cannot control the economy, the weather, or other people's opinions. We can only control our own judgments and actions.</p>
            <blockquote>"You have power over your mind - not outside events. Realize this, and you will find strength." - Marcus Aurelius</blockquote>
            <p>In a chaotic world, Stoicism provides an anchor of calm and rationality.</p>
        `,
        tags: ["Philosophy", "Stoicism", "Mindset", "Wisdom"],
        coverImage: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800",
        isPublished: true
    },
    {
        title: "The Future of Space Exploration",
        content: `
            <p>We are entering a new golden age of space travel. With private companies like SpaceX and Blue Origin lowering the cost of launch, space is becoming accessible in ways we only dreamed of.</p>
            <h2>Mars and Beyond</h2>
            <p>NASA's Artemis program aims to return humans to the Moon by 2025, establishing a permanent base. From there, the eyes of humanity are set on Mars. The challenges are immense—radiation, gravity, distance—but the drive to explore is written into our DNA.</p>
            <p>Are we ready to become a multi-planetary species? The next few decades will decide our cosmic fate.</p>
        `,
        tags: ["Space", "Science", "Technology", "Future"],
        coverImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800",
        isPublished: true
    },
    {
        title: "Clean Eating 101",
        content: `
            <p>The term "clean eating" gets thrown around a lot, but what does it really mean? At its simplest, it means eating whole, unprocessed foods that look as close to their natural state as possible.</p>
            <h2>Read the Label</h2>
            <p>If a product has 50 ingredients and you can't pronounce half of them, it's likely highly processed. Clean eating focuses on fresh fruits, vegetables, lean proteins, and whole grains.</p>
            <p>It's not a diet; it's a lifestyle. It's about fueling your body with premium fuel so you can perform at your best. Cut the sugar, ditch the trans fats, and watch your energy levels soar.</p>
        `,
        tags: ["Food", "Health", "Nutrition", "Lifestyle"],
        coverImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
        isPublished: true
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne();
        if (!user) {
            console.log('No user found. Please create a user first.');
            process.exit(1);
        }

        console.log(`Using user: ${user.name} (${user._id})`);

        // Check if we already have these blogs to prevent duplicates (optional logic, but simple append is fine for seeding)
        // For this run, we will just create them.

        for (const blogData of blogs) {
            const blog = new Blog({
                ...blogData,
                author: user._id,
                // Add varied timestamps to make the feed look natural
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
            });
            await blog.save();
            console.log(`Created: ${blog.title}`);
        }

        console.log(`\n✅ Successfully seeded ${blogs.length} blogs!`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
