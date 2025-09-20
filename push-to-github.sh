#!/bin/bash

# Metis - Push to GitHub Script
echo "🚀 Pushing Metis changes to GitHub..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
    echo "✅ Git repository initialized"
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No GitHub remote found."
    echo "📝 Please add your GitHub repository URL:"
    echo "   git remote add origin https://github.com/yourusername/metis.git"
    echo "   (Replace 'yourusername' with your actual GitHub username)"
    exit 1
fi

# Add all files
echo "📁 Adding all files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
    exit 0
fi

# Create commit message
echo "💾 Creating commit..."
git commit -m "feat: Update Metis with Auth0 fixes and improvements

✨ Changes:
- Fixed Auth0 configuration and loading states
- Improved error handling for authentication
- Cleaned up debug information display
- Enhanced redirect URI handling
- Updated environment configuration

🔧 Technical:
- Better Auth0 Provider configuration
- Improved user experience on login page
- Streamlined console logging
- Enhanced callback URL handling

🚀 Ready for deployment!"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git push origin main; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Your changes are now live on GitHub"
else
    echo "❌ Push failed. Trying to set upstream..."
    if git push -u origin main; then
        echo "✅ Successfully pushed to GitHub with upstream set!"
    else
        echo "❌ Push failed. You may need to:"
        echo "   1. Check your GitHub repository URL"
        echo "   2. Ensure you have push permissions"
        echo "   3. Try: git pull origin main --rebase"
    fi
fi

echo "📍 Don't forget to:"
echo "   - Update your Auth0 callback URLs"
echo "   - Configure your .env file with real credentials"
echo "   - Enable GitHub Pages if you want to deploy"