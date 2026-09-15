import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, RotateCcw, X } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "deerva.assistant.conversation";
const CHAT_ID = "deerva-admin-assistant";

function loadMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as UIMessage[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const transport = new DefaultChatTransport({
  api: "/api/chat",
  fetch: async (input, init) => {
    const { data } = await supabase.auth.getSession();
    const headers = new Headers(init?.headers);
    if (data.session?.access_token) {
      headers.set("Authorization", `Bearer ${data.session.access_token}`);
    }
    return fetch(input, { ...init, headers });
  },
});

export default function AssistantBubble() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [initialMessages] = useState<UIMessage[]>(() => loadMessages());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: CHAT_ID,
    messages: initialMessages,
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage full or unavailable — the conversation still works in memory
    }
  }, [messages]);

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open, status]);

  function handleSubmit() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage({ text });
  }

  function startOver() {
    setMessages([]);
    setInput("");
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    textareaRef.current?.focus();
  }

  return (
    <>
      {open ? (
        <div className="fixed bottom-4 right-4 z-50 flex h-[min(34rem,calc(100vh-2rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-line bg-card shadow-lg">
          <header className="flex items-center gap-2 border-b border-line px-3 py-2">
            <img src="/favicon.png" alt="" className="h-5 w-5" />
            <span className="text-sm font-medium text-ink">Assistant</span>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={startOver}
                aria-label="Start over"
                title="Start over"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <Conversation className="flex-1">
            <ConversationContent className="gap-3 p-3">
              {messages.length === 0 ? (
                <p className="px-1 py-6 text-center text-sm text-stone">
                  Ask about the admin, Deerva&rsquo;s standards, your projects or your visitor
                  numbers.
                </p>
              ) : null}

              {messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <MessageResponse key={index}>{part.text}</MessageResponse>
                        );
                      }
                      if (part.type.startsWith("tool-")) {
                        const toolPart = part as unknown as {
                          type: `tool-${string}`;
                          state: Parameters<typeof ToolHeader>[0]["state"];
                          input?: unknown;
                          output?: unknown;
                          errorText?: string;
                        };
                        return (
                          <Tool key={index} defaultOpen={false}>
                            <ToolHeader type={toolPart.type} state={toolPart.state} />
                            <ToolContent>
                              <ToolInput input={toolPart.input} />
                              <ToolOutput
                                output={toolPart.output}
                                errorText={toolPart.errorText}
                              />
                            </ToolContent>
                          </Tool>
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
              ))}

              {status === "submitted" ? (
                <Shimmer className="px-1 text-sm">Thinking…</Shimmer>
              ) : null}

              {error ? (
                <p className="rounded-md border border-line bg-sand px-3 py-2 text-xs text-stone">
                  {error.message || "Something went wrong. Please try again."}
                </p>
              ) : null}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t border-line p-2">
            <PromptInput
              onSubmit={(_, event) => {
                event.preventDefault();
                handleSubmit();
              }}
            >
              <PromptInputTextarea
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about the admin or your data…"
              />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit
                  size="icon-sm"
                  status={status}
                  disabled={!input.trim() && !busy}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open assistant"
          className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-card text-ink shadow-lg transition-colors hover:bg-sand"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
