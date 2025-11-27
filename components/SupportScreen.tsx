import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Phone, 
  MessageCircle, 
  HelpCircle, 
  AlertTriangle,
  Mail,
  Clock,
  MapPin,
  Shield
} from 'lucide-react';

const faqItems = [
  {
    question: 'Comment annuler une course ?',
    answer: 'Vous pouvez annuler une course avant que le chauffeur n\'arrive. Des frais peuvent s\'appliquer.'
  },
  {
    question: 'Quels moyens de paiement sont acceptés ?',
    answer: 'Orange Money, MTN Money, Moov Money et les cartes bancaires sont acceptés.'
  },
  {
    question: 'Comment contacter mon chauffeur ?',
    answer: 'Utilisez le bouton d\'appel ou de message dans l\'écran de course active.'
  },
  {
    question: 'Que faire en cas de problème ?',
    answer: 'Contactez immédiatement notre support 24h/7j via l\'application ou par téléphone.'
  }
];

export default function SupportScreen() {
  return (
    <div className="p-4 space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-red-600 mb-2">Support &amp; Aide</h2>
        <p className="text-muted-foreground text-sm">Nous sommes là pour vous aider 24h/7j</p>
      </div>

      {/* Contact d'urgence */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-600">Urgence ?</span>
          </div>
          <Button className="w-full bg-red-600 hover:bg-red-700 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Appeler le 117 (Police)
          </Button>
        </CardContent>
      </Card>

      {/* Moyens de contact */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Phone className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm mb-2">Appelez-nous</p>
            <Button variant="outline" size="sm" className="w-full">
              +224 123 456 789
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-sm mb-2">Chat en direct</p>
            <Button variant="outline" size="sm" className="w-full">
              Démarrer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Questions fréquentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
              <p className="mb-2">{item.question}</p>
              <p className="text-sm text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Signaler un problème */}
      <Card>
        <CardHeader>
          <CardTitle>Signaler un problème</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm mb-1 block">Type de problème</label>
            <select className="w-full p-2 border rounded-md">
              <option>Problème de paiement</option>
              <option>Chauffeur inapproprié</option>
              <option>Course annulée</option>
              <option>Tarif incorrect</option>
              <option>Autre</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm mb-1 block">Description</label>
            <Textarea 
              placeholder="Décrivez votre problème en détail..."
              className="min-h-20"
            />
          </div>
          
          <Button className="w-full bg-red-600 hover:bg-red-700">
            Envoyer le rapport
          </Button>
        </CardContent>
      </Card>

      {/* Informations utiles */}
      <Card>
        <CardHeader>
          <CardTitle>Informations utiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Support disponible 24h/7j</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Service disponible à Conakry</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Vos données sont protégées</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">support@qwonen.gn</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}