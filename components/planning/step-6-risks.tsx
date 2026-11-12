'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import type { PersonalPlan } from '@/lib/types';
import { Button } from '../ui/button';
import { Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Label } from '../ui/label';

interface StepProps {
  planData: Omit<PersonalPlan, 'id' | 'createdAt'>;
  updatePlanData: (data: Partial<Omit<PersonalPlan, 'id' | 'createdAt'>>) => void;
}

export function Step6Risks({ planData, updatePlanData }: StepProps) {
  
  const handleUpdateRisk = (index: number, field: 'description' | 'mitigation', value: string) => {
    const updatedRisks = planData.risks.map((risk, i) => 
      i === index ? { ...risk, [field]: value } : risk
    );
    updatePlanData({ risks: updatedRisks });
  };
  
  const handleAddRisk = () => {
    const newRisk = { id: crypto.randomUUID(), description: '', mitigation: '' };
    updatePlanData({ risks: [...planData.risks, newRisk] });
  };

  const handleRemoveRisk = (id: string) => {
    updatePlanData({ risks: planData.risks.filter(risk => risk.id !== id) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identify Risks and Uncertainties</CardTitle>
          <CardDescription>
            What could go wrong? Think about potential obstacles and how you might address them.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
              {planData.risks.map((risk, index) => (
                <motion.div 
                    key={risk.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, margin: 0, padding: 0, transition: { duration: 0.2 } }}
                    className="p-4 border rounded-lg space-y-4 bg-muted/30 relative"
                >
                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => handleRemoveRisk(risk.id)}>
                        <X className="h-4 w-4" />
                    </Button>
                    <div className="space-y-2">
                        <Label htmlFor={`risk-desc-${index}`}>Risk/Uncertainty Description</Label>
                        <Textarea 
                            id={`risk-desc-${index}`}
                            value={risk.description}
                            onChange={(e) => handleUpdateRisk(index, 'description', e.target.value)}
                            placeholder="e.g., Might lose motivation after a few weeks."
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor={`risk-mitigation-${index}`}>Mitigation Strategy</Label>
                        <Textarea 
                            id={`risk-mitigation-${index}`}
                            value={risk.mitigation}
                            onChange={(e) => handleUpdateRisk(index, 'mitigation', e.target.value)}
                            placeholder="e.g., Set up a weekly check-in with an accountability partner."
                        />
                    </div>
                </motion.div>
              ))}
              </AnimatePresence>
              
              <Button type="button" variant="outline" onClick={handleAddRisk}>
                <Plus className="mr-2 h-4 w-4" /> Add Risk
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
