import React, { memo, useState } from 'react';
import Button from '../../../common/Button/Button';
import { Check } from 'lucide-react';
import { validateEventStep } from './validateEventStep';
import EventFormStep1 from './EventFormStep1';
import EventFormStep2 from './EventFormStep2';
import EventFormStep3 from './EventFormStep3';

const STEP_LABELS = ['Basics', 'Logistics', 'Content'];

const INITIAL_FORM = {
  name: '', description: '', theme: '', contactEmail: '',
  startDate: '', endDate: '', registrationStartDate: '', registrationEndDate: '',
  resultsDate: '', venue: '', isVirtual: false, location: '',
  maxParticipants: '', teamSize: '1', prizes: [], rules: [],
};

const EventForm = memo(({ onSubmit, onCancel, loading }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [newPrize, setNewPrize] = useState('');
  const [newRule, setNewRule] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updated = { ...formData, [name]: type === 'checkbox' ? checked : value };

    // Auto-fill registration dates when startDate is entered (only if fields are empty)
    if (name === 'startDate' && value) {
      const now = new Date().toISOString().slice(0, 16);
      const dayBefore = new Date(new Date(value).getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
      if (!updated.registrationStartDate) updated.registrationStartDate = now;
      if (!updated.registrationEndDate)   updated.registrationEndDate   = dayBefore;
    }

    setFormData(updated);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (s) => {
    const errs = validateEventStep(s, formData);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => { if (validate(step)) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = () => {
    if (validate(3)) {
      onSubmit({
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants, 10) : null,
        teamSize: formData.teamSize ? parseInt(formData.teamSize, 10) : null,
      });
    }
  };

  const addListItem = (field, value, setValue) => {
    if (value.trim()) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
      setValue('');
    }
  };

  const removeListItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step === s ? 'bg-orange-500 text-white ring-4 ring-orange-100' :
                step > s  ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {step > s ? <Check className="w-6 h-6" /> : s}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${step === s ? 'text-orange-600' : 'text-gray-400'}`}>
                {STEP_LABELS[s - 1]}
              </span>
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 mx-4 -mt-6 transition-all ${step > s ? 'bg-green-500' : 'bg-gray-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
          {step === 1 && <EventFormStep1 formData={formData} errors={errors} onChange={handleChange} />}
          {step === 2 && <EventFormStep2 formData={formData} errors={errors} onChange={handleChange} />}
          {step === 3 && (
            <EventFormStep3
              formData={formData}
              newPrize={newPrize} setNewPrize={setNewPrize}
              newRule={newRule} setNewRule={setNewRule}
              addListItem={addListItem} removeListItem={removeListItem}
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-gray-100">
          <div>
            {step === 1
              ? <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
              : <Button type="button" variant="secondary" onClick={prevStep}>Back</Button>
            }
          </div>
          <div className="flex gap-3">
            {step < 3
              ? <Button type="button" variant="primary" onClick={nextStep} size="lg">Continue</Button>
              : <Button type="button" variant="primary" onClick={handleSubmit} loading={loading} size="lg">Create Event</Button>
            }
          </div>
        </div>
      </div>
    </div>
  );
});

EventForm.displayName = 'EventForm';
export default EventForm;