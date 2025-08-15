import { useState } from 'react';
import { usePlaces, useCreatePlace, useUpdatePlace, useDeletePlace } from '@/hooks/use-places';
import { PLACE_CATEGORIES } from '@/types/place';
import type { Place, CreatePlaceRequest } from '@/types/place';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import GeoapifyAutocomplete from '@/components/common/GeoapifyAutocomplete';
import type { PlaceAutocompleteResult } from '@/services/geoapify.service';

export default function PlaceManagement() {
  const { data: places, isLoading, error } = usePlaces();
  const createPlace = useCreatePlace();
  const updatePlace = useUpdatePlace();
  const deletePlace = useDeletePlace();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [formData, setFormData] = useState<CreatePlaceRequest>({
    name: '',
    address: '',
    category: '',
    imageUrl: '',
    coordinates: undefined,
    formattedAddress: undefined
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      category: '',
      imageUrl: '',
      coordinates: undefined,
      formattedAddress: undefined
    });
  };

  // Handle Geoapify Places selection
  const handlePlaceSelect = (place: PlaceAutocompleteResult) => {
    setFormData(prev => ({
      ...prev,
      name: prev.name || place.name, // Only set if name is empty
      address: place.address,
      formattedAddress: place.formattedAddress,
      coordinates: place.coordinates
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlace.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleEdit = (place: Place) => {
    setSelectedPlace(place);
    setFormData({
      name: place.name,
      address: place.address,
      category: place.category,
      imageUrl: place.imageUrl || '',
      coordinates: place.coordinates,
      formattedAddress: place.formattedAddress
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlace) return;
    
    try {
      await updatePlace.mutateAsync({
        id: selectedPlace._id,
        data: formData
      });
      setIsEditDialogOpen(false);
      setSelectedPlace(null);
      resetForm();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleDelete = async (place: Place) => {
    if (!confirm(`Are you sure you want to delete "${place.name}"?`)) return;
    
    try {
      await deletePlace.mutateAsync(place._id);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  if (isLoading) return <div>Loading places...</div>;
  if (error) return <div>Error loading places: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Place Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Place
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Place</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <GeoapifyAutocomplete
                  value={formData.address}
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Search for restaurants, cafes, bars..."
                  showCurrentLocation={true}
                  bias="countrycode:vn"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPlace.isPending}>
                  {createPlace.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {places?.map((place) => (
          <Card key={place._id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{place.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {place.category}
                  </Badge>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(place)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(place)}
                    disabled={deletePlace.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{place.address}</p>
              <div className="flex justify-between text-sm">
                <span>👍 {place.likes}</span>
                <span>👎 {place.dislikes}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Place</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <GeoapifyAutocomplete
                value={formData.address}
                onPlaceSelect={handlePlaceSelect}
                placeholder="Search for restaurants, cafes, bars..."
                showCurrentLocation={true}
                bias="countrycode:vn"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PLACE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-imageUrl">Image URL (optional)</Label>
              <Input
                id="edit-imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatePlace.isPending}>
                {updatePlace.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
