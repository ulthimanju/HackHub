import React from 'react';
import Input from '../../../common/Input/Input';
import Button from '../../../common/Button/Button';
import { Trophy, BookOpen, Plus, X } from 'lucide-react';

export default function EventFormStep3({ formData, newPrize, setNewPrize, newRule, setNewRule, addListItem, removeListItem }) {
  return (
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
    </>
  );
}
