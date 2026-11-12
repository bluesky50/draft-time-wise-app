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
import { X, MapPin, Plus, Trash2, Edit, Save, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import type { Location } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const locationFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(3, 'Description must be at least 3 characters long.'),
  tags: z.array(z.object({ value: z.string().min(1, "Tag cannot be empty.") })),
  type: z.string().min(1, 'Type is required.'),
  category: z.string().min(1, 'Category is required.'),
});

type LocationFormData = z.infer<typeof locationFormSchema>;

function LocationsPage() {
  const { locations, addLocation, updateLocation, deleteLocation, addLocationSession } = useTimeStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCondensed, setIsCondensed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const storedCondensed = localStorage.getItem('locations-condensed-view');
    if (storedCondensed) {
      setIsCondensed(JSON.parse(storedCondensed));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('locations-condensed-view', JSON.stringify(isCondensed));
  }, [isCondensed]);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
      type: '',
      category: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tags',
  });

  function onSubmit(values: LocationFormData) {
    const locationData = {
        ...values,
        tags: values.tags.map(t => t.value),
    };

    if(editingId) {
        updateLocation({
            id: editingId,
            createdAt: locations.find(n => n.id === editingId)!.createdAt,
            ...locationData,
        });
        setEditingId(null);
    } else {
        addLocation(locationData);
    }

    form.reset({
      title: '',
      description: '',
      tags: [],
      type: '',
      category: '',
    });
  }
  
  const handleVisitNow = (locationId: string) => {
    addLocationSession({ locationId, visitDate: Date.now() });
  };

  const handleEdit = (location: Location) => {
    setEditingId(location.id);
    form.reset({
        ...location,
        tags: location.tags.map(t => ({value: t})),
    });
  }

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({
      title: '',
      description: '',
      tags: [],
      type: '',
      category: '',
    });
  }

  const { filteredLocations, uniqueTypes, uniqueCategories } = useMemo(() => {
    const types = new Set<string>();
    const categories = new Set<string>();
    locations.forEach(location => {
        types.add(location.type);
        categories.add(location.category);
    });

    const filtered = locations.filter(location =>
        (location.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) &&
        (typeFilter === 'all' || location.type === typeFilter) &&
        (categoryFilter === 'all' || location.category === categoryFilter)
    );

    return { 
        filteredLocations: filtered, 
        uniqueTypes: Array.from(types), 
        uniqueCategories: Array.from(categories) 
    };
  }, [locations, searchTerm, typeFilter, categoryFilter]);

  return (
    <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Location' : 'Create a New Location'}</CardTitle>
              <CardDescription>{editingId ? 'Modify the details of your location.' : 'Log a new location.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Home Office" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="e.g., My primary workspace." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="e.g., Workspace" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Personal" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <FormField control={form.control} key={field.id} name={`tags.${index}.value`} render={({ field }) => (
                        <FormItem><div className="flex items-center gap-2"><FormControl><Input {...field} placeholder="e.g., quiet" /></FormControl><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button></div><FormMessage /></FormItem>
                      )} />
                    ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Tag
                     </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full">
                      {editingId ? <span><Save className="mr-2 h-4 w-4" /> Update Location</span> : <span><Plus className="mr-2 h-4 w-4" /> Create Location</span>}
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
               <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Locations</CardTitle>
                  <CardDescription>Browse your logged locations.</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="condensed-view">Condensed</Label>
                  <Switch id="condensed-view" checked={isCondensed} onCheckedChange={setIsCondensed} />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="md:w-[180px]">
                        <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {uniqueTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="md:w-[180px]">
                        <SelectValue placeholder="Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {uniqueCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            </CardHeader>
            <CardContent>
              {filteredLocations.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                  <MapPin className="h-12 w-12 text-muted-foreground/50" />
                  <p className="font-medium">{locations.length === 0 ? 'No locations logged yet.' : 'No locations found.'}</p>
                   <p className="text-sm">{locations.length > 0 ? 'Try a different search term or filter.' : 'Create one to get started!'}</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence>
                  {filteredLocations.map(location => (
                      <motion.li
                        key={location.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className={cn("border p-4 rounded-lg", editingId === location.id && "ring-2 ring-primary")}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                              <h3 className="font-bold">{location.title}</h3>
                              {!isCondensed && (
                                <>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{location.description}</p>
                                  <div className="text-xs text-muted-foreground mt-3">
                                    <p>Created: {format(new Date(location.createdAt), "PPP p")}</p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                                      <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Type: {location.type}</span>
                                      <span className='font-semibold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full'>Category: {location.category}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {location.tags.map(tag => (
                                      <div key={tag} className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 dark:bg-blue-900/50 dark:text-blue-300">
                                        # {tag}
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                          </div>
                          <div className="flex gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(location)} title="Edit Location">
                                  <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteLocation(location.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                               <Button variant="outline" size="sm" onClick={() => handleVisitNow(location.id)}>
                                <MapPin className="mr-2 h-4 w-4" />
                                Visit Now
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

export default LocationsPage;
