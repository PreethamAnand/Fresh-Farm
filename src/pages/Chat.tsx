import AppLayout from "@/components/layout/AppLayout";
import { Send, Paperclip, Phone, MoreVertical, ShieldCheck, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { getConversations, getMessages, sendMessage, type ChatMessage, type Conversation } from "@/lib/api";

const Chat = () => {
  const [selectedConv, setSelectedConv] = useState<string>("");
  const [message, setMessage] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const activeConv = conversations.find((c) => c.id === selectedConv);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await getConversations();
        setConversations(response.conversations);
        if (response.conversations.length > 0) {
          setSelectedConv(response.conversations[0].id);
        }
      } catch (error) {
        toast({
          title: "Unable to load chats",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    };

    void loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedConv) return;

    const loadMessages = async () => {
      try {
        const response = await getMessages(selectedConv);
        setMessages(response.messages);
      } catch (error) {
        toast({
          title: "Unable to load messages",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    };

    void loadMessages();
  }, [selectedConv]);

  const handleSendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || !selectedConv) return;

    try {
      const response = await sendMessage(selectedConv, trimmed);
      setMessages((prev) => [...prev, response.message]);
      setMessage("");
    } catch (error) {
      toast({
        title: "Unable to send message",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const ConversationList = () => (
    <div className="space-y-1">
      {conversations.map((conv) => (
        <button
          key={String(conv.id)}
          onClick={() => {
            setSelectedConv(String(conv.id));
            setMobileShowChat(true);
          }}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
            selectedConv === conv.id ? "bg-primary/5" : "hover:bg-muted"
          }`}
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center text-xl">
              {conv.avatar}
            </div>
            {conv.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary border-2 border-card" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground flex items-center gap-1 truncate">
                {conv.name}
                {conv.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
              {conv.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                  {conv.unread}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  const ChatWindow = () => (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button
          onClick={() => setMobileShowChat(false)}
          aria-label="Back to conversations"
          className="lg:hidden p-1.5 rounded-lg hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {activeConv && (
        <>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
            {activeConv.avatar}
          </div>
          {activeConv.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1">
            {activeConv.name}
            {activeConv.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
          </p>
          <p className="text-xs text-muted-foreground">{activeConv.farm}</p>
        </div>
        <button
          onClick={() => toast({ title: "Calling...", description: `Calling ${activeConv.name}` })}
          aria-label="Call user"
          className="p-2 rounded-lg hover:bg-muted"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            toast({
              title: "Conversation options",
              description: "Mute, archive, and report actions can be added here.",
            })
          }
          aria-label="Conversation options"
          className="p-2 rounded-lg hover:bg-muted"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              toast({
                title: "Attachment picker",
                description: "File upload can be connected here.",
              })
            }
            aria-label="Attach file"
            className="p-2 rounded-lg hover:bg-muted"
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 py-2.5 px-4 rounded-xl bg-muted text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => void handleSendMessage()}
            aria-label="Send message"
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto lg:px-6 lg:py-6 h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)]">
        <div className="flex h-full lg:rounded-2xl lg:border lg:border-border overflow-hidden bg-card">
          {/* Conversation list */}
          <div className={`w-full lg:w-80 xl:w-96 border-r border-border p-3 overflow-y-auto ${mobileShowChat ? "hidden lg:block" : ""}`}>
            <h2 className="font-display font-bold text-lg text-foreground px-3 py-2">Messages</h2>
            <ConversationList />
          </div>

          {/* Chat area */}
          <div className={`flex-1 ${!mobileShowChat ? "hidden lg:flex" : "flex"}`}>
            <div className="flex-1 flex flex-col">
              <ChatWindow />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;
