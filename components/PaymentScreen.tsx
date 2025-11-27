import { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { CreditCard, Smartphone, Plus, Wallet, CheckCircle } from 'lucide-react';

const paymentMethods = [
  {
    id: 1,
    type: 'mobile-money',
    name: 'Orange Money',
    number: '**** **** 1234',
    logo: '🟠',
    balance: '45,000 GNF',
    verified: true
  },
  {
    id: 2,
    type: 'mobile-money', 
    name: 'MTN Money',
    number: '**** **** 5678',
    logo: '🟡',
    balance: '28,500 GNF',
    verified: true
  },
  {
    id: 3,
    type: 'mobile-money',
    name: 'Moov Money',
    number: '**** **** 9012',
    logo: '🔵',
    balance: '15,200 GNF',
    verified: true
  }
];

const PaymentMethodCard = memo(({ method, isSelected, onSelect }: {
  method: typeof paymentMethods[0];
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <Card 
    className={`cursor-pointer transition-all duration-200 border-0 rounded-3xl overflow-hidden ${
      isSelected 
        ? 'ring-2 ring-black bg-gray-50 scale-[1.02]' 
        : 'bg-white hover:shadow-md hover:scale-[1.01]'
    }`}
    onClick={onSelect}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-3xl">{method.logo}</div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{method.name}</p>
              {method.verified && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-sm text-gray-500">{method.number}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-green-600">{method.balance}</p>
          {isSelected && (
            <Badge className="bg-black text-white border-0 mt-1">
              Sélectionné
            </Badge>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
));

PaymentMethodCard.displayName = 'PaymentMethodCard';

export default function PaymentScreen() {
  const [selectedMethod, setSelectedMethod] = useState(1);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState('mobile-money');

  const handleAddMethod = useCallback(() => {
    setShowAddMethod(false);
    // Logique d'ajout
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Paiements
        </h1>
        <p className="text-gray-500">Gérez vos moyens de paiement</p>
      </div>

      {/* Solde total */}
      <Card className="bg-gradient-to-br from-black to-gray-800 text-white border-0 rounded-3xl overflow-hidden shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 mb-2">Solde total disponible</p>
              <p className="text-4xl font-bold">88,700 GNF</p>
            </div>
            <Wallet className="w-10 h-10 text-white/70" />
          </div>
        </CardContent>
      </Card>

      {/* Moyens de paiement */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Moyens de paiement
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddMethod(true)}
            className="rounded-full border-gray-200 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isSelected={selectedMethod === method.id}
              onSelect={() => setSelectedMethod(method.id)}
            />
          ))}
        </div>
      </div>

      {/* Ajouter un moyen de paiement */}
      {showAddMethod && (
        <Card className="border-0 rounded-3xl shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle>Ajouter un moyen de paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={newMethodType === 'mobile-money' ? 'default' : 'outline'}
                onClick={() => setNewMethodType('mobile-money')}
                className="h-12 rounded-2xl"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile Money
              </Button>
              <Button
                variant={newMethodType === 'card' ? 'default' : 'outline'}
                onClick={() => setNewMethodType('card')}
                className="h-12 rounded-2xl"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Carte
              </Button>
            </div>

            {newMethodType === 'mobile-money' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Opérateur</Label>
                  <select className="w-full p-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white transition-colors mt-1">
                    <option>Orange Money</option>
                    <option>MTN Money</option>
                    <option>Moov Money</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Numéro de téléphone</Label>
                  <Input 
                    placeholder="628 XX XX XX" 
                    className="h-12 rounded-2xl border-gray-200 bg-gray-50 focus:bg-white transition-colors mt-1"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-2xl"
                onClick={() => setShowAddMethod(false)}
              >
                Annuler
              </Button>
              <Button 
                className="flex-1 h-12 rounded-2xl bg-black hover:bg-gray-800"
                onClick={handleAddMethod}
              >
                Ajouter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions récentes */}
      <Card className="border-0 rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle>Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
            <div>
              <p className="font-medium text-gray-900">Course Kaloum → Ratoma</p>
              <p className="text-sm text-gray-500">22 Juil 2025, 14:30</p>
            </div>
            <p className="font-semibold text-red-600">-18,000 GNF</p>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium text-gray-900">Recharge Orange Money</p>
              <p className="text-sm text-gray-500">21 Juil 2025, 10:15</p>
            </div>
            <p className="font-semibold text-green-600">+50,000 GNF</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}