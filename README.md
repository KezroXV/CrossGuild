# CrossGuild - Gaming Gear E-commerce Platform

A modern e-commerce platform specialized in gaming gear and accessories, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Top-Selling Gaming Gear**: Dynamic display of best-selling gaming products
- **Product Catalog**: Comprehensive gaming gear inventory with ratings and reviews
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Product Search & Filtering**: Advanced product discovery features
- **Real-time Data**: Dynamic product loading with server-side API integration

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom React components
- **State Management**: React hooks (useState, useEffect)

## Project Structure

```
components/
├── TopSellingGamingGear.tsx    # Top-selling products section
├── ProductCard.tsx             # Individual product display component
└── ...other components
api/
├── products/                   # Product API endpoints
└── ...other API routes
```

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd CrossGuild
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### Products

- `GET /api/products` - Fetch all products
- `GET /api/products?sort=topSelling` - Fetch top-selling products

### Product Schema

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  averageRating: number;
  images: { url: string }[];
  brand?: { name: string };
  quantity: number;
  topSelling: number;
  slug: string;
}
```

## Components

### TopSellingGamingGear

Displays the top 4 best-selling gaming products with:

- Dynamic product fetching
- Error handling
- Responsive grid layout
- Product sorting by sales volume

### ProductCard

Reusable component for displaying individual product information.

## Development

### Adding New Products

1. Ensure your product data follows the Product interface
2. Update the `topSelling` field for featured products
3. Products are automatically sorted by sales volume

### Styling

The project uses Tailwind CSS with custom accent colors. Key classes:

- `text-accent` - Brand accent color
- Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

[Add your license information here]

## Contact

[Add contact information or links]
