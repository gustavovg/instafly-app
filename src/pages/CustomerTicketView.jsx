import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Ticket } from '@/api/entities';
import { TicketMessage } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

export default function CustomerTicketView() {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const location = useLocation();
  const ticketId = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    if (ticketId) {
      fetchData();
    }
  }, [ticketId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      const [ticketData, messagesData] = await Promise.all([
        Ticket.get(ticketId),
        TicketMessage.filter({ ticket_id: ticketId }, 'created_date'),
      ]);
      
      // Security check: ensure the user owns this ticket
      if (ticketData.user_email !== userData.email) {
          throw new Error("Access denied");
      }

      setTicket(ticketData);
      setMessages(messagesData);
      setCurrentUser(userData);
    } catch (error) {
      console.error("Erro ao carregar dados do ticket:", error);
      setTicket(null); // Clear ticket on error/access denied
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      await TicketMessage.create({
        ticket_id: ticket.id,
        user_email: currentUser.email,
        message: newMessage,
        is_admin_reply: false
      });
      await Ticket.update(ticket.id, { status: 'aberto', last_reply_by: currentUser.email, last_reply_date: new Date().toISOString() });
      setNewMessage('');
      fetchData(); // Recarregar tudo
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setSending(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!ticket) {
    return <div className="text-center py-10">Ticket não encontrado ou você não tem permissão para visualizá-lo.</div>;
  }
  
  const getStatusBadge = (status) => {
    const statusMap = {
      aberto: { color: 'blue', text: 'Aberto' },
      em_andamento: { color: 'yellow', text: 'Em Andamento' },
      respondido: { color: 'green', text: 'Respondido' },
      fechado: { color: 'gray', text: 'Fechado' }
    };
    const { color, text } = statusMap[status] || { color: 'gray', text: 'Desconhecido' };
    return <Badge variant={color}>{text}</Badge>;
  };

  return (
     <div className="p-8 bg-gray-50 min-h-screen">
       <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => window.location.href = createPageUrl('CustomerTickets')} className="mb-6">
         <ArrowLeft className="w-4 h-4 mr-2" />
         Voltar para meus tickets
       </Button>

        <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{ticket.title}</CardTitle>
                    <CardDescription>
                      Ticket ID: {ticket.id.slice(0, 8)} | Categoria: {ticket.category}
                    </CardDescription>
                  </div>
                  {getStatusBadge(ticket.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 h-[500px] overflow-y-auto p-4 bg-gray-100 rounded-lg border">
                {/* Mensagem original */}
                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold">{ticket.user_email.charAt(0).toUpperCase()}</div>
                   <div className="flex-1 bg-white p-4 rounded-lg border">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-bold text-sm">Você</span>
                       <span className="text-xs text-gray-500">{format(new Date(ticket.created_date), 'dd/MM HH:mm', { locale: ptBR })}</span>
                     </div>
                     <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
                   </div>
                 </div>

                {/* Respostas */}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.is_admin_reply ? '' : 'justify-end'}`}>
                    {/* Admin Message */}
                    {msg.is_admin_reply && (
                       <>
                         <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold">{msg.user_email.charAt(0).toUpperCase()}</div>
                         <div className="flex-1 bg-blue-100 p-4 rounded-lg border border-blue-200">
                           <div className="flex justify-between items-center mb-1">
                             <span className="font-bold text-sm text-blue-800">Suporte</span>
                             <span className="text-xs text-gray-500">{format(new Date(msg.created_date), 'dd/MM HH:mm', { locale: ptBR })}</span>
                           </div>
                           <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                         </div>
                       </>
                    )}
                    {/* Client Reply */}
                    {!msg.is_admin_reply && (
                      <>
                        <div className="flex-1 bg-white p-4 rounded-lg border text-right">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-xs text-gray-500">{format(new Date(msg.created_date), 'dd/MM HH:mm', { locale: ptBR })}</span>
                            <span className="font-bold text-sm">Você</span>
                          </div>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold">{msg.user_email.charAt(0).toUpperCase()}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Formulário de Resposta */}
              {ticket.status !== 'fechado' && (
                <div className="mt-6">
                  <Textarea 
                    placeholder="Digite sua resposta aqui..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="mb-2"
                    rows={4}
                  />
                  <Button onClick={handleSendMessage} disabled={sending} className="w-full">
                    {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Enviar Resposta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}