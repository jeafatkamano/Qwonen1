import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

import GoogleMapComponent from './GoogleMapComponent';

interface GoogleMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: string) => void;
  title: string;
  currentLocation?: string;
}

export default function GoogleMapModal({ 
  isOpen, 
  onClose, 
  onSelectLocation, 
  title, 
  currentLocation 
}: GoogleMapModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
  };

  const handleConfirmSelection = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation.address);
      onClose();
      setSelectedLocation(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedLocation(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-md w-full h-[90vh] p-0 overflow-hidden rounded-3xl [&>button]:hidden"
        aria-describedby="google-map-modal-description"
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription id="google-map-modal-description" className="text-left">
            Utilisez la carte pour sélectionner une position précise, puis confirmez votre choix.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Google Map */}
          <div className="flex-1 p-4">
            <GoogleMapComponent
              height="100%"
              onLocationSelect={handleLocationSelect}
              showCurrentLocation={true}
              showSearchBox={true}
              initialCenter={{ lat: 9.515, lng: -13.712 }} // Conakry
              zoom={13}
            />
          </div>

          {/* Boutons d'action */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-2xl"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                className="flex-1 h-12 rounded-2xl bg-black hover:bg-gray-800"
                onClick={handleConfirmSelection}
                disabled={!selectedLocation}
              >
                Confirmer
              </Button>
            </div>
            
            {selectedLocation && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Lieu sélectionné:
                </p>
                <p className="text-sm text-gray-600">
                  {selectedLocation.address}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}