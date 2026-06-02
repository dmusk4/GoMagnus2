
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot, Loader2, ChevronRight } from 'lucide-react';
import { Product, Language, StrategyStep, ChatMessage } from '../types';
import { translations } from '../translations';
import { generateExpertChatStream, getSuggestedPrompts, generateDynamicSuggestions } from '../services/chatService';

interface ExpertChatProps {
    product: Product;
    language: Language;
    activeStep: StrategyStep;
    onUpdateProduct?: (updates: Partial<Product>) => void;
}

export const ExpertChat: React.FC<ExpertChatProps> = ({ product, language, activeStep, onUpdateProduct }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(product.chatHistory || []);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
    const abortControllerRef = useRef<boolean>(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const t = translations[language];

    const initialPrompts = getSuggestedPrompts(product, language, activeStep);

    useEffect(() => {
        if (!isLoading) {
            setMessages(product.chatHistory || []);
        }
    }, [product.id, product.chatHistory, isLoading]);

    useEffect(() => {
        if (messages.length === 0) {
            setCurrentSuggestions(getSuggestedPrompts(product, language, activeStep));
        }
    }, [product, language, messages.length, activeStep]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleStopGeneration = () => {
        abortControllerRef.current = true;
        setIsLoading(false);
    };

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content };
        const updatedMessages = [...messages, userMessage];
        
        setMessages(updatedMessages);
        if (onUpdateProduct) {
            onUpdateProduct({ chatHistory: updatedMessages });
        }
        setInput("");
        setIsLoading(true);
        setCurrentSuggestions([]); 
        abortControllerRef.current = false;

        try {
            let fullResponse = "";
            const stream = generateExpertChatStream(product, updatedMessages, language);
            
            for await (const chunk of stream) {
                if (abortControllerRef.current) break;

                const isFirstChunk = fullResponse === "";
                fullResponse += chunk;

                setMessages(prev => {
                    const newMsgs = [...prev];
                    if (isFirstChunk) {
                        newMsgs.push({ role: 'model', content: fullResponse });
                    } else if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'model') {
                        newMsgs[newMsgs.length - 1] = { role: 'model', content: fullResponse };
                    }
                    return newMsgs;
                });
            }

            if (!abortControllerRef.current) {
                const historyForSugs: ChatMessage[] = [...updatedMessages, { role: 'model', content: fullResponse }];
                if (onUpdateProduct) {
                    onUpdateProduct({ chatHistory: historyForSugs });
                }
                const dynSugs = await generateDynamicSuggestions(product, historyForSugs, language);
                if (dynSugs.length > 0) {
                    setCurrentSuggestions(dynSugs);
                }
            }
        } catch (error) {
            if (!abortControllerRef.current) {
                console.error("Chat Error:", error);
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    const errMsgMsg = language === 'pt' ? "Desculpa, tive um erro ao processar. Tenta novamente." : "Sorry, I had an error processing that. Please try again.";
                    if (lastMsg && lastMsg.role === 'model') {
                         newMsgs[newMsgs.length - 1] = { 
                            role: 'model', 
                            content: (lastMsg.content ? lastMsg.content + "\n\n" : "") + errMsgMsg
                        };
                    } else {
                        newMsgs.push({ 
                            role: 'model', 
                            content: errMsgMsg
                        });
                    }
                    if (onUpdateProduct) {
                        onUpdateProduct({ chatHistory: newMsgs });
                    }
                    return newMsgs;
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-10 right-32 w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-emerald-600 transition-colors"
                >
                    <MessageSquare size={28} />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full animate-pulse border-2 border-white" />
                </motion.button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={containerRef}
                        initial={{ opacity: 0, scale: 0.9, y: 50, x: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50, x: 50 }}
                        className="fixed bottom-28 right-10 w-[480px] max-w-[95vw] h-[750px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-[60] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 bg-indigo-600 text-white flex items-center justify-between shadow-lg relative">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <MessageSquare size={22} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base leading-tight">{t.common.expertChat}</h3>
                                    <div className="flex items-center space-x-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 italic truncate max-w-[150px]">{product.name}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth bg-gray-50/50"
                        >
                            {messages.length === 0 && (
                                <div className="space-y-6 py-4">
                                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <p className="text-sm font-medium text-gray-700 leading-relaxed italic">
                                            {language === 'pt' 
                                                ? `Olá! Sou o teu especialista estratégico. Conheço todos os detalhes do projeto "${product.name || 'este produto'}" e estou pronto para levar a tua estratégia ao próximo nível.`
                                                : `Hi! I'm your strategic advisor. I know all the details of "${product.name || 'this product'}" and I'm ready to take your strategy to the next level.`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[85%] space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-violet-100 text-violet-600'}`}>
                                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-[14px] leading-relaxed font-medium shadow-sm border prose prose-sm max-w-none ${
                                            msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white border-indigo-500 text-right prose-invert' 
                                            : 'bg-white text-gray-700 border-gray-100'
                                        }`}>
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {!isLoading && currentSuggestions.length > 0 && (
                                <div className="space-y-3 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex items-center space-x-2 px-1">
                                        <Sparkles size={12} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                            {t.common.chatSuggestions}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {currentSuggestions.map((prompt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSendMessage(prompt)}
                                                className="text-left px-4 py-2.5 rounded-xl bg-white border border-gray-100 text-xs font-bold text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm flex items-center group max-w-full"
                                            >
                                                <span className="truncate">{prompt}</span>
                                                <ChevronRight size={14} className="ml-1.5 text-gray-300 group-hover:text-emerald-500 flex-shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isLoading && messages[messages.length - 1]?.role !== 'model' && (
                                <div className="flex justify-start">
                                    <div className="flex max-w-[85%] space-x-2">
                                        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-violet-100 text-violet-600">
                                            <Bot size={16} />
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                            <Loader2 size={18} className="animate-spin text-indigo-600" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage(input);
                                }}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={language === 'pt' ? "Escreve a tua mensagem..." : "Type your message..."}
                                    className="flex-1 bg-gray-100 border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-md active:scale-95"
                                >
                                    <Send size={18} />
                                </button>
                                {isLoading && (
                                    <button
                                        type="button"
                                        onClick={handleStopGeneration}
                                        className="px-3 h-11 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-all border border-rose-100 text-xs font-bold"
                                    >
                                        <X size={16} className="mr-1" />
                                        {t.common.stop}
                                    </button>
                                )}
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
