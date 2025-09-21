import React, { useState, useEffect } from 'react';
import { BookOpen, Feather, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import SideImage from '../components/SideImage';
import AIInsightCard from '../components/AIInsightCard';
import { enhancedApi } from '../services/enhancedApi';
import type { JournalEntry } from '../services/supabaseClient';

const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const journalData = await enhancedApi.getJournalEntries();
        setEntries(journalData);
      } catch (error) {
        console.error('Failed to fetch journal entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await enhancedApi.createJournalEntry(newEntry.trim());
      if (result.success) {
        setEntries(prev => [result.journalEntry!, ...prev]);
        setNewEntry('');
      }
    } catch (error) {
      console.error('Failed to add journal entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-laurel-green bg-green-50';
      case 'negative':
        return 'border-red-400 bg-red-50';
      case 'mixed':
        return 'border-purple-400 bg-purple-50';
      default:
        return 'border-bronze bg-amber-50';
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '✨';
      case 'negative':
        return '🌧️';
      case 'mixed':
        return '🌓';
      default:
        return '🔮';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-marble to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bronze mx-auto mb-4"></div>
          <p className="font-inter text-gray-600">Loading your reflections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-marble to-amber-50 p-6">
      {/* Decorative side images (large screens) */}
  <SideImage src="/images/image.png" side="left" decorative position="absolute" />
  <SideImage src="/images/column1.png" side="right" decorative position="absolute" className="bottom-0 right-4 top-auto" />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-cinzel font-bold text-3xl text-midnight-blue flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-bronze" />
            Journal
          </h1>
          <p className="font-inter text-gray-600 mt-2">
            Record your thoughts and receive divine wisdom
          </p>
        </div>

        {/* Journal Entry Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-bronze/20 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="entry" className="block font-cinzel font-semibold text-midnight-blue mb-3 flex items-center gap-2">
                <Feather className="w-5 h-5" />
                Share Your Reflections
              </label>
              <textarea
                id="entry"
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-bronze/20 rounded-lg focus:border-bronze focus:ring-2 focus:ring-bronze/20 font-inter resize-none"
                placeholder="What insights did you gain today? What challenges did you face? How did you grow as a person?"
              />
            </div>
            <div className="flex justify-end">
              <Button
                text={isSubmitting ? "Recording..." : "Record Wisdom"}
                onClick={() => {}}
                variant="primary"
                disabled={isSubmitting || !newEntry.trim()}
              />
            </div>
          </form>
        </div>

        {/* Journal Entries */}
        <div>
          <h2 className="font-cinzel font-semibold text-2xl text-midnight-blue mb-6">
            Oracle Cards
          </h2>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <img src="/images/image3.png" alt="empty journal" className="mx-auto w-24 h-24 object-contain" />
              </div>
              <p className="font-inter text-gray-600">
                No entries yet. Begin your journey of self-reflection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {entries.map(entry => (
                <div
                  key={entry.id}
                  className={`
                    relative p-6 rounded-xl border-2 shadow-lg transform transition-all duration-300
                    hover:scale-102 hover:shadow-xl ${getSentimentColor((entry as any).sentiment)}
                  `}
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 20% 80%, rgba(184, 115, 51, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)
                    `
                  }}
                >
                  {/* Oracle card header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getSentimentEmoji(entry.mood ?? '')}</span>
                      <h3 className="font-cinzel font-semibold text-lg text-midnight-blue">
                        {entry.oracle_title}
                      </h3>
                    </div>
                    <span className="font-inter text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Entry content */}
                  <p className="font-inter text-gray-700 leading-relaxed">
                    {entry.entry}
                  </p>
                  
                  {/* AI Insights */}
                  <div className="mt-4 space-y-3">
                    {/* Mythic Advice */}
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="font-cinzel font-semibold text-sm text-midnight-blue">
                          Oracle's Wisdom
                        </span>
                      </div>
                      <p className="font-inter text-sm text-gray-700 italic">
                        "{entry.mythic_advice}"
                      </p>
                    </div>
                    
                    {/* Obstacles & Action Steps */}
                    {(entry.obstacles.length > 0 || entry.actionable_steps.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {entry.obstacles.length > 0 && (
                          <div className="bg-white/50 rounded-lg p-3">
                            <h5 className="font-inter font-semibold text-xs text-gray-600 uppercase tracking-wide mb-2">
                              Challenges Identified
                            </h5>
                            <ul className="space-y-1">
                              {entry.obstacles.map((obstacle, idx) => (
                                <li key={idx} className="font-inter text-xs text-gray-700 flex items-center gap-1">
                                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                                  {obstacle}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {entry.actionable_steps.length > 0 && (
                          <div className="bg-white/50 rounded-lg p-3">
                            <h5 className="font-inter font-semibold text-xs text-gray-600 uppercase tracking-wide mb-2">
                              Next Steps
                            </h5>
                            <ul className="space-y-1">
                              {entry.actionable_steps.map((step, idx) => (
                                <li key={idx} className="font-inter text-xs text-gray-700 flex items-center gap-1">
                                  <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 w-3 h-3 bg-bronze/20 rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-2 h-2 bg-bronze/20 rounded-full"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;