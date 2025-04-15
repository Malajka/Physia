# Physia

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.14.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-5.5.5-purple)](https://astro.build/)

## Project Description

Physia is a web application designed to help users suffering from overload-related muscle pain create personalized exercise plans. The application allows users to select affected body parts, assess pain intensity, and receive tailored exercise recommendations based on pre-developed sets by physiotherapists. the physiotherapist first feeds the database with their expertise and specific instructions, and then the LLM generates a personalized exercise plan for each user based on this context and selected by user information.

### Problem Statement

The project addresses the challenges of accessing physiotherapists and managing overload-related muscle pain, which often requires multiple visits and modifications based on pain intensity.

## Tech Stack

### Frontend
- [Astro 5](https://astro.build/) - Modern static site builder
- [React 19](https://react.dev/) - Interactive UI components
- [TypeScript 5](https://www.typescriptlang.org/) - Type-safe development
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Reusable UI components

### Backend
- [Supabase](https://supabase.com/) - Backend-as-a-Service with PostgreSQL
  - Authentication
  - Database
  - Real-time capabilities

### AI Integration
- [Openrouter.ai](https://openrouter.ai/) - AI model communication service

### Development Tools
- ESLint - Code linting
- Prettier - Code formatting
- Husky - Git hooks
- TypeScript - Static typing

## Getting Started

### Prerequisites
- Node.js >= 22.14.0
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/physia.git
cd physia
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Scope

### Core Features
- Body part selection (6 areas)
- Pain intensity assessment (1-10 scale)
- Personalized exercise plans
- User feedback system
- Account management

### Project Boundaries
- Web-only application
- No medical consultation replacement
- No gamification features
- No mobile applications
- No public API

## Project Status

The project is currently in active development. Future plans include:
- Enhanced exercise recommendations
- Improved user feedback system
- Additional body part support
- Performance optimizations

## License
This project is proprietary and not open-source. All rights are reserved by the author. Unauthorized copying, distribution, modification, or use of any part of this repository is strictly prohibited without explicit written permission from the author.

For inquiries regarding licensing or permissions, please contact the repository owner directly.