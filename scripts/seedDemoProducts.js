import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";

dotenv.config();

const image = (photoId, width = 1000) =>
    `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=85`;

const sampleListings = [
    // Homes, rooms, hostels, and rentals (12)
    {
        name: "DEMO · Sunny furnished studio near North Campus",
        description: "DEMO LISTING · Furnished studio with desk, wardrobe, Wi-Fi, and shared laundry. Contact the owner to confirm availability and terms.",
        price: 7800, originalPrice: 9000, category: "housing", condition: "For Rent", listingType: "rent", quantity: 1,
        location: "North Campus · Green Park",
        productImages: [image("photo-1522708323590-d24dbb6b0267"), image("photo-1502672260266-1c1ef2d93688")],
    },
    {
        name: "DEMO · Private hostel room with study desk",
        description: "DEMO LISTING · Single-occupancy room with a study desk, closet, and common kitchen access. Verify rent, deposit, and availability before booking.",
        price: 6200, category: "hostel", condition: "For Rent", listingType: "rent", quantity: 1,
        location: "Hostel Road · Block A",
        productImages: [image("photo-1555854877-bab0e564b8d5")],
    },
    {
        name: "DEMO · Shared 2-bedroom student apartment",
        description: "DEMO LISTING · Bright apartment with a shared living area and kitchen, suitable for students. Sample listing; confirm details with the seller.",
        price: 5400, originalPrice: 6500, category: "housing", condition: "For Rent", listingType: "rent", quantity: 1,
        location: "East Gate · Lake View Apartments",
        productImages: [image("photo-1494526585095-c41746248156"), image("photo-1493809842364-78817add7ffb")],
    },
    {
        name: "DEMO · Twin-share room close to campus gate",
        description: "DEMO LISTING · Twin-share room with two beds and a shared bathroom. Check the final occupancy, utilities, and move-in date before arranging a visit.",
        price: 3900, category: "hostel", condition: "For Rent", listingType: "rent", quantity: 2,
        location: "South Gate · Student Residency",
        productImages: [image("photo-1560185008-b033106af5c3")],
    },
    {
        name: "DEMO · PG room with meals available",
        description: "DEMO LISTING · Paying guest room with optional meal plan and common-area access. Sample details only; confirm meal and utility costs.",
        price: 8500, originalPrice: 9800, category: "hotel", condition: "For Rent", listingType: "rent", quantity: 1,
        location: "Market Street · Campus View PG",
        productImages: [image("photo-1611892440504-42a792e24d32")],
    },
    {
        name: "DEMO · Shared student flat, one room available",
        description: "DEMO LISTING · One room in a shared flat with kitchen and balcony access. Contact the listing owner to confirm roommates and lease duration.",
        price: 5100, category: "housing", condition: "For Rent", listingType: "rent", quantity: 1,
        location: "West Campus · Maple Residency",
        productImages: [image("photo-1600210492486-724fe5c67fb0"), image("photo-1600607687939-ce8a6c25118c")],
    },
    {
        name: "DEMO · Furnished room for semester stay",
        description: "DEMO LISTING · Furnished room with bed, desk, and storage. Semester-term listing; confirm the deposit and exact contract dates.",
        price: 7000, category: "hostel", condition: "For Rent", listingType: "rent", quantity: 1,
        location: "University Avenue · Block C",
        productImages: [image("photo-1522156373667-4c7234bbd804")],
    },
    {
        name: "DEMO · Small family flat near bus route",
        description: "DEMO LISTING · Compact two-room flat near public transport and campus shops. Confirm furnishing, bills, and viewing arrangements directly.",
        price: 11200, originalPrice: 12500, category: "housing", condition: "For Rent", listingType: "rent", quantity: 1,
        location: "Central Road · Transit Quarter",
        productImages: [image("photo-1600566753086-00f18fb6b3ea"), image("photo-1600585154340-be6161a56a0c")],
    },
    {
        name: "DEMO · Budget dorm bed with locker",
        description: "DEMO LISTING · Dorm bed with an individual locker and shared facilities. Check house rules, availability, and the total monthly cost.",
        price: 2800, category: "hostel", condition: "For Rent", listingType: "rent", quantity: 1,
        location: "Old Campus · Dormitory 2",
        productImages: [image("photo-1595526114035-0d45ed16cfbf")],
    },
    {
        name: "DEMO · Guest room for short stay",
        description: "DEMO LISTING · Short-stay guest room near campus. Price shown is a sample monthly equivalent; confirm nightly rates and dates.",
        price: 9500, category: "hotel", condition: "For Rent", listingType: "rent", quantity: 1,
        location: "Station Road · City Stay",
        productImages: [image("photo-1566073771259-6a8506099945")],
    },
    {
        name: "DEMO · Mess room with attached washroom",
        description: "DEMO LISTING · Private room with attached washroom and access to the nearby mess. Confirm meals, utilities, and vacancy with the host.",
        price: 6800, category: "mess", condition: "For Rent", listingType: "rent", quantity: 1,
        location: "North Hostel Lane · House 8",
        productImages: [image("photo-1616486338812-3dadae4b4ace")],
    },
    {
        name: "DEMO · Two-person room near engineering block",
        description: "DEMO LISTING · Shared room intended for two students with desks and wardrobe space. Sample listing; verify occupancy and terms in person.",
        price: 4400, category: "hostel", condition: "For Rent", listingType: "rent", quantity: 2,
        location: "Engineering Block · Cedar House",
        productImages: [image("photo-1631049307264-da0ec9d70304")],
    },

    // Sale listings: electronics, furniture, cycles, books, clothing, food, and essentials (28)
    {
        name: "DEMO · Compact stainless electric kettle",
        description: "DEMO LISTING · 1.5 L electric kettle with auto shut-off. Check the cable and heating function during pickup.",
        price: 650, originalPrice: 1200, category: "electronics", condition: "Like New", listingType: "sell", quantity: 1,
        location: "Hostel 4 · Common Room",
        productImages: [image("photo-1605559424843-9e4c228bf1c2")],
    },
    {
        name: "DEMO · USB-C 65W laptop charger",
        description: "DEMO LISTING · Compact USB-C power adapter for compatible laptops and phones. Buyer should verify device compatibility.",
        price: 900, originalPrice: 1600, category: "electronics", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Library Wing · Room 12",
        productImages: [image("photo-1583863788434-e58a36330cf0")],
    },
    {
        name: "DEMO · Adjustable desk lamp",
        description: "DEMO LISTING · Flexible-neck LED desk lamp for a study table. Includes its power cable; inspect before purchase.",
        price: 420, category: "electronics", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Hostel 1 · Room 204",
        productImages: [image("photo-1507473885765-e6ed057f782c")],
    },
    {
        name: "DEMO · Wireless keyboard and mouse set",
        description: "DEMO LISTING · Wireless keyboard and mouse combo with USB receiver. Sample listing; confirm battery and receiver status.",
        price: 780, originalPrice: 1450, category: "electronics", condition: "Like New", listingType: "sell", quantity: 1,
        location: "Computer Lab · Pickup Desk",
        productImages: [image("photo-1587829741301-dc798b83add3")],
    },
    {
        name: "DEMO · Scientific calculator for coursework",
        description: "DEMO LISTING · Student scientific calculator for coursework and exam practice. Check model compatibility with exam rules.",
        price: 550, category: "electronics", condition: "Used", listingType: "sell", quantity: 1,
        location: "Academic Block · Room 17",
        productImages: [image("photo-1587145820266-a5951ee6f620")],
    },
    {
        name: "DEMO · Portable Bluetooth speaker",
        description: "DEMO LISTING · Small portable speaker for personal use. Test charging and audio before collection.",
        price: 720, originalPrice: 1300, category: "electronics", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Hostel 6 · Reception",
        productImages: [image("photo-1608043152269-423dbba4e7e1")],
    },
    {
        name: "DEMO · Ergonomic study chair",
        description: "DEMO LISTING · Adjustable chair with rolling casters and a supportive back. Inspect height adjustment and wheels at pickup.",
        price: 1800, originalPrice: 3500, category: "furniture", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Hostel 3 · Room 118",
        productImages: [image("photo-1592078615290-033ee584e267")],
    },
    {
        name: "DEMO · Solid wood study table",
        description: "DEMO LISTING · Compact writing desk with a lower shelf. Buyer arranges pickup; check dimensions before collection.",
        price: 2400, category: "furniture", condition: "Used", listingType: "sell", quantity: 1,
        location: "South Campus · Block D",
        productImages: [image("photo-1499933374294-4584851497cc")],
    },
    {
        name: "DEMO · Single bed and mattress",
        description: "DEMO LISTING · Single bed frame bundled with a mattress. Sample listing; arrange an in-person inspection before buying.",
        price: 3200, originalPrice: 5000, category: "furniture", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Hostel Road · House 11",
        productImages: [image("photo-1505693416388-ac5ce068fe85")],
    },
    {
        name: "DEMO · Three-drawer storage cabinet",
        description: "DEMO LISTING · Lightweight drawer unit for clothes or study supplies. Confirm measurements and carry arrangement.",
        price: 950, category: "furniture", condition: "Used", listingType: "sell", quantity: 1,
        location: "Hostel 2 · Room 305",
        productImages: [image("photo-1595428774223-ef52624120d2")],
    },
    {
        name: "DEMO · Folding chair for a study corner",
        description: "DEMO LISTING · Folding chair that stores easily in a hostel room. Sample condition; inspect hinges before use.",
        price: 400, category: "furniture", condition: "Good Condition", listingType: "sell", quantity: 2,
        location: "West Wing · Room 41",
        productImages: [image("photo-1503602642458-232111445657")],
    },
    {
        name: "DEMO · Mountain bicycle with 21 gears",
        description: "DEMO LISTING · Multi-speed bicycle for campus commutes. Check brakes, tyres, and frame size in person before purchase.",
        price: 4200, originalPrice: 7800, category: "mobility", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Main Gate · Cycle Stand",
        productImages: [image("photo-1485965120184-e220f721d03e"), image("photo-1532298229144-0ec0c57515c7")],
    },
    {
        name: "DEMO · City bicycle with rear carrier",
        description: "DEMO LISTING · Practical city bicycle with a rear carrier. Sample listing; arrange a test ride and verify ownership.",
        price: 2900, category: "mobility", condition: "Used", listingType: "sell", quantity: 1,
        location: "North Gate · Security Office",
        productImages: [image("photo-1507035895480-2b3156c31fc8")],
    },
    {
        name: "DEMO · U-lock and bicycle lights bundle",
        description: "DEMO LISTING · Bicycle U-lock bundled with front and rear lights. Test the lock and batteries at pickup.",
        price: 380, category: "mobility", condition: "Like New", listingType: "sell", quantity: 1,
        location: "Cycle Stand · Bay 3",
        productImages: [image("photo-1511994298241-608e28f14fde")],
    },
    {
        name: "DEMO · Computer science textbook bundle",
        description: "DEMO LISTING · Sample set of programming and algorithms textbooks. Ask for edition details and inspect pages before purchase.",
        price: 1100, originalPrice: 2600, category: "books", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Central Library · Pickup Shelf",
        productImages: [image("photo-1544716278-ca5e3f4abd8c"), image("photo-1512820790803-83ca734da794")],
    },
    {
        name: "DEMO · Discrete mathematics course book",
        description: "DEMO LISTING · Discrete mathematics textbook for undergraduate coursework. Edition and annotations should be checked with the seller.",
        price: 380, category: "books", condition: "Used", listingType: "sell", quantity: 1,
        location: "Engineering Block · Room 108",
        productImages: [image("photo-1507842217343-583bb7270b66")],
    },
    {
        name: "DEMO · Exam preparation notebook pack",
        description: "DEMO LISTING · Unused ruled notebooks for lectures and exam preparation. Sample listing; confirm pack quantity at collection.",
        price: 180, category: "books", condition: "Brand New", listingType: "sell", quantity: 3,
        location: "Stationery Shop · Campus Lane",
        productImages: [image("photo-1531346878377-a5be20888e57")],
    },
    {
        name: "DEMO · Campus hoodie, medium",
        description: "DEMO LISTING · Comfortable campus hoodie, size M. Check fit and condition at handover.",
        price: 650, category: "clothing", condition: "Like New", listingType: "sell", quantity: 1,
        location: "Hostel 5 · Room 216",
        productImages: [image("photo-1556821840-3a63f95609a7")],
    },
    {
        name: "DEMO · Rain jacket with hood, large",
        description: "DEMO LISTING · Lightweight hooded rain jacket, size L. Sample listing; inspect zip and seams before buying.",
        price: 520, category: "clothing", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "West Hostel · Laundry Area",
        productImages: [image("photo-1544923246-77307dd654cb")],
    },
    {
        name: "DEMO · Backpack with laptop sleeve",
        description: "DEMO LISTING · Everyday backpack with padded laptop sleeve and multiple compartments. Check zippers during pickup.",
        price: 780, originalPrice: 1500, category: "clothing", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Academic Block · Lobby",
        productImages: [image("photo-1553062407-98eeb64c6a62")],
    },
    {
        name: "DEMO · Reusable stainless water bottle",
        description: "DEMO LISTING · Insulated reusable bottle for lectures and commutes. Sample listing; confirm capacity with seller.",
        price: 250, category: "other", condition: "Like New", listingType: "sell", quantity: 2,
        location: "Hostel 1 · Room 56",
        productImages: [image("photo-1602143407151-7111542de6e8")],
    },
    {
        name: "DEMO · Meal prep container set",
        description: "DEMO LISTING · Set of reusable food containers for meal prep. Confirm the number and sizes in the set before purchase.",
        price: 320, category: "food", condition: "Brand New", listingType: "sell", quantity: 2,
        location: "Mess Block · Counter 2",
        productImages: [image("photo-1498837167922-ddd27525d352")],
    },
    {
        name: "DEMO · Desk fan for a hostel room",
        description: "DEMO LISTING · Compact desk fan with adjustable tilt. Test all speed settings before taking it home.",
        price: 600, category: "electronics", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Hostel 7 · Room 12",
        productImages: [image("photo-1581276879432-15e50529f34b")],
    },
    {
        name: "DEMO · Extension board with surge protection",
        description: "DEMO LISTING · Multi-outlet extension board for a desk setup. Check cable and switch condition before use.",
        price: 350, category: "electronics", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Library Wing · Room 39",
        productImages: [image("photo-1558618666-fcd25c85cd64")],
    },
    {
        name: "DEMO · Whiteboard and marker kit",
        description: "DEMO LISTING · Small whiteboard with markers for room planning or revision. Confirm marker ink before purchase.",
        price: 280, category: "other", condition: "Like New", listingType: "sell", quantity: 1,
        location: "Study Hall · Desk 6",
        productImages: [image("photo-1455390582262-044cdead277a")],
    },
    {
        name: "DEMO · Yoga mat for indoor workouts",
        description: "DEMO LISTING · Lightweight exercise mat. Sample listing; inspect cleanliness and surface condition at pickup.",
        price: 450, category: "other", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Sports Centre · Front Desk",
        productImages: [image("photo-1518611012118-696072aa579a")],
    },
    {
        name: "DEMO · Basic cookware starter set",
        description: "DEMO LISTING · Small cookware bundle for a student kitchen. Confirm included pieces and condition before buying.",
        price: 950, category: "food", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Hostel Kitchen · Shelf A",
        productImages: [image("photo-1556911220-bff31c812dba")],
    },
    {
        name: "DEMO · Tabletop mirror with stand",
        description: "DEMO LISTING · Compact tabletop mirror for a dorm or apartment. Check the stand and glass before collection.",
        price: 220, category: "other", condition: "Like New", listingType: "sell", quantity: 1,
        location: "Hostel 2 · Room 17",
        productImages: [image("photo-1618221195710-dd6b41faaea6")],
    },
    {
        name: "DEMO · Bluetooth headphones for study",
        description: "DEMO LISTING · Over-ear headphones for music and online lectures. Test audio, buttons, and charging before purchase.",
        price: 1150, originalPrice: 2200, category: "electronics", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Computer Lab · Desk 8",
        productImages: [image("photo-1505740420928-5e560c06d30e")],
    },
    {
        name: "DEMO · Portable laptop stand",
        description: "DEMO LISTING · Foldable laptop riser for a more comfortable study posture. Check hinges and supported device size.",
        price: 420, category: "electronics", condition: "Like New", listingType: "sell", quantity: 1,
        location: "Library · Quiet Floor",
        productImages: [image("photo-1527864550417-7fd91fc51a46")],
    },
    {
        name: "DEMO · Ceramic mug pair",
        description: "DEMO LISTING · Pair of ceramic mugs for a dorm kitchenette. Inspect both for chips before buying.",
        price: 180, category: "food", condition: "Good Condition", listingType: "sell", quantity: 2,
        location: "Mess Block · Side Entrance",
        productImages: [image("photo-1514228742587-6b1558fcca3d")],
    },
    {
        name: "DEMO · Indoor plant with ceramic pot",
        description: "DEMO LISTING · Small indoor plant in a ceramic pot, suitable for a desk or windowsill. Ask about care and light needs.",
        price: 260, category: "other", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Garden Gate · Plant Stand",
        productImages: [image("photo-1485955900006-10f4d324d411")],
    },
    {
        name: "DEMO · Laundry basket with handles",
        description: "DEMO LISTING · Lightweight laundry basket with carrying handles. Sample item; verify size at pickup.",
        price: 200, category: "other", condition: "Like New", listingType: "sell", quantity: 1,
        location: "Hostel Laundry · Room 2",
        productImages: [image("photo-1558618666-fcd25c85cd64")],
    },
    {
        name: "DEMO · USB desk microphone",
        description: "DEMO LISTING · USB microphone for online classes and calls. Check cable and computer compatibility before purchase.",
        price: 850, category: "electronics", condition: "Good Condition", listingType: "sell", quantity: 1,
        location: "Media Lab · Room 5",
        productImages: [image("photo-1590602847861-f357a9332BBC")],
    },
    {
        name: "DEMO · Pocket umbrella for campus walks",
        description: "DEMO LISTING · Compact foldable umbrella for rainy campus commutes. Open and close it once before buying.",
        price: 160, category: "other", condition: "Brand New", listingType: "sell", quantity: 3,
        location: "Campus Shop · Checkout",
        productImages: [image("photo-1534274988757-a28bf1a57c17")],
    },
];

const seedDemoProducts = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is required to seed demo listings");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const seller = await User.findOne({ role: "seller" }).sort({ createdAt: 1 });
    if (!seller) {
        throw new Error("Create/register a seller account before seeding demo listings");
    }

    const names = sampleListings.map((listing) => listing.name);
    const existingNames = new Set(
        (await Product.find({ createdBy: seller._id, name: { $in: names } }).distinct("name"))
    );

    const listingsToInsert = sampleListings
        .filter((listing) => !existingNames.has(listing.name))
        .map((listing) => ({
            ...listing,
            createdBy: seller._id,
            inStock: true,
        }));

    if (listingsToInsert.length > 0) {
        await Product.insertMany(listingsToInsert);
    }

    const demoRentals = sampleListings.filter((listing) => listing.listingType === "rent").length;
    const demoItems = sampleListings.length - demoRentals;
    console.log(`Demo seed complete: ${listingsToInsert.length} added; ${existingNames.size} already existed.`);
    console.log(`Seed set: ${sampleListings.length} total (${demoRentals} rentals/homes, ${demoItems} sale items).`);
    console.log(`Seller account: ${seller.email}`);
};

seedDemoProducts()
    .catch((error) => {
        console.error("Demo product seed failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
