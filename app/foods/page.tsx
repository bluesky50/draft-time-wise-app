'use client';
import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { X, Utensils, Plus, Trash2, Edit, Save, Sandwich } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import type { Food } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const foodFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty.") })),
  type: z.string().min(1, 'Type is required.'),
  category: z.string().min(1, 'Category is required.'),
  priority: z.number().min(1).max(10),
});

type FoodFormData = z.infer<typeof foodFormSchema>;

function FoodsPage() {
  const { foods, addFood, updateFood, deleteFood, addFoodSession } = useTimeStore();
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [isCondensed, setIsCondensed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedCondensed = localStorage.getItem('foods-condensed-view');
    if (storedCondensed) {
      setIsCondensed(JSON.parse(storedCondensed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('foods-condensed-view', JSON.stringify(isCondensed));
  }, [isCondensed]);

  const form = useForm<FoodFormData>({
    resolver: zodResolver(foodFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      type: '',
      category: '',
      priority: 5,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tags',
  });

  function onSubmit(values: FoodFormData) {
    const foodData = {
        ...values,
        tags: values.tags.map(t => t.value),
    };

    if(editingFoodId) {
        updateFood({
            id: editingFoodId,
            createdAt: foods.find(n => n.id === editingFoodId)!.createdAt,
            ...foodData,
        });
        setEditingFoodId(null);
    } else {
        addFood(foodData);
    }

    form.reset({
      title: '',
      description: '',
      tags: [],
      type: '',
      category: '',
      priority: 5,
    });
  }

  const handleEdit = (food: Food) => {
    setEditingFoodId(food.id);
    form.reset({
        ...food,
        tags: food.tags.map(t => ({value: t})),
    });
  }

  const handleCancelEdit = () => {
    setEditingFoodId(null);
    form.reset({
      title: '',
      description: '',
      tags: [],
      type: '',
      category: '',
      priority: 5,
    });
  }

  const handleEatNow = (foodId: string) => {
    addFoodSession({ foodId, eatDate: Date.now() });
  };
  
  const filteredFoods = useMemo(() => {
    return foods.filter(food => 
      food.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [foods, searchTerm]);


  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingFoodId ? 'Edit Food' : 'Create a New Food'}</CardTitle>
              <CardDescription>{editingFoodId ? 'Modify the details of your food.' : 'Log a new food item.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Apple" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., A crunchy red apple." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="e.g., Fruit" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Snack" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                   <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <FormField control={form.control} key={field.id} name={`tags.${index}.value`} render={({ field }) => (
                        <FormItem><div className="flex items-center gap-2"><FormControl><Input {...field} placeholder="e.g., healthy" /></FormControl><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button></div><FormMessage /></FormItem>
                      )} />
                    ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Tag
                     </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full">
                      {editingFoodId ? <span><Save className="mr-2 h-4 w-4" /> Update Food</span> : <span><Plus className="mr-2 h-4 w-4" /> Create Food</span>}
                    </Button>
                    {editingFoodId && <Button type="button" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
               <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Foods</CardTitle>
                  <CardDescription>Browse your logged food items.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="condensed-view">Condensed</Label>
                  <Switch id="condensed-view" checked={isCondensed} onCheckedChange={setIsCondensed} />
                </div>
              </div>
              <div className="pt-4">
                <Input placeholder="Search foods by title, content, or tag..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </CardHeader>
            <CardContent>
              {filteredFoods.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <Utensils className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">{foods.length === 0 ? 'No foods logged yet.' : 'No foods found.'}</p>
                  <p className="text-sm">{foods.length === 0 ? 'Create one to get started!' : 'Try a different search term.'}</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {filteredFoods.map(food => (
                      <motion.li
                        key={food.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className={cn("border p-4 rounded-lg", editingFoodId === food.id && "ring-2 ring-primary")}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                              <h3 className="font-bold">{food.title}</h3>
                              {!isCondensed && (
                                <>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{food.description}</p>
                                  <div className="text-xs text-muted-foreground mt-3">
                                    <p>Created: {format(new Date(food.createdAt), "PPP p")}</p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                                      <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Type: {food.type}</span>
                                      <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Category: {food.category}</span>
                                      <span className='font-semibold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full'>Priority: {food.priority}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {food.tags.map(tag => (
                                      <div key={tag} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                        # {tag}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                          </div>
                          <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(food)} title="Edit Food">
                                  <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteFood(food.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEatNow(food.id)}>
                                <Sandwich className="mr-2 h-4 w-4" />
                                Eat Now
                              </Button>
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

export default FoodsPage;
