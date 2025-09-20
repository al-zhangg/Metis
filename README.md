# Metis – Greek Mythology Habit Tracker

## Project Description
Metis is a gamified habit tracker inspired by Greek mythology. It helps users build lasting routines through quests, streaks, journaling, and AI-powered reflection. Designed with simplicity and mythology-inspired visuals, it combines structure with creativity.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features
- Greek mythology–themed design with responsive UI  
- Habit and task tracking with streaks and XP  
- Daily and weekly quests with progression system  
- Journaling with optional AI-powered insights  
- Auth0 authentication for secure profiles  
- Supabase integration for real-time data sync  
- Extendable architecture for new features  

## Installation
1. Clone the repository  
   git clone https://github.com/your-username/metis.git  
   cd metis  

2. Install dependencies  
   npm install  

3. Create a `.env` file in the root directory with the following variables:  
   VITE_AUTH0_DOMAIN=your_auth0_domain  
   VITE_AUTH0_CLIENT_ID=your_auth0_client_id  
   VITE_SUPABASE_URL=your_supabase_url  
   VITE_SUPABASE_ANON_KEY=your_supabase_key  
   VITE_AI_API_URL=optional_ai_service_url  
   VITE_AI_API_KEY=optional_ai_service_key  

4. Start the development server  
   npm run dev  

5. Open the app in your browser at http://localhost:5173  

## Usage
- Sign up or log in with Auth0 to create a profile  
- Add habits, tasks, or routines  
- Track streaks, earn XP, and complete quests  
- Use the journal for daily reflection (AI insights optional)  
- View progress through analytics and insights  

## Roadmap
- Expand mythology-based achievement system  
- Adaptive AI-driven habit recommendations  
- Mobile-first optimizations  
- Integrations with wearables and calendars  

## Contributors
Built by **Team Metis** as a hackathon project.  

## License
This project is licensed under the MIT License.  

## Acknowledgments
- Inspired by Greek mythology and its stories of wisdom and discipline  
- Thanks to the open-source community for frameworks and libraries  
