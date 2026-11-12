'use client';
import { useState } from 'react';
import { LifeInput } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Plus, Trash2, Shield, Heart, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useTimeStore } from '@/context/time-store-context';

interface LifeInputCardProps {
  input: LifeInput;
  onUpdate: (updatedInput: LifeInput) => void;
  onDelete: (id: string) => void;
}

const EditableList: React.FC<{ title: string, items: string[], onItemsChange: (newItems: string[]) => void, icon: React.ReactNode }> = ({ title, items, onItemsChange, icon }) => {
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim()) {
            onItemsChange([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (index: number) => {
        onItemsChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">{icon} {title}</h4>
            <ul className="space-y-1 pl-2">
                {items.map((item, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                        <span className="flex-1">{item}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveItem(index)}>
                            <X className="h-3 w-3" />
                        </Button>
                    </li>
                ))}
            </ul>
            <div className="flex gap-2">
                <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add item..." onKeyDown={e => e.key === 'Enter' && handleAddItem()} />
                <Button type="button" size="icon" variant="secondary" onClick={handleAddItem}><Plus className="h-4 w-4" /></Button>
            </div>
        </div>
    );
}

export function LifeInputCard({ input, onUpdate, onDelete }: LifeInputCardProps) {
  const { wantDependencyGraphs, wantValueChains, wantLossGraphs } = useTimeStore();
  
  const handleFieldChange = <K extends keyof LifeInput>(field: K, value: LifeInput[K]) => {
    onUpdate({ ...input, [field]: value });
  };
  
  const handleSelectChange = (field: 'wantDependencyGraphId' | 'wantValueChainId' | 'wantLossGraphId', value: string) => {
    onUpdate({ ...input, [field]: value === 'none' ? undefined : value });
  };

  return (
    <Card className="relative h-full flex flex-col">
      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => onDelete(input.id)}>
          <Trash2 className="h-4 w-4" />
      </Button>
      <CardHeader>
        <Input 
            value={input.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="text-lg font-bold border-0 shadow-none -ml-3 p-0 focus-visible:ring-0"
        />
      </CardHeader>
      <CardContent className="space-y-6 flex-grow">
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Criticality: {input.criticality}</Label>
                <Slider min={1} max={10} step={1} value={[input.criticality]} onValueChange={(v) => handleFieldChange('criticality', v[0])} />
            </div>
             <div className="space-y-2">
                <Label>Stability: {input.stability}</Label>
                <Slider min={1} max={10} step={1} value={[input.stability]} onValueChange={(v) => handleFieldChange('stability', v[0])} />
            </div>
        </div>
        
         <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold text-sm">Associated Graphs</h4>
            <div className="space-y-2">
                <Label className="text-xs">Want Dependency Graph</Label>
                <Select onValueChange={(value) => handleSelectChange('wantDependencyGraphId', value)} value={input.wantDependencyGraphId || 'none'}>
                    <SelectTrigger><SelectValue placeholder="Select graph..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {wantDependencyGraphs.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label className="text-xs">Want Value Chain (Why)</Label>
                <Select onValueChange={(value) => handleSelectChange('wantValueChainId', value)} value={input.wantValueChainId || 'none'}>
                    <SelectTrigger><SelectValue placeholder="Select graph..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {wantValueChains.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label className="text-xs">Want Loss Graph</Label>
                <Select onValueChange={(value) => handleSelectChange('wantLossGraphId', value)} value={input.wantLossGraphId || 'none'}>
                    <SelectTrigger><SelectValue placeholder="Select graph..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {wantLossGraphs.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
         </div>

         <EditableList 
            title="Maintenance Ideas"
            items={input.maintenanceIdeas}
            onItemsChange={(newItems) => handleFieldChange('maintenanceIdeas', newItems)}
            icon={<Shield className="h-4 w-4 text-green-500" />}
         />
         <EditableList 
            title="Increase Ideas"
            items={input.increaseIdeas}
            onItemsChange={(newItems) => handleFieldChange('increaseIdeas', newItems)}
            icon={<Sparkles className="h-4 w-4 text-blue-500" />}
         />
        <EditableList 
            title="Risks"
            items={input.risks}
            onItemsChange={(newItems) => handleFieldChange('risks', newItems)}
            icon={<Heart className="h-4 w-4 text-red-500" />}
        />
      </CardContent>
    </Card>
  );
}
