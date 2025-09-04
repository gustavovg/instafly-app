import React, { useState, useEffect } from 'react';
import { Ticket } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Loader2, LifeBuoy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

export default function CustomerTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', category: 'outros', order_id: '' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      const data = await Ticket.filter({ user_email: userData.email }, '-updated_date');
      setTickets(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.description) {
      alert("Por favor, preencha o título e a descrição.");
      return;
    }
    try {
      await Ticket.create({
        ...newTicket,
        user_email: user.email,
        status: 'aberto',
        priority: 'media'
      });
      setShowModal(false);
      setNewTicket({ title: '', description: '', category: 'outros', order_id: '' });
      fetchData();
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
    }
  };
  
  const handleViewTicket = (ticketId) => {
    window.location.href = createPageUrl(`CustomerTicketView?id=${ticketId}`);
  };

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Meus Tickets de Suporte</h1>
            <p className="text-gray-600">Acompanhe suas solicitações ou abra um novo chamado.</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Ticket
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : tickets.length === 0 ? (
          <Card className="text-center py-12">
            <LifeBuoy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium">Nenhum ticket encontrado</h3>
            <p className="text-gray-500 mt-2 mb-6">Precisa de ajuda? Abra seu primeiro ticket!</p>
            <Button onClick={() => setShowModal(true)}>Abrir Ticket de Suporte</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewTicket(ticket.id)}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{ticket.title}</h3>
                    <p className="text-sm text-gray-500">
                      ID: {ticket.id.slice(0, 8)} • Atualizado em: {format(new Date(ticket.updated_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(ticket.status)}
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewTicket(ticket.id); }}>
                      <Eye className="w-4 h-4"/>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Novo Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Assunto</Label>
              <Input id="title" value={newTicket.title} onChange={(e) => setNewTicket({...newTicket, title: e.target.value})} placeholder="Ex: Problema com pagamento"/>
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pagamentos">Pagamentos</SelectItem>
                  <SelectItem value="pedidos">Pedidos</SelectItem>
                  <SelectItem value="afiliados">Afiliados</SelectItem>
                  <SelectItem value="tecnico">Problema Técnico</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label htmlFor="order_id">ID do Pedido (Opcional)</Label>
              <Input id="order_id" value={newTicket.order_id} onChange={(e) => setNewTicket({...newTicket, order_id: e.target.value})} placeholder="Se relacionado a um pedido específico"/>
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} placeholder="Descreva seu problema em detalhes..."/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateTicket}>Enviar Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}