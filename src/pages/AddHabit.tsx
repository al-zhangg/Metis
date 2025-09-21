import React, { useState } from 'react';
import SideImage from '../components/SideImage';
import { Plus } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import AIInsightCard from '../components/AIInsightCard';
import { enhancedApi } from '../services/enhancedApi';
import { useNavigate } from 'react-router-dom';
import type { HabitClassification } from '../services/aiService';

const AddHabit: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    goal: '',
    category: '',
    description: '',
    icon: 'muscle'
  });
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiClassification, setAiClassification] = useState<HabitClassification | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    'Wisdom', 'Strength', 'Knowledge', 'Health', 'Creativity', 'Spirituality'
  ];

  const habitIcons = [
    'muscle', 'plant', 'music', 'paint', 'runn', 'book', 'drop', 'apple', 'write', 'croslegg'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e?: React.FormEvent) => {
  if (e && typeof (e as any).preventDefault === 'function') (e as any).preventDefault();
    if (!formData.title || !formData.goal) {
      console.error('Missing required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await enhancedApi.createHabit({
        title: formData.title,
        description: formData.description || `${formData.goal} - ${formData.category}`,
        icon: formData.icon
      });
      
  if (result.success) {
        setShowModal(true);
        setFormData({
          title: '',
          goal: '',
          category: '',
          description: '',
          icon: 'muscle'
        });
        setShowPreview(false);
        setAiClassification(null);
        try {
          console.debug('AddHabit: dispatching metis:habits-updated after create');
          window.dispatchEvent(new CustomEvent('metis:habits-updated', { detail: { userId: null } }));
        } catch (e) {
          console.warn('AddHabit: failed to dispatch habits-updated', e);
        }
        // Navigate back to dashboard so it reloads
        navigate('/dashboard');
      } else {
        console.error('Failed to create habit:', result.error);
      }
    } catch (error) {
      console.error('Failed to add habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewHabit = async () => {
    if (!formData.title || !formData.description) return;
    
    setIsSubmitting(true);
    try {
      // Get AI classification preview
      const { aiService } = await import('../services/aiService');
      const classification = await aiService.classifyHabit(formData.title, formData.description);
      setAiClassification(classification);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to get AI preview:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div 
      className="min-h-screen p-6 relative"
      style={{
        backgroundImage: 'url(/images/starrysky.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Constellation decorations moved to the page edges so they don't overlap the form */}
      <SideImage src="/images/constellation2.png" side="right" decorative position="absolute" className="bottom-0 right-0 translate-x-8 pointer-events-none -z-10" />
      {/* Strong white tint overlay for better readability */}
      <div className="absolute inset-0 bg-white/70 z-0"></div>
      {/* make the inner container relative for any inner absolute positioning */}
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="font-cinzel font-bold text-3xl text-midnight-blue flex items-center gap-3">
            <Plus className="w-8 h-8 text-bronze" />
            Forge a New Habit
          </h1>
          <p className="font-inter text-gray-600 mt-2">
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl shadow-lg p-8 border-2 border-bronze/20" style={{ backgroundColor: '#F6F2E9' }}>
          {/* Habit Icon Selection */}
          <div className="mb-6">
            <label className="block font-cinzel font-semibold text-midnight-blue mb-3">
              Choose Your Theme
            </label>
            <div className="grid grid-cols-5 gap-3">
              {habitIcons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`
                    p-3 rounded-lg border-2 transition-all duration-200
                    hover:scale-110 active:scale-95 h-16 w-16 flex items-center justify-center
                    ${formData.icon === icon 
                      ? 'border-bronze bg-bronze/10' 
                      : 'border-gray-200 hover:border-bronze/50'
                    }
                  `}
                >
                  <img 
                    src={`/images/${icon}.png`} 
                    alt={icon}
                    className="w-10 h-10 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Habit Name */}
          <div className="mb-6">
            <label htmlFor="title" className="block font-cinzel font-semibold text-midnight-blue mb-2">
              Habit Name *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-bronze/20 rounded-lg focus:border-bronze focus:ring-2 focus:ring-bronze/20 font-inter"
              style={{ backgroundColor: '#F6F2E9' }}
              placeholder="e.g., Morning Meditation"
            />
          </div>

          {/* Goal */}
          <div className="mb-6">
            <label htmlFor="goal" className="block font-cinzel font-semibold text-midnight-blue mb-2">
              Daily Goal *
            </label>
            <input
              type="text"
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-bronze/20 rounded-lg focus:border-bronze focus:ring-2 focus:ring-bronze/20 font-inter"
              style={{ backgroundColor: '#F6F2E9' }}
              placeholder="e.g., 10 minutes daily"
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label htmlFor="category" className="block font-cinzel font-semibold text-midnight-blue mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-bronze/20 rounded-lg focus:border-bronze focus:ring-2 focus:ring-bronze/20 font-inter"
              style={{ backgroundColor: '#F6F2E9' }}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-8">
            <label htmlFor="description" className="block font-cinzel font-semibold text-midnight-blue mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border-2 border-bronze/20 rounded-lg focus:border-bronze focus:ring-2 focus:ring-bronze/20 font-inter resize-none"
              style={{ backgroundColor: '#F6F2E9' }}
              placeholder="Describe your habit and its benefits..."
            />
          </div>

          {/* AI Preview Button */}
          {formData.title && formData.description && !showPreview && (
            <div className="mb-6">
              <Button
                text={isSubmitting ? "Getting AI Insights..." : "Preview with AI"}
                onClick={handlePreviewHabit}
                variant="secondary"
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
          )}

          {/* AI Classification Preview */}
          {showPreview && aiClassification && (
            <div className="mb-6 space-y-4">
              <h3 className="font-cinzel font-semibold text-lg text-midnight-blue">
                AI Analysis Preview
              </h3>
              
              <AIInsightCard
                type="analysis"
                title={aiClassification.mythicTitle}
                content={aiClassification.wisdom}
                actionableSteps={[
                  `Category: ${aiClassification.category}`,
                  `Difficulty: ${aiClassification.difficulty}`,
                  `Suggested frequency: ${aiClassification.suggestedFrequency}`
                ]}
              />
            </div>
          )}
          <div className="flex gap-4">
            <Button
              text={isSubmitting ? "Creating..." : "Create Habit"}
              onClick={(ev?: React.MouseEvent<HTMLButtonElement>) => handleSubmit(ev as any)}
              variant="primary"
              disabled={isSubmitting || !formData.title || !formData.goal}
              className="flex-1"
            />
            {showPreview && (
              <Button
                text="Edit Details"
                onClick={() => {
                  setShowPreview(false);
                  setAiClassification(null);
                }}
                variant="secondary"
                className="flex-1"
              />
            )}
          </div>
        </form>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Habit Created Successfully!"
        >
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <img 
                src={`/images/${formData.icon}.png`} 
                alt={formData.icon}
                className="w-16 h-16 object-contain"
              />
            </div>
            {aiClassification && (
              <div className="mb-4">
                <h4 className="font-cinzel font-semibold text-bronze mb-2">
                  {aiClassification.mythicTitle}
                </h4>
                <p className="font-inter text-sm text-gray-600">
                  {aiClassification.wisdom}
                </p>
              </div>
            )}
            <p className="font-inter text-gray-700 mb-6">
              Your new habit has been forged! May it bring you wisdom and strength on your journey.
            </p>
            <Button
              text="Continue Your Quest"
              onClick={() => setShowModal(false)}
              variant="primary"
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AddHabit;