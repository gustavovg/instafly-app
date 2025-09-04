import React, { useState, useEffect } from 'react';
import { Faq } from '@/api/entities';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, Search, HelpCircle } from 'lucide-react';

export default function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const data = await Faq.filter({ is_active: true }, 'order_index');
        setFaqs(data);
      } catch (error) {
        console.error("Erro ao carregar FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    (acc[faq.category] = acc[faq.category] || []).push(faq);
    return acc;
  }, {});

  const categoryNames = {
    geral: "Perguntas Gerais",
    pagamentos: "Pagamentos",
    pedidos: "Pedidos e Entrega",
    afiliados: "Sistema de Afiliados"
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
           <HelpCircle className="mx-auto h-16 w-16 text-blue-500 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Central de Ajuda</h1>
          <p className="text-lg text-gray-600">Encontre respostas para as perguntas mais comuns.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="O que você está procurando?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border rounded-full shadow-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* FAQs */}
        {loading ? (
          <div className="flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedFaqs).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-200 pb-2">{categoryNames[category] || category}</h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {items.map(faq => (
                    <AccordionItem key={faq.id} value={faq.id} className="bg-white rounded-lg shadow-sm border">
                      <AccordionTrigger className="p-6 text-left font-semibold text-lg hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="p-6 pt-0 text-gray-700 text-base leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\n/g, '<br />') }} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
             {filteredFaqs.length === 0 && !loading && (
                <div className="text-center py-10 text-gray-500">
                    <p>Nenhum resultado encontrado para "<strong>{searchTerm}</strong>".</p>
                    <p>Tente uma busca diferente ou navegue pelas categorias.</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}