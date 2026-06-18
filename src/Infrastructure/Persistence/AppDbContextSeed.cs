using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Persistence;

public static class AppDbContextSeed
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await context.Database.MigrateAsync();

        var users = await SeedUsersAsync(context);
        var cats = await SeedCategoriesAsync(context);
        var products = await SeedProductsAsync(context, cats);
        var addresses = await SeedAddressesAsync(context, users);
        var vouchers = await SeedVouchersAsync(context);
        var orders = await SeedOrdersAsync(context, users, addresses, products, vouchers);
        await SeedCartsAsync(context, users, products);
        await SeedReviewsAsync(context, users, products, orders);
        await SeedNotificationsAsync(context, users, orders);
        await SeedWishListsAsync(context, users, products);

        await context.SaveChangesAsync();
    }

    // ─────────────────────────────────────────
    // USERS
    // ─────────────────────────────────────────
    private static async Task<List<User>> SeedUsersAsync(AppDbContext context)
    {
        var seedDefs = new[]
        {
            (username: "binh",  email: "binh@example.com",  hash: BCrypt.Net.BCrypt.HashPassword("Binh@123456"),  fullName: "Trần Thị Bình",  role: "Customer"),
            (username: "cuong", email: "cuong@example.com", hash: BCrypt.Net.BCrypt.HashPassword("Cuong@123456"), fullName: "Lê Văn Cường",   role: "Customer"),
        };

        foreach (var def in seedDefs)
        {
            if (!await context.Users.AnyAsync(u => u.Email.Value == def.email))
            {
                var result = User.Create(def.username, def.email, def.hash, def.fullName);
                if (result.IsSuccess)
                {
                    result.Value.AssignRole(def.role);
                    await context.Users.AddAsync(result.Value);
                }
            }
        }

        await context.SaveChangesAsync();

        return await context.Users
            .Where(u => new[] { "binh@example.com", "cuong@example.com" }.Contains(u.Email.Value))
            .OrderBy(u => u.Email.Value == "binh@example.com" ? 0 : 1)
            .ToListAsync();
    }

    // ─────────────────────────────────────────
    // CATEGORIES
    // ─────────────────────────────────────────
    private static async Task<List<Category>> SeedCategoriesAsync(AppDbContext context)
    {
        if (await context.Categories.AnyAsync()) return await context.Categories.ToListAsync();

        var categories = new List<Category>
        {
            Category.Create("Áo",       "Áo thun, áo sơ mi, áo khoác các loại").Value,
            Category.Create("Quần",     "Quần jeans, quần tây, quần short").Value,
            Category.Create("Giày dép", "Giày sneaker, dép sandal, giày cao gót").Value,
            Category.Create("Túi xách", "Túi tote, balo, ví da, clutch").Value,
            Category.Create("Phụ kiện", "Thắt lưng, mũ nón, kính mắt, trang sức").Value,
        };

        await context.Categories.AddRangeAsync(categories);
        return categories;
    }

    // ─────────────────────────────────────────
    // PRODUCTS
    // ─────────────────────────────────────────
    private static async Task<List<Product>> SeedProductsAsync(AppDbContext context, List<Category> cats)
    {
        if (await context.Products.AnyAsync()) return await context.Products.ToListAsync();

        var catAo = cats[0].Id;
        var catQuan = cats[1].Id;
        var catGiay = cats[2].Id;
        var catTui = cats[3].Id;
        var catPhuKien = cats[4].Id;

        var productDefs = new[]
        {
            (name: "Áo Thun Basic Unisex Cotton 100%", price: 199_000m, stock: 150, catId: catAo,
             desc: "Chất liệu cotton 100%, form rộng unisex, nhiều màu sắc trẻ trung.",
             img:  "https://cdn.example.com/ao-thun-basic.jpg"),

            (name: "Áo Sơ Mi Linen Tay Dài Nam", price: 450_000m, stock: 80, catId: catAo,
             desc: "Chất linen thoáng mát, phù hợp đi làm và dạo phố.",
             img:  "https://cdn.example.com/ao-so-mi-linen.jpg"),

            (name: "Quần Jeans Slim Fit Nam", price: 590_000m, stock: 100, catId: catQuan,
             desc: "Denim co giãn 4 chiều, form slim fit tôn dáng.",
             img:  "https://cdn.example.com/quan-jeans-slim.jpg"),

            (name: "Quần Short Kaki Nữ", price: 320_000m, stock: 120, catId: catQuan,
             desc: "Chất kaki mềm, cạp chun tiện lợi, phù hợp mùa hè.",
             img:  "https://cdn.example.com/quan-short-kaki.jpg"),

            (name: "Giày Sneaker Trắng Nam Nữ", price: 850_000m, stock: 60, catId: catGiay,
             desc: "Đế cao su chống trơn, da PU dễ vệ sinh, phong cách tối giản.",
             img:  "https://cdn.example.com/giay-sneaker-trang.jpg"),

            (name: "Dép Sandal Quai Ngang Nữ", price: 280_000m, stock: 90, catId: catGiay,
             desc: "Đế EVA êm chân, quai da mềm, thích hợp đi biển và dạo phố.",
             img:  "https://cdn.example.com/dep-sandal-nu.jpg"),

            (name: "Túi Tote Canvas In Họa Tiết", price: 250_000m, stock: 200, catId: catTui,
             desc: "Vải canvas dày dặn, in hoạ tiết độc quyền, dung tích rộng.",
             img:  "https://cdn.example.com/tui-tote-canvas.jpg"),

            (name: "Balo Da PU Laptop 14 inch", price: 720_000m, stock: 50, catId: catTui,
             desc: "Da PU cao cấp, ngăn laptop đệm xốp, khóa kéo chống nước.",
             img:  "https://cdn.example.com/balo-da-pu.jpg"),

            (name: "Mũ Bucket Vải Twill Unisex", price: 180_000m, stock: 180, catId: catPhuKien,
             desc: "Vải twill bền màu, form bucket che nắng, phong cách streetwear.",
             img:  "https://cdn.example.com/mu-bucket.jpg"),

            (name: "Thắt Lưng Da Bò Thật Nam", price: 390_000m, stock: 70, catId: catPhuKien,
             desc: "Da bò thật, khóa hợp kim mạ vàng, bền và sang trọng.",
             img:  "https://cdn.example.com/that-lung-da-bo.jpg"),
        };

        var products = new List<Product>();
        foreach (var def in productDefs)
        {
            var p = Product.Create(def.name, def.price, def.stock, def.catId, def.desc).Value;
            p.Update(def.name, def.price, def.desc, def.img, def.catId); // set ImageUrl
            products.Add(p);
        }

        await context.Products.AddRangeAsync(products);

        var images = products.Select((p, i) => ProductImage.Create(
            productId: p.Id,
            imageUrl: productDefs[i].img,
            isMain: true,
            sortOrder: 0
        )).ToList();

        await context.ProductImages.AddRangeAsync(images);
        return products;
    }

    // ─────────────────────────────────────────
    // ADDRESSES
    // ─────────────────────────────────────────
    private static async Task<List<Address>> SeedAddressesAsync(AppDbContext context, List<User> users)
    {
        if (await context.Addresses.AnyAsync()) return await context.Addresses.ToListAsync();

        var addresses = new List<Address>
        {
            Address.Create(
                userId:    users[0].Id,
                fullName:  "Trần Thị Bình",
                phone:     "0901000002",
                province:  "TP. Hồ Chí Minh",
                district:  "Quận 1",
                ward:      "Phường Bến Nghé",
                street:    "123 Lê Lợi",
                isDefault: true
            ),
            Address.Create(
                userId:    users[1].Id,
                fullName:  "Lê Văn Cường",
                phone:     "0901000003",
                province:  "TP. Hồ Chí Minh",
                district:  "Quận 1",
                ward:      "Phường Bến Thành",
                street:    "456 Nguyễn Huệ",
                isDefault: true
            ),
        };

        await context.Addresses.AddRangeAsync(addresses);
        return addresses;
    }

    // ─────────────────────────────────────────
    // VOUCHERS
    // ─────────────────────────────────────────
    private static async Task<List<Voucher>> SeedVouchersAsync(AppDbContext context)
    {
        if (await context.Vouchers.AnyAsync()) return await context.Vouchers.ToListAsync();

        var vouchers = new List<Voucher>
        {
            Voucher.Create(
                code:              "WELCOME10",
                type:              VoucherType.Percentage,
                discountValue:     10m,
                totalQuantity:     500,
                startDate:         DateTime.UtcNow,
                endDate:           DateTime.UtcNow.AddMonths(6),
                minOrderAmount:    500_000m,
                maxDiscountAmount: null,
                maxUsagePerUser:   1,
                description:       "Giảm 10% cho đơn hàng đầu tiên",
                createdBy:         "seed"
            ),
            Voucher.Create(
                code:              "SAVE50K",
                type:              VoucherType.FixedAmount,
                discountValue:     50_000m,
                totalQuantity:     1000,
                startDate:         DateTime.UtcNow,
                endDate:           DateTime.UtcNow.AddMonths(3),
                minOrderAmount:    300_000m,
                maxDiscountAmount: null,
                maxUsagePerUser:   1,
                description:       "Giảm 50.000đ cho đơn từ 300.000đ",
                createdBy:         "seed"
            ),
            Voucher.Create(
                code:              "SUMMER25",
                type:              VoucherType.Percentage,
                discountValue:     25m,
                totalQuantity:     200,
                startDate:         DateTime.UtcNow,
                endDate:           DateTime.UtcNow.AddMonths(2),
                minOrderAmount:    1_000_000m,
                maxDiscountAmount: 500_000m,
                maxUsagePerUser:   1,
                description:       "Khuyến mãi hè – giảm 25%",
                createdBy:         "seed"
            ),
        };

        await context.Vouchers.AddRangeAsync(vouchers);
        return vouchers;
    }

    // ─────────────────────────────────────────
    // ORDERS
    // ─────────────────────────────────────────
    private static async Task<List<Order>> SeedOrdersAsync(
        AppDbContext context,
        List<User> users,
        List<Address> addresses,
        List<Product> products,
        List<Voucher> vouchers)
    {
        if (await context.Orders.AnyAsync()) return await context.Orders.ToListAsync();

        var addr1 = addresses[0];
        var addr2 = addresses[1];
        var voucher = vouchers[1];

        var aoThun = products[0];
        var quanJean = products[2];
        var subTotal1 = aoThun.Price * 2 + quanJean.Price;
        var order1 = Order.Create(
            orderCode: "ORD-20250101-0001",
            userId: users[0].Id,
            shippingAddress: addr1,
            subTotal: subTotal1,
            shippingFee: 30_000m,
            discountAmount: voucher.CalculateDiscount(subTotal1),
            paymentMethod: PaymentMethod.BankTransfer,
            voucherId: voucher.Id,
            voucherCode: voucher.Code,
            note: "Giao giờ hành chính, gói quà giúp mình nhé"
        );
        order1.AddItem(OrderItem.Create(order1.Id, aoThun, 2));
        order1.AddItem(OrderItem.Create(order1.Id, quanJean, 1));
        order1.Confirm();
        order1.StartProcessing();
        order1.Ship();
        order1.Deliver();
        order1.MarkPaid();

        var sneaker = products[4];
        var balo = products[7];
        var order2 = Order.Create(
            orderCode: "ORD-20250401-0002",
            userId: users[1].Id,
            shippingAddress: addr2,
            subTotal: sneaker.Price + balo.Price,
            shippingFee: 0m,
            discountAmount: 0m,
            paymentMethod: PaymentMethod.COD
        );
        order2.AddItem(OrderItem.Create(order2.Id, sneaker, 1));
        order2.AddItem(OrderItem.Create(order2.Id, balo, 1));
        order2.Confirm();
        order2.StartProcessing();

        var orders = new List<Order> { order1, order2 };
        await context.Orders.AddRangeAsync(orders);

        var payment1 = Payment.Create(order1.Id, PaymentMethod.BankTransfer, order1.TotalAmount);
        payment1.MarkPaid("TXN-20250101-001");

        var payment2 = Payment.Create(order2.Id, PaymentMethod.COD, order2.TotalAmount);

        await context.Payments.AddRangeAsync(payment1, payment2);
        return orders;
    }

    // ─────────────────────────────────────────
    // CARTS
    // ─────────────────────────────────────────
    private static async Task SeedCartsAsync(AppDbContext context, List<User> users, List<Product> products)
    {
        if (await context.Carts.AnyAsync()) return;

        var cart = Cart.Create(users[0].Id);
        cart.AddOrUpdateItem(products[1].Id, products[1].Price, 1);
        cart.AddOrUpdateItem(products[5].Id, products[5].Price, 2);
        cart.AddOrUpdateItem(products[8].Id, products[8].Price, 1);

        await context.Carts.AddAsync(cart);
    }

    // ─────────────────────────────────────────
    // REVIEWS
    // ─────────────────────────────────────────
    private static async Task SeedReviewsAsync(
        AppDbContext context,
        List<User> users,
        List<Product> products,
        List<Order> orders)
    {
        if (await context.Reviews.AnyAsync()) return;

        var reviews = new List<Review>
        {
            Review.Create(
                productId: products[0].Id,
                userId:    users[0].Id,
                orderId:   orders[0].Id,
                rating:    5,
                comment:   "Vải mềm mịn, mặc rất thoải mái, màu đẹp đúng như ảnh. Sẽ mua thêm!"
            ),
            Review.Create(
                productId: products[2].Id,
                userId:    users[0].Id,
                orderId:   orders[0].Id,
                rating:    4,
                comment:   "Form đẹp, co giãn tốt, chỉ hơi chật ở phần đùi, nên lấy size lớn hơn 1 size."
            ),
        };

        reviews[0].Approve();
        reviews[1].Approve();

        await context.Reviews.AddRangeAsync(reviews);
    }

    // ─────────────────────────────────────────
    // NOTIFICATIONS
    // ─────────────────────────────────────────
    private static async Task SeedNotificationsAsync(
        AppDbContext context,
        List<User> users,
        List<Order> orders)
    {
        if (await context.Notifications.AnyAsync()) return;

        var notifications = new List<Notification>
        {
            Notification.Create(
                userId:      users[0].Id,
                type:        NotificationType.Order,
                title:       "Đơn hàng đã được giao",
                message:     $"Đơn hàng {orders[0].OrderCode} đã được giao thành công.",
                referenceId: orders[0].Id.ToString()
            ),
            Notification.Create(
                userId:      users[1].Id,
                type:        NotificationType.Order,
                title:       "Xác nhận đơn hàng",
                message:     $"Chúng tôi đã nhận đơn hàng {orders[1].OrderCode} của bạn.",
                referenceId: orders[1].Id.ToString()
            ),
        };

        await context.Notifications.AddRangeAsync(notifications);
    }

    // ─────────────────────────────────────────
    // WISHLISTS
    // ─────────────────────────────────────────
    private static async Task SeedWishListsAsync(
        AppDbContext context,
        List<User> users,
        List<Product> products)
    {
        if (await context.WishLists.AnyAsync()) return;

        var wishLists = new List<WishList>
        {
            WishList.Create(users[0].Id, products[4].Id),
            WishList.Create(users[1].Id, products[6].Id),
        };

        await context.WishLists.AddRangeAsync(wishLists);
    }
}