
import React, { useState, useEffect } from 'react';
import { Faq } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge'; // Added this import
import { Plus, Edit, Trash2, Loader2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '', category: 'geral', is_active: true });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const data = await Faq.list('order_index');
      setFaqs(data);
    } catch (error) {
      console.error("Erro ao carregar FAQs:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const openModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData(faq);
    } else {
      setEditingFaq(null);
      setFormData({ question: '', answer: '', category: 'geral', is_active: true, order_index: faqs.length });
    }
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
  };

  const handleSave = async () => {
    if (editingFaq) {
      await Faq.update(editingFaq.id, formData);
    } else {
      await Faq.create(formData);
    }
    fetchFaqs();
    closeModal();
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta pergunta?')) {
      await Faq.delete(id);
      fetchFaqs();
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(faqs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFaqs(items);

    // Update order_index for all items
    const updatePromises = items.map((faq, index) => 
      Faq.update(faq.id, { order_index: index })
    );
    await Promise.all(updatePromises);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Central de Ajuda (FAQ)</h1>
          <p className="text-gray-600">Gerencie as perguntas e respostas frequentes.</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Pergunta
        </Button>
      </div>

      <Card>
        <CardContent className="p-0"> {/* Added className="p-0" here */}
         {loading ? (
             <div className="flex justify-center items-center py-10">
               <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
             </div>
          ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Pergunta</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Droppable droppableId="faqs">
                  {(provided) => (
                    <>
                      {faqs.map((faq, index) => (
                        <Draggable key={faq.id} draggableId={faq.id} index={index}>
                          {(provided) => (
                            <TableRow ref={provided.innerRef} {...provided.draggableProps}>
                               <TableCell {...provided.dragHandleProps} className="cursor-grab">
                                 <GripVertical className="text-gray-400" />
                               </TableCell>
                              <TableCell className="font-medium">{faq.question}</TableCell>
                              <TableCell><Badge variant="outline">{faq.category}</Badge></TableCell>
                              <TableCell>
                                 <Switch checked={faq.is_active} onCheckedChange={(checked) => Faq.update(faq.id, {is_active: checked}).then(fetchFaqs)} />
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => openModal(faq)}><Edit className="w-4 h-4"/></Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDelete(faq.id)}><Trash2 className="w-4 h-4"/></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      <tr style={{ display: 'none' }} ref={provided.innerRef} {...provided.droppableProps}>
                        {provided.placeholder}
                      </tr>
                    </>
                  )}
                </Droppable>
              </TableBody>
            </Table>
          </DragDropContext>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Editar Pergunta' : 'Nova Pergunta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4"> {/* Changed to className="space-y-4 py-4" here */}
            <div>
              <Label htmlFor="question">Pergunta</Label>
              <Input id="question" value={formData.question} onChange={(e) => setFormData({...formData, question: e.target.value})} />
            </div>
             <div>
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="pagamentos">Pagamentos</SelectItem>
                  <SelectItem value="pedidos">Pedidos</SelectItem>
                  <SelectItem value="afiliados">Afiliados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="answer">Resposta</Label>
              <Textarea id="answer" value={formData.answer} onChange={(e) => setFormData({...formData, answer: e.target.value})} rows={5}/>
            </div>
             <div className="flex items-center space-x-2">
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}/>
                <Label htmlFor="is_active">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
