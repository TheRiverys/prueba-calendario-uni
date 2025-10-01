import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { MessageSquare, X, Send, Lightbulb, Bug, MessageCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BuyMeACoffee } from '@/components/ui/BuyMeACoffee';
import { useSupabaseFeedback } from '@/hooks/supabase/useSupabaseFeedback';

type FeedbackType = 'sugerencia' | 'error' | 'comentario';

const feedbackOptions: { value: FeedbackType; label: string; icon: LucideIcon }[] = [
  { value: 'sugerencia', label: 'Sugerencia', icon: Lightbulb },
  { value: 'error', label: 'Error', icon: Bug },
  { value: 'comentario', label: 'Comentario', icon: MessageCircle }
];

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
        <div className="fixed bottom-20 left-6 z-50">
          <Card className="w-80 shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="w-4 h-4" />
                  Enviar Feedback
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <CardDescription className="text-sm">
                Ayúdanos a mejorar la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-1">
                <Label htmlFor="feedback-type" className="text-sm">Tipo de feedback</Label>
                <Select value={feedbackType} onValueChange={(value: FeedbackType) => setFeedbackType(value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackOptions.map(({ value, label, icon: Icon }) => (
                      <SelectItem key={value} value={value} className="flex items-center gap-2">
                        <Icon className="w-3 h-3 text-muted-foreground" />
                        <span>{label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="title" className="text-sm">Título</Label>
                <Input
                  id="title"
                  placeholder="Breve descripción del feedback"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="description" className="text-sm">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu feedback en detalle..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-sm">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-8"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || !description.trim() || isSubmitting}
                className="w-full h-8"
                size="sm"
              >
                {isSubmitting ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="w-3 h-3 mr-1" />
                    Enviar
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





