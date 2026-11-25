import { Bot, RotateCcw, Send, User } from 'lucide-react';
import { Fragment, useRef, useState } from 'react';
import type { ChatMessage } from '../types';

interface AiAssistantSectionProps {
  totalSites: number;
  storageMode: 'supabase' | 'local';
}

const EXAM_TEST_QUERIES = [
  '¿Qué lugares registrados puedo visitar con 50.000 Gs.?',
  '¿Qué museos del catálogo puedo visitar?',
  '¿Puedes sugerir un itinerario con los lugares registrados?',
];

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-stone-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={idx}>{part}</Fragment>;
  });
}

function FormattedReply({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-stone-700">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={i} className="h-1" />;
        }
        if (/^#{1,4}\s/.test(trimmed)) {
          const headingText = trimmed.replace(/^#{1,4}\s+/, '');
          return (
            <p key={i} className="pt-1 text-sm font-semibold text-stone-900">
              {renderInlineBold(headingText)}
            </p>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span aria-hidden="true" className="text-[#1E3A8A]">•</span>
              <span>{renderInlineBold(trimmed.slice(2))}</span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={i} className="pl-1 font-medium text-stone-800">
              {renderInlineBold(trimmed)}
            </div>
          );
        }
        return <p key={i}>{renderInlineBold(trimmed)}</p>;
      })}
    </div>
  );
}

export function AiAssistantSection({ totalSites, storageMode }: AiAssistantSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hola. Soy el asistente turístico inteligente de **Turismo Smart AI**. Consulto en tiempo real los **${totalSites} lugares registrados** en ${
        storageMode === 'supabase' ? 'Supabase' : 'el catálogo del sistema'
      }. Puedes preguntarme por presupuestos en guaraníes, museos disponibles o itinerarios personalizados.`,
      timestamp: '',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const feedRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    setChatError(null);
    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextHistory
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al consultar al asistente inteligente.');
      }

      const modelMsg: ChatMessage = {
        id: `${Date.now()}-model`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
      setTimeout(() => {
        feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
      }, 60);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'No se pudo obtener respuesta.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleReset = () => {
    setChatError(null);
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: `Conversación reiniciada. Estoy conectado en tiempo real a los **${totalSites} lugares registrados** del catálogo. ¿En qué te ayudo?`,
        timestamp: '',
      },
    ]);
  };

  return (
    <section id="asistente" className="border-t border-stone-200 bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Columna izquierda: información y consultas sugeridas */}
          <div className="lg:col-span-4">
            <p className="text-xs font-medium uppercase tracking-widest text-stone-500">
              Inteligencia Artificial con Datos Reales
            </p>
            <h2 className="font-editorial mt-2 text-3xl font-semibold text-stone-900 text-balance">
              Asistente Turístico Inteligente
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Impulsado por la API de Google Gemini desde el servidor. Cada respuesta consulta los precios, horarios, actividades y ubicaciones reales almacenados actualmente en el sistema.
            </p>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Consultas rápidas de prueba
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {EXAM_TEST_QUERIES.map((query) => (
                  <button
                    key={query}
                    type="button"
                    disabled={loading}
                    onClick={() => void sendMessage(query)}
                    className="rounded-lg border border-stone-200 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-stone-800 hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha: ventana de chat */}
          <div className="lg:col-span-8">
            <div className="flex h-[520px] flex-col overflow-hidden rounded-xl border border-stone-200 bg-white">
              <div className="flex items-center justify-between border-b border-stone-200 bg-[#FAF9F6] px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <Bot className="h-4 w-4 text-[#1E3A8A]" aria-hidden="true" />
                  <span className="text-sm font-semibold text-stone-900">
                    Guía Gemini · Consulta en vivo al catálogo ({totalSites} registros)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reiniciar</span>
                </button>
              </div>

              <div
                ref={feedRef}
                className="flex-1 space-y-4 overflow-y-auto p-5"
                aria-live="polite"
              >
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-[#FAF9F6] text-[#1E3A8A]">
                          <Bot className="h-4 w-4" aria-hidden="true" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-xl px-4 py-3 ${
                          isUser
                            ? 'bg-[#1E3A8A] text-white'
                            : 'border border-stone-200 bg-[#FAF9F6] text-stone-800'
                        }`}
                      >
                        {isUser ? (
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        ) : (
                          <FormattedReply text={msg.text} />
                        )}
                        {msg.timestamp && (
                          <p
                            className={`mt-1.5 text-[11px] font-mono-tabular ${
                              isUser ? 'text-blue-200' : 'text-stone-400'
                            }`}
                          >
                            {msg.timestamp}
                          </p>
                        )}
                      </div>

                      {isUser && (
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white">
                          <User className="h-3.5 w-3.5" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-[#FAF9F6] text-[#1E3A8A]">
                      <Bot className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span>Consultando el catálogo y redactando respuesta...</span>
                  </div>
                )}
              </div>

              {chatError && (
                <div
                  role="alert"
                  className="border-t border-red-200 bg-red-50 px-5 py-2.5 text-xs text-red-900"
                >
                  {chatError}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t border-stone-200 bg-white p-3.5"
              >
                <label htmlFor="ai-chat-input" className="sr-only">
                  Escribe tu pregunta sobre sitios turísticos
                </label>
                <input
                  id="ai-chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregunta por costos en Gs., museos o un itinerario..."
                  disabled={loading}
                  className="flex-1 rounded-lg border border-stone-300 bg-[#FAF9F6] px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-[#1E3A8A] focus:bg-white focus:outline-none disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#172D6E] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
