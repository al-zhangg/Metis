#!/usr/bin/env bash

# Metis - Commit and Push Script
echo "🏛️ Preparing to commit Metis to GitHub..."

# Add all files
echo "📁 Adding all files..."
git add .

# Create commit message
echo "💾 Creating commit..."
git commit -m "feat: Complete Metis habit tracker with Greek mythology theme

✨ Features:
- Greek mythology-themed UI with marble, bronze, and laurel colors
- Habit tracking with streaks and XP system
- AI-powered journal analysis with Oracle cards
- Achievement system with divine quests
- Responsive design with smooth animations
- GitHub Pages deployment configuration

🔧 Technical:
- React 18 + TypeScript + Tailwind CSS
- Supabase integration with fallback mock data
- AI service integration (Cerebras API)
- Comprehensive component library
- GitHub Actions workflow for auto-deployment

🚀 Ready for deployment to GitHub Pages!"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Successfully pushed to GitHub!"
echo "🌐 Enable GitHub Pages in your repo settings to deploy automatically"
echo "📍 Your site will be available at: https://yourusername.github.io/metis/"