const fs = require("fs");
const path = require("path");

// Parse .env manually
try {
	const envPath = path.join(__dirname, "../.env");
	if (fs.existsSync(envPath)) {
		const envFile = fs.readFileSync(envPath, "utf8");
		envFile.split("\n").forEach((line) => {
			const parts = line.split("=");
			if (parts.length >= 2) {
				const key = parts[0].trim();
				const value = parts
					.slice(1)
					.join("=")
					.trim()
					.replace(/^["']|["']$/g, "");
				process.env[key] = value;
			}
		});
	}
} catch (e) {}

const { PrismaClient } = require("@prisma/client");
const { PrismaLibSql } = require("@prisma/adapter-libsql");
const bcrypt = require("bcryptjs");

console.log("Runtime process.env.DATABASE_URL:", process.env.DATABASE_URL);

const rawUrl = process.env.DATABASE_URL || 'file:prisma/dev.db';
let dbUrl = rawUrl;
if (rawUrl.startsWith('file:')) {
  const filePath = rawUrl.slice(5);
  if (!path.isAbsolute(filePath)) {
    dbUrl = `file:${path.resolve(__dirname, '..', filePath)}`;
  }
}
const adapter = new PrismaLibSql({
	url: dbUrl,
});
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("Seeding database...");

	// Clean existing tables (except migration logs)
	await prisma.payment.deleteMany({});
	await prisma.orderItem.deleteMany({});
	await prisma.order.deleteMany({});
	await prisma.cartItem.deleteMany({});
	await prisma.product.deleteMany({});
	await prisma.address.deleteMany({});
	await prisma.coupon.deleteMany({});
	await prisma.user.deleteMany({});

	// Passwords
	const adminPasswordHash = await bcrypt.hash("admin123", 10);
	const userPasswordHash = await bcrypt.hash("user123", 10);

	// Seed Users
	const admin = await prisma.user.create({
		data: {
			name: "GoCart Admin",
			email: "admin@gocart.com",
			password: adminPasswordHash,
			role: "ADMIN",
			address: "123 Admin St, Tech City, CA, 94016, USA",
		},
	});

	const user = await prisma.user.create({
		data: {
			name: "John Doe",
			email: "user@gocart.com",
			password: userPasswordHash,
			role: "USER",
			address: "456 Elm St, Shopping Town, NY, 10001, USA",
		},
	});

	// Seed default addresses
	await prisma.address.create({
		data: {
			userId: admin.id,
			name: "GoCart Admin Office",
			email: "admin@gocart.com",
			street: "123 Admin St",
			city: "Tech City",
			state: "CA",
			zip: "94016",
			country: "USA",
			phone: "123-456-7890",
		},
	});

	await prisma.address.create({
		data: {
			userId: user.id,
			name: "John Doe Residence",
			email: "user@gocart.com",
			street: "456 Elm St",
			city: "Shopping Town",
			state: "NY",
			zip: "10001",
			country: "USA",
			phone: "987-654-3210",
		},
	});

	// Seed default coupons
	const coupons = [
		{
			code: "NEW20",
			description: "20% Off for New Users",
			discount: 20,
			expiresAt: new Date("2028-12-31"),
		},
		{
			code: "OFF10",
			description: "10% Off for All Orders",
			discount: 10,
			expiresAt: new Date("2028-12-31"),
		},
		{
			code: "SUPER50",
			description: "50% Mega Discount",
			discount: 50,
			expiresAt: new Date("2028-12-31"),
		},
	];

	for (const coupon of coupons) {
		await prisma.coupon.create({
			data: coupon,
		});
	}

	console.log("Seeding completed successfully.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
