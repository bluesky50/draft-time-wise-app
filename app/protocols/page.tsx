'use client';
import { useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTimeStore } from '@/context/time-store-context';
import { X, CheckSquare, Plus, Trash2, Edit, Save, GripVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import type { Protocol } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const protocolFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  steps: z.array(z.object({ value: z.string().min(1, "Step cannot be empty.") })),
});

type ProtocolFormData = z.infer<typeof protocolFormSchema>;

function ProtocolsPage() {
  const { protocols, addProtocol, updateProtocol, deleteProtocol } = useTimeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<ProtocolFormData>({
    resolver: zodResolver(protocolFormSchema),
    defaultValues: {
      title: '',
      description: '',
      steps: [{ value: '' }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  function onSubmit(values: ProtocolFormData) {
    const protocolData = {
      title: values.title,
      description: values.description,
      steps: values.steps.map(s => s.value),
    };

    if (editingId) {
      updateProtocol({
        id: editingId,
        createdAt: protocols.find(p => p.id === editingId)!.createdAt,
        ...protocolData,
      });
      setEditingId(null);
    } else {
      addProtocol(protocolData);
    }

    form.reset({
      title: '',
      description: '',
      steps: [{ value: '' }],
    });
  }

  const handleEdit = (protocol: Protocol) => {
    setEditingId(protocol.id);
    form.reset({
      title: protocol.title,
      description: protocol.description,
      steps: protocol.steps.map(s => ({ value: s })),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({
      title: '',
      description: '',
      steps: [{ value: '' }],
    });
  };
  
  const filteredProtocols = useMemo(() => {
    return protocols.filter(protocol => 
      protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protocol.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protocol.steps.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [protocols, searchTerm]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Protocol' : 'Create a New Protocol'}</CardTitle>
              <CardDescription>{editingId ? 'Modify your protocol.' : 'Define a standardized set of steps.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Morning Startup" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., Steps to begin the workday." {...field} /></FormControl><FormMessage /></FormItem>)} />
                  
                  <div>
                    <FormLabel>Steps</FormLabel>
                    <Reorder.Group axis="y" values={fields} onReorder={(newOrder) => {
                        const from = fields.findIndex(f => f.id === newOrder[0].id)
                        const to = newOrder.findIndex(f => f.id === fields[0].id)
                        // This is a simplified move, for complex reordering, a more robust solution might be needed
                        // For now, we handle simple swaps.
                         if (from !== undefined && to !== undefined) {
                           // A simple implementation only for swapping adjacent items for now
                            move(from, to);
                         }
                    }}>
                      <AnimatePresence>
                        {fields.map((field, index) => (
                          <Reorder.Item key={field.id} value={field} className="list-none">
                            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 mt-2">
                              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                              <FormField control={form.control} name={`steps.${index}.value`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input {...field} placeholder={`Step ${index + 1}`} /></FormControl><FormMessage /></FormItem>)} />
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
                            </motion.div>
                          </Reorder.Item>
                        ))}
                      </AnimatePresence>
                    </Reorder.Group>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                      <Plus className="mr-2 h-4 w-4" /> Add Step
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full">
                      {editingId ? <span><Save className="mr-2 h-4 w-4" /> Update Protocol</span> : <span><Plus className="mr-2 h-4 w-4" /> Create Protocol</span>}
                    </Button>
                    {editingId && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Protocols</CardTitle>
              <CardDescription>Browse your saved protocols.</CardDescription>
              <div className="pt-4">
                <Input placeholder="Search protocols..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              {filteredProtocols.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <CheckSquare className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">{protocols.length === 0 ? 'No protocols yet.' : 'No protocols found.'}</p>
                  <p className="text-sm">{protocols.length === 0 ? 'Create one to get started!' : 'Try a different search term.'}</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                    {filteredProtocols.map(protocol => (
                      <motion.li
                        key={protocol.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className={cn("border p-4 rounded-lg", editingId === protocol.id && "ring-2 ring-primary")}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold">{protocol.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{protocol.description}</p>
                            <ol className="list-decimal list-inside mt-3 space-y-1 text-sm">
                              {protocol.steps.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                            <p className="text-xs text-muted-foreground mt-3">Created: {format(new Date(protocol.createdAt), "PPP p")}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(protocol)} title="Edit Protocol">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Delete Protocol">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone. This will permanently delete this protocol.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteProtocol(protocol.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default ProtocolsPage;
