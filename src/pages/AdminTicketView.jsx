import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Ticket } from '@/api/entities';
import { TicketMessage } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

export default function AdminTicketView() {
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
      const [ticketData, messagesData, userData] = await Promise.all([
        Ticket.get(ticketId),
        TicketMessage.filter({ ticket_id: ticketId }, 'created_date'),
        User.me()
      ]);
      setTicket(ticketData);
      setMessages(messagesData);
      setCurrentUser(userData);
    } catch (error) {
      console.error("Erro ao carregar dados do ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedTicket = await Ticket.update(ticket.id, { status: newStatus });
      setTicket(updatedTicket);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };
  
  const handlePriorityChange = async (newPriority) => {
    try {
      const updatedTicket = await Ticket.update(ticket.id, { priority: newPriority });
      setTicket(updatedTicket);
    } catch (error) {
      console.error("Erro ao atualizar prioridade:", error);
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
        is_admin_reply: true
      });
      await Ticket.update(ticket.id, { status: 'respondido', last_reply_by: currentUser.email, last_reply_date: new Date().toISOString() });
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
    return <div className="text-center py-10">Ticket não encontrado.</div>;
  }
  
  const getBadge = (value, type) => {
    const map = {
        status: {
            aberto: { color: 'blue', text: 'Aberto' },
            em_andamento: { color: 'yellow', text: 'Em Andamento' },
            respondido: { color: 'green', text: 'Respondido' },
            fechado: { color: 'gray', text: 'Fechado' }
        },
        priority: {
            baixa: { color: 'gray', text: 'Baixa' },
            media: { color: 'yellow', text: 'Média' },
            alta: { color: 'red', text: 'Alta' }
        }
    };
    const { color, text } = map[type][value] || { color: 'gray', text: 'N/D' };
    return <Badge variant={color}>{text}</Badge>;
  };

  return (
    <div className="p-8 bg-gray-50">
       <Button variant="outline" onClick={() => window.location.href = createPageUrl('AdminTickets')} className="mb-6">
         <ArrowLeft className="w-4 h-4 mr-2" />
         Voltar para todos os tickets
       </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Coluna de Detalhes */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>Cliente:</strong> {ticket.user_email}</p>
              <p><strong>Assunto:</strong> {ticket.title}</p>
              <p><strong>Categoria:</strong> <Badge variant="secondary">{ticket.category}</Badge></p>
              {ticket.order_id && <p><strong>Pedido:</strong> <span className="font-mono bg-gray-100 p-1 rounded text-sm">{ticket.order_id}</span></p>}
              <p><strong>Criado em:</strong> {format(new Date(ticket.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              
              <div className="space-y-2">
                 <label className="text-sm font-medium">Status</label>
                 <Select value={ticket.status} onValueChange={handleStatusChange}>
                   <SelectTrigger><SelectValue/></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="aberto">Aberto</SelectItem>
                     <SelectItem value="em_andamento">Em Andamento</SelectItem>
                     <SelectItem value="respondido">Respondido</SelectItem>
                     <SelectItem value="fechado">Fechado</SelectItem>
                   </SelectContent>
                 </Select>
              </div>

               <div className="space-y-2">
                 <label className="text-sm font-medium">Prioridade</label>
                 <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                   <SelectTrigger><SelectValue/></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="baixa">Baixa</SelectItem>
                     <SelectItem value="media">Média</SelectItem>
                     <SelectItem value="alta">Alta</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna de Conversa */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conversa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 h-[500px] overflow-y-auto p-4 bg-gray-50 rounded-lg border">
                {/* Mensagem original */}
                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">{ticket.user_email.charAt(0).toUpperCase()}</div>
                   <div className="flex-1 bg-white p-4 rounded-lg border">
                     <div className="flex justify-between items-center mb-1">
                       <span className="font-bold text-sm">{ticket.user_email}</span>
                       <span className="text-xs text-gray-500">{format(new Date(ticket.created_date), 'dd/MM HH:mm', { locale: ptBR })}</span>
                     </div>
                     <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
                   </div>
                 </div>

                {/* Respostas */}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.is_admin_reply ? 'justify-end' : ''}`}>
                    {/* Admin Avatar */}
                    {msg.is_admin_reply && (
                       <div className="flex-1 bg-blue-100 p-4 rounded-lg border border-blue-200 text-right">
                         <div className="flex justify-between items-center mb-1">
                           <span className="text-xs text-gray-500">{format(new Date(msg.created_date), 'dd/MM HH:mm', { locale: ptBR })}</span>
                           <span className="font-bold text-sm text-blue-800">{msg.user_email} (Suporte)</span>
                         </div>
                         <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                       </div>
                    )}
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${msg.is_admin_reply ? 'bg-blue-200 text-blue-800' : 'bg-gray-200'}`}>
                       {msg.user_email.charAt(0).toUpperCase()}
                     </div>
                    {/* Client Message */}
                    {!msg.is_admin_reply && (
                      <div className="flex-1 bg-white p-4 rounded-lg border">
                         <div className="flex justify-between items-center mb-1">
                           <span className="font-bold text-sm">{msg.user_email}</span>
                           <span className="text-xs text-gray-500">{format(new Date(msg.created_date), 'dd/MM HH:mm', { locale: ptBR })}</span>
                         </div>
                         <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                       </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Formulário de Resposta */}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}