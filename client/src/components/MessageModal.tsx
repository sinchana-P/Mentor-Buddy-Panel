import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: string;
    domainRole: string;
  };
}

export default function MessageModal({ isOpen, onClose, recipient }: MessageModalProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'mentor-1',
      senderName: 'Sarah Mentor',
      content: 'Hi! How is the React task coming along?',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true
    },
    {
      id: '2',
      senderId: recipient.id,
      senderName: recipient.name,
      content: 'Great! I\'ve completed the basic components. Working on the state management now.',
      timestamp: new Date(Date.now() - 1800000),
      isRead: true
    },
    {
      id: '3',
      senderId: 'mentor-1',
      senderName: 'Sarah Mentor',
      content: 'Excellent! Let me know if you need any help with Redux or Context API.',
      timestamp: new Date(Date.now() - 900000),
      isRead: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Send message to API
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: 'current-user',
        senderName: 'You',
        content: message.trim(),
        timestamp: new Date(),
        isRead: false
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={recipient.avatarUrl} alt={recipient.name} />
              <AvatarFallback>
                {recipient.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-lg">{recipient.name}</DialogTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {recipient.role}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {recipient.domainRole}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4 border rounded-lg">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`flex ${msg.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${msg.senderId === 'current-user' ? 'order-2' : 'order-1'}`}>
                      {msg.senderId !== 'current-user' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={msg.senderAvatar} alt={msg.senderName} />
                            <AvatarFallback className="text-xs">
                              {msg.senderName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{msg.senderName}</span>
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-lg ${
                          msg.senderId === 'current-user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderId === 'current-user' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="mt-4 p-4 border-t">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="min-h-[60px] max-h-[120px] resize-none"
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !message.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 