# Metis - Ancient Wisdom Tracker

<div align="center">
  <h3>⚱️ A Greek mythology-themed habit tracking application ⚱️</h3>
  <p>Transform your daily habits into an epic journey of self-improvement inspired by ancient Greek wisdom</p>
</div>

## ✨ Features

### 🏛️ **Ancient Greek Theme**
- Beautiful marble, bronze, and laurel green color palette
- Greek scroll-styled cards with parchment textures
- Amphora-shaped XP progress bars with liquid fill animations
- Oracle card design for journal entries
- Typography using Cinzel for headings and Inter for body text

### 📊 **Habit Tracking**
- Create and manage daily habits with custom icons and categories
- Track streaks and completion status
- Gamified experience with XP rewards and level progression
- Divine quests system for additional motivation

### 📝 **Journal System**
- Write reflective journal entries
- AI-powered sentiment analysis with color-coded Oracle cards
- Automatic generation of mystical titles for entries
- Beautiful card-based display with Greek mythology themes

### 🏆 **Achievement System**
- Unlock achievements based on your progress
- Level-based progression system
- Comprehensive profile with stats and accomplishments
- Visual XP bar showing progress to next level

### 🎨 **User Experience**
- Fully responsive design for all devices
- Smooth animations and micro-interactions
- Intuitive navigation with React Router
- Modern component architecture with TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/metis.git
   cd metis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Themed button with variants
│   ├── Card.tsx        # Greek scroll-styled cards
│   ├── Modal.tsx       # Animated modal component
│   ├── Navigation.tsx  # Main navigation bar
│   └── XPBar.tsx       # Amphora-shaped progress bar
├── pages/              # Main application pages
│   ├── Dashboard.tsx   # Habit overview and quests
│   ├── AddHabit.tsx    # Habit creation form
│   ├── Journal.tsx     # Journal entry system
│   └── Profile.tsx     # User profile and achievements
├── services/           # API and data services
│   └── mockApi.js      # Mock API for development
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🎯 Core Components

### Card Component
Greek scroll-styled cards with decorative elements:
```tsx
<Card
  title="Morning Meditation"
  description="Find inner peace like ancient philosophers"
  icon="🧘‍♂️"
  status="active"
>
  {/* Card content */}
</Card>
```

### Button Component
Themed buttons with bronze and laurel green variants:
```tsx
<Button
  text="Complete Habit"
  onClick={handleComplete}
  variant="primary"
/>
```

### XPBar Component
Amphora-shaped progress bar with liquid fill animation:
```tsx
<XPBar
  currentXP={1250}
  maxXP={2000}
  level={8}
/>
```

### Modal Component
Animated modal with Greek-themed styling:
```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Achievement Unlocked!"
>
  {/* Modal content */}
</Modal>
```

## 🎨 Design System

### Color Palette
- **Marble**: `#f5f5f5` - Primary background
- **Bronze**: `#b87333` - Primary accent color
- **Laurel Green**: `#7c9a6d` - Secondary accent
- **Midnight Blue**: `#191970` - Text and headers

### Typography
- **Headings**: Cinzel (serif) - Elegant classical feel
- **Body Text**: Inter (sans-serif) - Modern readability

### Animations
- Smooth hover effects on interactive elements
- Liquid fill animation for XP bars
- Slide-up animations for modals
- Scale transforms for buttons and cards

## 📱 Pages Overview

### 🏠 Dashboard
- Overview of today's habits with completion tracking
- Divine quests with progress indicators
- XP bar showing current level and progress
- Streak counter with flame icons

### ➕ Add Habit
- Comprehensive form for creating new habits
- Icon selection with emoji picker
- Category organization system
- Success modal with confirmation

### 📖 Journal
- Rich text entry system for daily reflections
- Sentiment analysis with color-coded Oracle cards
- Chronological display of past entries
- Mystical titles generated for each entry

### 👤 Profile
- User statistics and achievement showcase
- Level progression and XP tracking
- Unlocked achievements gallery
- Personal stats dashboard

## 🔧 Technical Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Development**: Hot reload with fast refresh

## 🎮 Mock API

The application includes a comprehensive mock API service that simulates real backend functionality:

- `getHabits(userId)` - Fetch user habits
- `completeHabit(habitId)` - Mark habit as complete
- `getQuests(userId)` - Fetch daily/weekly quests
- `getJournals(userId)` - Fetch journal entries
- `addJournalEntry(userId, entry)` - Add new journal entry
- `addHabit(userId, habitData)` - Create new habit
- `getProfile(userId)` - Fetch user profile data

All functions return Promises to simulate async API calls with realistic delays.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by ancient Greek philosophy and mythology
- Design influenced by classical Greek art and architecture
- Built with modern web technologies for optimal performance

---

<div align="center">
  <p>⚱️ <strong>May wisdom guide your journey</strong> ⚱️</p>
  <p>Built with ❤️ and ancient wisdom</p>
</div>