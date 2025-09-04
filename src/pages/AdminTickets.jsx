import React, { useState, useEffect } from 'react';
import { Ticket } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await Ticket.list('-updated_date');
      setTickets(data);
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
    } finally {
      setLoading(false);
    }
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

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      baixa: { color: 'gray', text: 'Baixa' },
      media: { color: 'yellow', text: 'Média' },
      alta: { color: 'red', text: 'Alta' }
    };
    const { color, text } = priorityMap[priority] || { color: 'gray', text: 'N/D' };
    return <Badge variant={color}>{text}</Badge>;
  };
  
  const handleViewTicket = (ticketId) => {
    window.location.href = createPageUrl(`AdminTicketView?id=${ticketId}`);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tickets de Suporte</h1>
          <p className="text-gray-600">Gerencie todas as solicitações de suporte dos clientes.</p>
        </div>
      </div>
      
      <Card>
        <CardContent>
          {loading ? (
             <div className="flex justify-center items-center py-10">
               <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
             </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Última Atualização</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewTicket(ticket.id)}>
                    <TableCell className="font-medium max-w-xs truncate">{ticket.title}</TableCell>
                    <TableCell>{ticket.user_email}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(ticket.updated_date), { addSuffix: true, locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleViewTicket(ticket.id); }}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           {tickets.length === 0 && !loading && (
             <div className="text-center py-10 text-gray-500">Nenhum ticket encontrado.</div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}