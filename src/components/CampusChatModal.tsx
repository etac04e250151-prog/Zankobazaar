import React, { useState } from 'react';
import { ListingItem, Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { 
  X, 
  Send, 
  Sparkles, 
  BadgeCheck, 
} from 'lucide-react';

interface CampusChatModalProps {
  item: ListingItem;
  language: Language;
  onClose: () => void;
  onMessageReceived?: (messageText: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'me' | 'seller';
  text: string;
  time: string;
}

export const CampusChatModal: React.FC<CampusChatModalProps> = ({
  item,
  language,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const c = t.chatModal;

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'seller',
      text:
        language === 'ku'
          ? `سڵاو بەڕێزم، بەخێربێیت! ئەگەر هەر پرسیارێکت لەسەر «${item.title.ku || item.title.en}» هەیە فەرموو، دەتوانین لەناو زانکۆ ڕادەستی بکەین.`
          : language === 'ar'
          ? `أهلاً بك! إذا كان لديك أي استفسار حول «${item.title.ar || item.title.en}» تفضل، بإمكاننا التنسيق للتسليم داخل الحرم الجامعي.`
          : `Hello! If you have any questions regarding "${item.title.en}", feel free to ask. We can meet on campus for inspection.`,
      time: '12:30 PM',
    },
  ]);

  const [aiSuggestions, setAiSuggestions] = useState<string[]>(
    language === 'ku'
      ? [
          'سڵاو، ئایا دەتوانین سبەی لە کتێبخانەی زانکۆ چاوپێکەوتن بکەین؟',
          'ئایا دەکرێت داشکاندنێکی خوێندکارانەم بۆ بکەیت؟',
          'ئایا هەموو بەش و کەرەستە ڕەسەنەکانی لەگەڵدایە؟',
        ]
      : language === 'ar'
      ? [
          'مرحباً، هل يمكننا اللقاء غداً عند المكتبة المركزية للمعاينة؟',
          'هل يوجد مجال لمراعاة السعر ومراعاة ظروف الطلبة؟',
          'هل كافة الملحقات والصفحات سليمة وموجودة؟',
        ]
      : [
          'Hi! Can we meet tomorrow at the university library for inspection?',
          'Is the price negotiable for fellow students?',
          'Are all original components and pages intact?',
        ]
  );

  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleFetchAiDealAdvice = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/deal-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemTitle: item.title[language] || item.title.en,
          price: `${item.priceIqd} IQD`,
          userRole: 'buyer',
          language,
        }),
      });

      const json = await res.json();
      if (json.success && json.data && json.data.suggestedReplies) {
        setAiSuggestions(json.data.suggestedReplies);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputMessage('');

    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'seller',
        text:
          language === 'ku'
            ? 'زۆر باشە بەڕێزم! لە کاتژمێر ١١ی بەیانی لە بەردەم کتێبخانەی ناوەندی EPU چاوەڕێت دەکەم بۆ ئەوەی کەلوپەلەکە بپشکنیت.'
            : language === 'ar'
            ? 'تمام أخي، أنا متواجد غداً الساعة 11 صباحاً أمام المكتبة المركزية لفحص وتجربة السلعة.'
            : 'Sounds great! I will be by the Central Library lobby at 11 AM tomorrow so you can test and inspect it.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[650px] max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Seller Info */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={item.seller.avatar}
                alt={item.seller.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.seller.name}</h4>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.seller.university}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Preview Strip */}
        <div className="px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/40 border-b border-indigo-100/60 dark:border-indigo-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              src={item.images[0]}
              alt="thumb"
              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-indigo-200 dark:border-indigo-800"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {item.title[language] || item.title.en}
            </span>
          </div>

          <div className="font-bold text-indigo-900 dark:text-indigo-300 font-mono shrink-0">
            {item.isFreeDonation ? (
              <span className="text-emerald-700 dark:text-emerald-400">Free</span>
            ) : (
              `${item.priceIqd.toLocaleString()} ${t.currency.iqd}`
            )}
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-slate-950/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  m.sender === 'me'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                {m.time}
              </span>
            </div>
          ))}
        </div>

        {/* AI Suggested Quick Replies */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-indigo-800 dark:text-indigo-300">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              {c.aiHelperTitle}
            </span>
            <button
              onClick={handleFetchAiDealAdvice}
              disabled={isLoadingAi}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer disabled:opacity-50"
            >
              {isLoadingAi ? '...' : language === 'ku' ? 'نوێکردنەوەی پێشنیارەکان' : 'Refresh AI'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {aiSuggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="text-[11px] text-slate-700 dark:text-slate-300 hover:text-indigo-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 rounded-lg px-2.5 py-1 whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input & Send */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={c.typeMessagePlaceholder}
            className="flex-1 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl px-3.5 py-2.5 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim()}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl transition-all cursor-pointer disabled:opacity-40"
            title={c.send}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
