import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MessageSquare, X, Send } from 'lucide-react';
import { BuyMeACoffee } from './BuyMeACoffee';
import { useSupabaseFeedback } from '../hooks/useSupabaseFeedback';

type FeedbackType = 'sugerencia' | 'error' | 'comentario';

export const FeedbackPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('comentario');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');

  const { submitFeedback, isSubmitting } = useSupabaseFeedback();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    const result = await submitFeedback({
      type: feedbackType,
      title: title.trim(),
      description: description.trim(),
      email: email.trim() || undefined,
    });

    if (result.success) {
      // Resetear formulario
      setTitle('');
      setDescription('');
      setEmail('');
      setFeedbackType('comentario');
      setIsOpen(false);

      alert('¡Gracias por tu feedback! Lo hemos recibido correctamente.');
    } else {
      alert(`Error al enviar el feedback: ${result.error}`);
    }
  };

  return (
    <>
      {/* Panel de feedback */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Enviar Feedback
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                Ayúdanos a mejorar la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-type">Tipo de feedback</Label>
                <Select value={feedbackType} onValueChange={(value: FeedbackType) => setFeedbackType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sugerencia">💡 Sugerencia</SelectItem>
                    <SelectItem value="error">🐛 Error</SelectItem>
                    <SelectItem value="comentario">💬 Comentario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Breve descripción del feedback"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu feedback en detalle..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || !description.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Feedback
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Botones flotantes */}
      <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="bg-background/80 backdrop-blur-sm border shadow-lg hover:bg-background/90"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Feedback
        </Button>

        {/* Widget de Buy Me a Coffee */}
        <BuyMeACoffee />
      </div>
    </>
  );
};
