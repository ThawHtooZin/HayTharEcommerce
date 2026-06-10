<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Apparel', 'slug' => 'apparel', 'description' => 'Trendy tops, shirts & kawaii streetwear'],
            ['name' => 'Car Accessories', 'slug' => 'car-accessories', 'description' => 'Steering wheel covers, seatbelt pads & more'],
            ['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Scrunchies, clips & cute extras'],
            ['name' => 'Home & Kitchen', 'slug' => 'home-kitchen', 'description' => 'Bento boxes, molds & lifestyle goods'],
            ['name' => 'Blind Boxes', 'slug' => 'blind-boxes', 'description' => 'Mystery drops — open it, love it, or trade it'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        $catMap = Category::pluck('id', 'slug');

        $products = [
            ['name' => 'Wersher 6 Graphic Tee', 'image' => '656389563_3120324605021782_4959043587787876200_n.jpg', 'category' => 'apparel', 'price' => 28.00, 'compare_at_price' => 36.00, 'aesthetic' => 'y2k', 'badge' => 'BEST', 'is_bestseller' => true, 'is_featured' => true, 'rating' => 4.9, 'review_count' => 312],
            ['name' => 'Lace Trim Asymmetrical Top', 'image' => '656427483_3120324461688463_4143568633842806156_n.jpg', 'category' => 'apparel', 'price' => 32.50, 'aesthetic' => 'soft-girl', 'badge' => 'NEW', 'is_featured' => true, 'rating' => 4.8, 'review_count' => 89],
            ['name' => 'Cherry Blossom Tank Top', 'image' => '656566816_3120320501688859_7210580663855960666_n.jpg', 'category' => 'apparel', 'price' => 24.99, 'aesthetic' => 'soft-girl', 'rating' => 4.7, 'review_count' => 156],
            ['name' => 'Butterfly Clip Graphic Shirt', 'image' => '656699356_3120324658355110_8803700937134792727_n.jpg', 'category' => 'apparel', 'price' => 29.99, 'compare_at_price' => 38.00, 'aesthetic' => 'y2k', 'badge' => 'SALE', 'rating' => 4.6, 'review_count' => 203],
            ['name' => 'Pastel Heart Oversized Hoodie', 'image' => '656818639_3120320465022196_640616499552871353_n.jpg', 'category' => 'apparel', 'price' => 48.00, 'compare_at_price' => 62.00, 'aesthetic' => 'soft-girl', 'badge' => 'SALE', 'is_bestseller' => true, 'is_featured' => true, 'rating' => 4.7, 'review_count' => 428],
            ['name' => 'Kawaii Cloud Print Tee', 'image' => '657992995_3120324655021777_592565702721267496_n.jpg', 'category' => 'apparel', 'price' => 26.50, 'aesthetic' => 'fairy-kei', 'rating' => 4.8, 'review_count' => 97],
            ['name' => 'Fuzzy Bow Steering Wheel Cover', 'image' => '707874376_3184118231975752_5162770663201040072_n.jpg', 'category' => 'car-accessories', 'price' => 16.50, 'aesthetic' => 'soft-girl', 'badge' => 'BEST', 'is_bestseller' => true, 'is_featured' => true, 'rating' => 4.9, 'review_count' => 567],
            ['name' => 'Pink Plush Seatbelt Pad Set', 'image' => '708546952_3184118208642421_1820282030167997078_n.jpg', 'category' => 'car-accessories', 'price' => 14.99, 'aesthetic' => 'soft-girl', 'rating' => 4.8, 'review_count' => 234],
            ['name' => 'Toy Story Fry Seatbelt Cover', 'image' => '709101561_3184118165309092_7503866352454433591_n.jpg', 'category' => 'car-accessories', 'price' => 18.99, 'aesthetic' => 'y2k', 'badge' => 'NEW', 'is_featured' => true, 'rating' => 4.9, 'review_count' => 178],
            ['name' => 'Character Leather Headrest Hook', 'image' => '709134962_3184118121975763_6937115889415521179_n.jpg', 'category' => 'car-accessories', 'price' => 12.50, 'aesthetic' => 'pastel-goth', 'rating' => 4.7, 'review_count' => 145],
            ['name' => 'Hello Kitty Steering Cover', 'image' => '709266101_3183845032003072_1085298321727309001_n.jpg', 'category' => 'car-accessories', 'price' => 17.99, 'aesthetic' => 'soft-girl', 'badge' => 'BEST', 'rating' => 4.8, 'review_count' => 389],
            ['name' => 'Cinnamoroll Car Organizer', 'image' => '709486371_3183845068669735_2407605173350059541_n.jpg', 'category' => 'car-accessories', 'price' => 22.00, 'aesthetic' => 'fairy-kei', 'rating' => 4.6, 'review_count' => 112],
            ['name' => 'Kuromi Seatbelt Shoulder Pad', 'image' => '709486973_3183879191999656_8904938606544690125_n.jpg', 'category' => 'car-accessories', 'price' => 15.50, 'aesthetic' => 'pastel-goth', 'badge' => 'NEW', 'rating' => 4.9, 'review_count' => 267],
            ['name' => 'My Melody Car Hook Set', 'image' => '709487222_3183879218666320_457993393473104581_n.jpg', 'category' => 'car-accessories', 'price' => 11.99, 'aesthetic' => 'soft-girl', 'rating' => 4.7, 'review_count' => 98],
            ['name' => 'Pompompurin Dashboard Buddy', 'image' => '709527698_3184118285309080_7220434255217120021_n.jpg', 'category' => 'car-accessories', 'price' => 19.99, 'aesthetic' => 'fairy-kei', 'is_featured' => true, 'rating' => 4.8, 'review_count' => 201],
            ['name' => 'Floral Plush Scrunchie', 'image' => '709548208_3184118171975758_5914335189501750563_n.jpg', 'category' => 'accessories', 'price' => 9.99, 'aesthetic' => 'soft-girl', 'badge' => 'BEST', 'is_bestseller' => true, 'rating' => 4.9, 'review_count' => 445],
            ['name' => 'Character Leg Scrunchie Duo', 'image' => '709566825_3183845045336404_3435239887271061258_n.jpg', 'category' => 'accessories', 'price' => 12.99, 'aesthetic' => 'fairy-kei', 'badge' => 'NEW', 'rating' => 4.8, 'review_count' => 167],
            ['name' => 'Pastel Flower Hair Clip Set', 'image' => '709707718_3184118241975751_8854681964660994523_n.jpg', 'category' => 'accessories', 'price' => 8.50, 'aesthetic' => 'soft-girl', 'rating' => 4.7, 'review_count' => 234],
            ['name' => 'Y2K Butterfly Hair Clips', 'image' => '710000486_3183845112003064_1487331587964828493_n.jpg', 'category' => 'accessories', 'price' => 7.99, 'aesthetic' => 'y2k', 'is_featured' => true, 'rating' => 4.6, 'review_count' => 312],
            ['name' => 'Gothic Rose Scrunchie Pack', 'image' => '710020469_3184118195309089_229300177773952173_n.jpg', 'category' => 'accessories', 'price' => 10.99, 'aesthetic' => 'pastel-goth', 'rating' => 4.8, 'review_count' => 89],
            ['name' => 'Hello Kitty Sandwich Mold', 'image' => '711679853_3188528364868072_3142679786535425880_n.jpg', 'category' => 'home-kitchen', 'price' => 13.50, 'aesthetic' => 'soft-girl', 'badge' => 'BEST', 'is_bestseller' => true, 'is_featured' => true, 'rating' => 4.9, 'review_count' => 523],
            ['name' => 'Kawaii Bento Box Set', 'image' => '710098529_3186289391758636_4960909430452006831_n.jpg', 'category' => 'home-kitchen', 'price' => 24.99, 'aesthetic' => 'fairy-kei', 'badge' => 'NEW', 'rating' => 4.8, 'review_count' => 198],
            ['name' => 'Pink Stationery Bundle', 'image' => '710245485_3183879195332989_5945812993106372572_n.jpg', 'category' => 'home-kitchen', 'price' => 18.00, 'aesthetic' => 'soft-girl', 'is_featured' => true, 'rating' => 4.7, 'review_count' => 156],
            ['name' => 'Character Rice Mold Kit', 'image' => '710373092_3186289651758610_2843028965857902719_n.jpg', 'category' => 'home-kitchen', 'price' => 15.99, 'aesthetic' => 'fairy-kei', 'rating' => 4.6, 'review_count' => 87],
            ['name' => 'Cute Egg Mold Set', 'image' => '710376508_3184114598642782_2444045311201697851_n.jpg', 'category' => 'home-kitchen', 'price' => 11.50, 'aesthetic' => 'soft-girl', 'rating' => 4.8, 'review_count' => 134],
            ['name' => 'Lunch Box Divider Pack', 'image' => '710537112_3186289688425273_6718363820684999553_n.jpg', 'category' => 'home-kitchen', 'price' => 9.99, 'aesthetic' => 'fairy-kei', 'rating' => 4.5, 'review_count' => 67],
            ['name' => 'Mini Sauce Container Set', 'image' => '710555759_3186289625091946_1797176675041046118_n.jpg', 'category' => 'home-kitchen', 'price' => 8.99, 'aesthetic' => 'soft-girl', 'rating' => 4.7, 'review_count' => 92],
            ['name' => 'Kawaii Chopstick Rest Duo', 'image' => '710667076_3186289348425307_2347987540209526405_n.jpg', 'category' => 'home-kitchen', 'price' => 7.50, 'aesthetic' => 'fairy-kei', 'rating' => 4.6, 'review_count' => 45],
            ['name' => 'Mystery Plush Blind Box', 'image' => '711309684_3183879248666317_4425993837115985520_n.jpg', 'category' => 'blind-boxes', 'price' => 19.99, 'aesthetic' => 'soft-girl', 'badge' => 'NEW', 'is_blind_box' => true, 'is_featured' => true, 'rating' => 4.9, 'review_count' => 678],
            ['name' => 'Kawaii Keychain Blind Box', 'image' => '711368991_3186289351758640_1886582528142211787_n.jpg', 'category' => 'blind-boxes', 'price' => 14.99, 'aesthetic' => 'y2k', 'is_blind_box' => true, 'rating' => 4.8, 'review_count' => 345],
            ['name' => 'Character Sticker Blind Box', 'image' => '711405842_3186289618425280_1322636525341413100_n.jpg', 'category' => 'blind-boxes', 'price' => 12.99, 'aesthetic' => 'fairy-kei', 'is_blind_box' => true, 'rating' => 4.7, 'review_count' => 234],
            ['name' => 'Secret Rare Mini Plush Box', 'image' => '711465869_3183845082003067_5777108251609987782_n.jpg', 'category' => 'blind-boxes', 'price' => 24.99, 'aesthetic' => 'soft-girl', 'badge' => 'BEST', 'is_blind_box' => true, 'is_bestseller' => true, 'rating' => 4.9, 'review_count' => 512],
            ['name' => 'Pastel Accessory Blind Box', 'image' => '711493528_3186289381758637_3598985484571809375_n.jpg', 'category' => 'blind-boxes', 'price' => 16.50, 'aesthetic' => 'pastel-goth', 'is_blind_box' => true, 'rating' => 4.6, 'review_count' => 189],
            ['name' => 'Friday Drop Mystery Box', 'image' => '711618365_3186289518425290_6705877947412422089_n.jpg', 'category' => 'blind-boxes', 'price' => 22.00, 'aesthetic' => 'y2k', 'badge' => 'NEW', 'is_blind_box' => true, 'is_featured' => true, 'rating' => 4.8, 'review_count' => 401],
            ['name' => 'Strawberry Bunny Plushie', 'image' => '711679854_3184118295309079_8124434516892269944_n.jpg', 'category' => 'accessories', 'price' => 24.99, 'compare_at_price' => 32.00, 'aesthetic' => 'soft-girl', 'badge' => 'BEST', 'is_bestseller' => true, 'is_featured' => true, 'rating' => 4.9, 'review_count' => 312],
            ['name' => 'Mochi Axolotl Plush', 'image' => '711695691_3188528371534738_8563441142632076045_n.jpg', 'category' => 'accessories', 'price' => 19.99, 'aesthetic' => 'fairy-kei', 'badge' => 'NEW', 'is_featured' => true, 'rating' => 4.8, 'review_count' => 267],
            ['name' => 'Capybara Plush with Sprout', 'image' => '712484468_3186289505091958_6257479541230657245_n.jpg', 'category' => 'accessories', 'price' => 22.50, 'aesthetic' => 'soft-girl', 'badge' => 'NEW', 'is_featured' => true, 'rating' => 4.9, 'review_count' => 445],
            ['name' => 'Dreamy Lace Crop Top', 'image' => '712963644_3186289658425276_4515372221945837808_n.jpg', 'category' => 'apparel', 'price' => 34.00, 'aesthetic' => 'soft-girl', 'rating' => 4.7, 'review_count' => 123],
            ['name' => 'Chrome Heart Belt Set', 'image' => '714631582_3188520718202170_6489984029042890767_n.jpg', 'category' => 'accessories', 'price' => 16.99, 'aesthetic' => 'y2k', 'badge' => 'SALE', 'rating' => 4.6, 'review_count' => 178],
            ['name' => 'Fairy Kei Star Hair Pin', 'image' => '714689075_3186289678425274_6551418949431515780_n.jpg', 'category' => 'accessories', 'price' => 6.99, 'aesthetic' => 'fairy-kei', 'rating' => 4.8, 'review_count' => 89],
            ['name' => 'Gothic Lace Arm Warmers', 'image' => '714768482_3188520641535511_4848520770944250742_n.jpg', 'category' => 'apparel', 'price' => 18.50, 'aesthetic' => 'pastel-goth', 'rating' => 4.7, 'review_count' => 156],
            ['name' => 'Kawaii Desk Organizer', 'image' => '715454254_3188520778202164_4703119910279127494_n.jpg', 'category' => 'home-kitchen', 'price' => 21.99, 'aesthetic' => 'fairy-kei', 'is_featured' => true, 'rating' => 4.8, 'review_count' => 201],
        ];

        foreach ($products as $p) {
            $slug = Str::slug($p['name']);
            Product::updateOrCreate(
                ['slug' => $slug],
                [
                    'category_id' => $catMap[$p['category']],
                    'name' => $p['name'],
                    'description' => "Adorably curated {$p['name']} — shipped worldwide with love from HayThar.",
                    'price' => $p['price'],
                    'compare_at_price' => $p['compare_at_price'] ?? null,
                    'image' => $p['image'],
                    'aesthetic' => $p['aesthetic'],
                    'badge' => $p['badge'] ?? null,
                    'rating' => $p['rating'],
                    'review_count' => $p['review_count'],
                    'stock' => 100,
                    'in_stock' => true,
                    'is_blind_box' => $p['is_blind_box'] ?? false,
                    'is_bestseller' => $p['is_bestseller'] ?? false,
                    'is_featured' => $p['is_featured'] ?? false,
                ],
            );
        }

        if (Review::count() === 0) {
            $sampleReviews = [
                ['author' => 'Mika S.', 'rating' => 5, 'body' => 'So cute!! Exactly as pictured and super soft.'],
                ['author' => 'Luna K.', 'rating' => 5, 'body' => 'Fast shipping and adorable packaging. Will buy again!'],
                ['author' => 'Yuki T.', 'rating' => 4, 'body' => 'Love the quality. Slightly smaller than expected but still perfect.'],
            ];

            Product::take(5)->get()->each(function ($product) use ($sampleReviews) {
                foreach ($sampleReviews as $review) {
                    Review::create([
                        'product_id' => $product->id,
                        'author_name' => $review['author'],
                        'rating' => $review['rating'],
                        'body' => $review['body'],
                    ]);
                }
            });
        }
    }
}
