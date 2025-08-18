import { useState } from "react";
import {
  usePlaces,
  useDeletePlace,
} from "@/hooks/use-places";
import type { Place } from "@/types/place";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash2, Plus, Map, List } from "lucide-react";
import FastMapLibre from "@/components/common/FastMapLibre";
import { AddPlaceForm } from "./AddPlaceForm";
import { EditPlaceForm } from "./EditPlaceForm";

export default function PlaceManagement() {
  const { data: places, isLoading, error } = usePlaces();
  const deletePlace = useDeletePlace();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedMapPlace, setSelectedMapPlace] = useState<Place | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  // Handle opening create dialog
  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  // Handle map place click
  const handleMapPlaceClick = (place: Place) => {
    setSelectedMapPlace(place);
  };

  const handleEdit = (place: Place) => {
    setSelectedPlace(place);
    setIsEditDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedPlace(null);
  };

  const handleDelete = async (place: Place) => {
    if (!confirm(`Are you sure you want to delete "${place.name}"?`)) return;

    try {
      await deletePlace.mutateAsync(place._id);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin-smooth rounded-full h-10 w-10 border-4 border-muted-foreground/20 border-t-primary"></div>
          <div className="absolute inset-0 rounded-full h-10 w-10 border-4 border-transparent border-r-primary/30 animate-spin-reverse"></div>
        </div>
        <span className="ml-3 text-muted-foreground">Loading places...</span>
      </div>
    );
  if (error) return <div>Error loading places: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Place Management</h2>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Place
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Place</DialogTitle>
            </DialogHeader>
            <AddPlaceForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Map View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
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
                  <p className="text-sm text-muted-foreground mb-2">
                    {place.address}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>👍 {place.likes}</span>
                    <span>👎 {place.dislikes}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <FastMapLibre
                height="600px"
                places={places || []}
                selectedPlace={selectedMapPlace}
                onPlaceClick={handleMapPlaceClick}
                showSearch={true}
                showControls={true}
                showPlaceMarkers={true}
                interactive={true}
              />
            </CardContent>
          </Card>

          {selectedMapPlace && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Selected Place
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(selectedMapPlace)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(selectedMapPlace)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedMapPlace.imageUrl && (
                    <img
                      src={selectedMapPlace.imageUrl}
                      alt={selectedMapPlace.name}
                      className="w-full h-48 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedMapPlace.name}
                    </h3>
                    <Badge variant="secondary" className="mt-1">
                      {selectedMapPlace.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedMapPlace.address}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      👍 {selectedMapPlace.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      👎 {selectedMapPlace.dislikes}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    📅 {selectedMapPlace.time}
                  </div>
                  {selectedMapPlace.coordinates && (
                    <div className="text-xs text-gray-500">
                      📍 {selectedMapPlace.coordinates.lat.toFixed(6)},{" "}
                      {selectedMapPlace.coordinates.lng.toFixed(6)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Place</DialogTitle>
          </DialogHeader>
          {selectedPlace && (
            <EditPlaceForm
              place={selectedPlace}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
