# Urban Pulse

> The beating heart of a city is its people.

Urban Pulse is a modern civic reporting platform that empowers citizens to inform local government and businesses about issues in their community. Built with Next.js and featuring an interactive map interface, Urban Pulse helps make cities better places to live.

## Features

### Interactive Map Dashboard
- **Heatmap Visualization**: See report density across the city with dynamic heatmaps
- **Pin-based Reporting**: Click anywhere on the map to create a report at that location
- **Real-time Updates**: View all community reports instantly on the map

### Report Management
- **Create Reports**: Submit issues with title, description, location, and urgency level
- **Image Upload**: Upload photos with automatic AI-generated descriptions
- **Urgency Levels**: Categorize reports as Low, Medium, or High priority
- **Edit & Delete**: Manage your own reports with full CRUD operations

### Community Engagement
- **5-Star Rating System**: Rate reports to help prioritize community concerns
- **Report Clustering**: Automatically group nearby reports to identify problem areas
- **Statistics Dashboard**: View priority breakdowns and report counts

### AI-Powered Features
- **Auto-Generated Descriptions**: Upload an image and get AI-suggested descriptions using Ollama
- **Smart Location Detection**: Automatic geocoding for readable location names

### User Authentication
- **Secure Authentication**: Powered by Stack Auth
- **User Profiles**: Track your own reports and contributions
- **Personal Dashboard**: View and manage your reports separately

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Mapbox GL** - Interactive maps and visualizations
- **Radix UI** - Accessible component primitives
- **Motion** - Smooth animations
- **TanStack Table** - Powerful data tables

### Backend
- **Prisma** - Type-safe database ORM
- **PostgreSQL** (Neon) - Serverless database
- **AWS S3** - Image storage with multipart uploads
- **Stack Auth** - Authentication and user management
- **Ollama** - Local AI for image description generation

### Development Tools
- **Biome** - Fast linter and formatter
- **Nix** - Reproducible development environment
- **Bun** - Fast JavaScript runtime

## Getting Started

### Prerequisites

- **Node.js 22** or higher
- **Bun** (recommended) or npm/yarn/pnpm
- **PostgreSQL** database (or Neon account)
- **AWS S3** bucket for image storage
- **Mapbox** access token
- **Stack Auth** project configured
- **Ollama** (optional, for AI features)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
NEXT_PUBLIC_S3_BUCKET_NAME=your_bucket_name

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Stack Auth
STACK_PROJECT_ID=your_project_id
STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
STACK_SERVER_KEY=your_server_key

# Ollama (optional)
OLLAMA_BASE_URL=http://localhost:11434
```

### Installation

#### Using Bun (Recommended)

```bash
bun install
```

### Database Setup

1. Run Prisma migrations:

```bash
bunx prisma migrate dev
```

2. Generate Prisma Client:

```bash
bunx prisma generate
```

### Development

Start the development server:

```bash
bun run dev
# or
nix run .#dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using Nix (Optional BUT HIGHLY RECOMMENDED)

If you're using Nix, you can use the provided flake:

```bash
# Enter development shell
nix develop

# Run development server
nix run .#dev
```



## Scripts

```bash
# Development
bun run dev          # Start dev server.
# or
nix run .#dev        # Start dev server but you're cooler than most people.
```

## Key Features Explained

### Report Clustering

The platform automatically groups reports that are within a specified distance (default: 100 meters) using a connectivity-based algorithm. This helps identify problem areas where multiple issues have been reported.

### Multipart Image Upload

Large images are uploaded to S3 using multipart uploads (5MB chunks) for better reliability and progress tracking.

### AI Description Generation

When uploading an image, OpenRouter analyzes it and suggests a description, which users can accept by pressing Tab.

## Contributing

Contributions are not welcome - I need sleep

## License

Honestly idek

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Maps powered by [Mapbox](https://www.mapbox.com)
- Authentication by [Stack](https://stack-auth.com)
- Database hosted on [Neon](https://neon.tech)
- AI features powered by [OpenRouter](https://openrouter.com)

---

**Urban Pulse** - Helping communities make their cities better, one report at a time.

(weewoo, safe.txt)
