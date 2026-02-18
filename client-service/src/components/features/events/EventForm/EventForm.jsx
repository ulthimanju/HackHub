import React, { memo, useState } from 'react';
import Input from '../../../common/Input/Input';
import Button from '../../../common/Button/Button';
import Textarea from '../../../common/Textarea/Textarea';
import Checkbox from '../../../common/Checkbox/Checkbox';
import { Calendar, Mail, MapPin, Users, Trophy, BookOpen, Plus, X, Check } from 'lucide-react';

const EventForm = memo(({ onSubmit, onCancel, loading }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    theme: '',
    contactEmail: '',
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    resultsDate: '',
    venue: '',
    isVirtual: false,
    location: '',
    maxParticipants: '',
    teamSize: '1',
    prizes: [],
    rules: []
  });

  const [newPrize, setNewPrize] = useState('');
  const [newRule, setNewRule] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.name) newErrors.name = 'Event name is required';
      if (!formData.contactEmail) newErrors.contactEmail = 'Contact email is required';
    } else if (currentStep === 2) {
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (formData.registrationStartDate && formData.registrationEndDate
          && formData.registrationEndDate <= formData.registrationStartDate) {
        newErrors.registrationEndDate = 'Registration end must be after registration start';
      }
      if (formData.registrationEndDate && formData.startDate
          && formData.registrationEndDate > formData.startDate) {
        newErrors.registrationEndDate = 'Registration must close before the event starts';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (validateStep(3)) {
      const formattedData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : null,
        teamSize: formData.teamSize ? parseInt(formData.teamSize, 10) : null,
      };
      onSubmit(formattedData);
    }
  };

  const addListItem = (field, value, setValue) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const removeListItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step === s ? 'bg-orange-500 text-white ring-4 ring-orange-100' : 
                step > s ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > s ? <Check className="w-6 h-6" /> : s}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${
                step === s ? 'text-orange-600' : 'text-gray-400'
              }`}>
                {s === 1 ? 'Basics' : s === 2 ? 'Logistics' : 'Content'}
              </span>
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 mx-4 -mt-6 transition-all ${step > s ? 'bg-green-500' : 'bg-gray-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
          {step === 1 && (
            <>
              <div className="md:col-span-2">
                <Input
                  label="Event Name*"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Global Hack 2026"
                  error={errors.name}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What is this hackathon about?"
                  rows={4}
                />
              </div>
              <Input
                label="Theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                placeholder="e.g. Sustainability, AI"
              />
              <Input
                label="Contact Email*"
                name="contactEmail"
                type="email"
                icon={Mail}
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="organizer@example.com"
                error={errors.contactEmail}
                required
              />
            </>
          )}

          {step === 2 && (
            <>
              <Input
                label="Start Date*"
                name="startDate"
                type="datetime-local"
                icon={Calendar}
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
                required
              />
              <Input
                label="End Date*"
                name="endDate"
                type="datetime-local"
                icon={Calendar}
                value={formData.endDate}
                onChange={handleChange}
                error={errors.endDate}
                required
              />
              <Input
                label="Registration Starts"
                name="registrationStartDate"
                type="datetime-local"
                icon={Calendar}
                value={formData.registrationStartDate}
                onChange={handleChange}
              />
              <Input
                label="Registration Ends"
                name="registrationEndDate"
                type="datetime-local"
                icon={Calendar}
                value={formData.registrationEndDate}
                onChange={handleChange}
              />
              <div className="flex items-center pt-8">
                <Checkbox
                  label="Virtual Event"
                  name="isVirtual"
                  checked={formData.isVirtual}
                  onChange={handleChange}
                />
              </div>
              <Input
                label={formData.isVirtual ? "Virtual Platform" : "Venue Location"}
                name="location"
                icon={MapPin}
                value={formData.location}
                onChange={handleChange}
                placeholder={formData.isVirtual ? "e.g. Discord" : "e.g. Main Hall"}
              />
              <Input
                label="Max Participants"
                name="maxParticipants"
                type="number"
                icon={Users}
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="Unlimited"
              />
              <Input
                label="Team Size"
                name="teamSize"
                type="number"
                min="1"
                icon={Users}
                value={formData.teamSize}
                onChange={handleChange}
              />
            </>
          )}

          {step === 3 && (
            <>
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Prizes</label>
                <div className="flex gap-2">
                  <Input
                    value={newPrize}
                    onChange={(e) => setNewPrize(e.target.value)}
                    placeholder="e.g. $1000 for Winner"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('prizes', newPrize, setNewPrize))}
                  />
                  <Button type="button" variant="secondary" onClick={() => addListItem('prizes', newPrize, setNewPrize)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {formData.prizes.map((prize, index) => (
                    <span key={index} className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-xl text-sm font-semibold border border-orange-100 animate-in zoom-in-95">
                      <Trophy className="w-3.5 h-3.5" />
                      {prize}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeListItem('prizes', index)} />
                    </span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Rules</label>
                <div className="flex gap-2">
                  <Input
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="e.g. Original work only"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem('rules', newRule, setNewRule))}
                  />
                  <Button type="button" variant="secondary" onClick={() => addListItem('rules', newRule, setNewRule)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.rules.map((rule, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 group animate-in slide-in-from-left-2">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 font-medium">{rule}</span>
                      </div>
                      <X className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-red-500 transition-all" onClick={() => removeListItem('rules', index)} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-gray-100">
          <div>
            {step === 1 ? (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={prevStep}>
                Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            {step < 3 ? (
              <Button type="button" variant="primary" onClick={nextStep} size="lg">
                Continue
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={handleSubmit} loading={loading} size="lg">
                Create Event
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
EventForm.displayName = 'EventForm';
export default EventForm;