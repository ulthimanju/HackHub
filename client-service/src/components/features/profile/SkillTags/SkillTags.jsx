import React from 'react';
import { X, Plus } from 'lucide-react';
import Input from '../../../common/Input/Input';
import Button from '../../../common/Button/Button';

const SkillTags = ({ skills, newSkill, onNewSkillChange, onAddSkill, onRemoveSkill }) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-gray-700 tracking-wide uppercase">Skills & Technologies</label>
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => onNewSkillChange(e.target.value)}
          placeholder="e.g. Java, React, Docker"
          className="flex-1 rounded-xl"
          onKeyPress={(e) => e.key === 'Enter' && onAddSkill()}
        />
        <Button variant="secondary" icon={Plus} onClick={onAddSkill} className="rounded-xl px-6">
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 p-5 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 min-h-[80px] transition-all hover:border-orange-200 hover:bg-orange-50/10">
        {skills.map(skill => (
          <span 
            key={skill} 
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-xl text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-orange-300 hover:text-orange-600 group cursor-pointer"
            onClick={() => onRemoveSkill(skill)}
          >
            {skill}
            <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-orange-500 transition-colors" />
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-gray-400 text-sm italic py-2 px-1">No skills added yet. Showcase your expertise!</p>
        )}
      </div>
    </div>
  );
};

export default SkillTags;
