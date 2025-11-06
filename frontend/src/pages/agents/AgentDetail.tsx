import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRunTask } from "@/hooks/useMutations";
import { useTaskStream } from "@/hooks/useTaskStream";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, ArrowLeft, Bot, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  status?: "pending" | "running" | "completed" | "failed";
  timestamp: string;
}

export function AgentDetail() {
  const { id } = useParams({ from: "/dashboard/agents/$id" });
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const runTask = useRunTask();
  const taskUpdates = useTaskStream();

  // Fetch agent details
  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ["agent", id],
    queryFn: async () => {
      const { data } = await api.get(`/agents/${id}/`);
      return data;
    },
  });

  // Fetch agent's task history
  const { data: tasksData } = useQuery({
    queryKey: ["tasks", { agent: id }],
    queryFn: async () => {
      const { data } = await api.get("/tasks/", { params: { agent: id } });
      return data;
    },
  });

  // Load existing tasks as messages
  useEffect(() => {
    if (tasksData?.results) {
      const taskMessages: Message[] = [];
      tasksData.results.forEach((task: any) => {
        // Add user message
        taskMessages.push({
          id: task.id * 2,
          role: "user",
          content: task.input_text,
          timestamp: task.created_at,
        });
        // Add assistant message if there's output
        if (task.output_text || task.status !== "pending") {
          taskMessages.push({
            id: task.id * 2 + 1,
            role: "assistant",
            content: task.output_text || "",
            status: task.status,
            timestamp: task.finished_at || task.started_at || task.created_at,
          });
        }
      });
      setMessages(taskMessages.reverse());
    }
  }, [tasksData]);

  // Update messages with SSE updates
  useEffect(() => {
    if (taskUpdates.length > 0) {
      taskUpdates.forEach((update) => {
        if (update.agent === parseInt(id)) {
          setMessages((prev) => {
            const assistantMessageId = update.id * 2 + 1;
            const existing = prev.find((m) => m.id === assistantMessageId);

            if (existing) {
              // Update existing message
              return prev.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: update.output_text || m.content,
                      status: update.status,
                      timestamp: update.finished_at || update.started_at || m.timestamp,
                    }
                  : m
              );
            } else {
              // Add new assistant message
              return [
                ...prev,
                {
                  id: assistantMessageId,
                  role: "assistant",
                  content: update.output_text || "",
                  status: update.status,
                  timestamp: update.finished_at || update.started_at || update.created_at,
                },
              ];
            }
          });
        }
      });
    }
  }, [taskUpdates, id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");

    // Add user message immediately
    const tempId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ]);

    // Add pending assistant message
    setMessages((prev) => [
      ...prev,
      {
        id: tempId + 1,
        role: "assistant",
        content: "",
        status: "pending",
        timestamp: new Date().toISOString(),
      },
    ]);

    try {
      await runTask.mutateAsync({
        agent: parseInt(id),
        input_text: userMessage,
      });
    } catch (error: any) {
      console.error("Failed to run task:", error);
      toast.error("Failed to send message. Please try again.");
      // Remove the pending messages on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId && m.id !== tempId + 1));
    }
  };

  if (agentLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-slate-400">Agent not found</p>
        <Button onClick={() => navigate({ to: "/dashboard/agents" })}>
          Back to Agents
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/dashboard/agents" })}
              className="text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">{agent.name}</h1>
                <p className="text-sm text-slate-400">
                  {agent.model} • Temperature: {agent.temperature}
                </p>
              </div>
            </div>
          </div>
          {agent.description && (
            <p className="text-sm text-slate-400 max-w-md">{agent.description}</p>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <Bot className="h-16 w-16 text-slate-600" />
            <div>
              <p className="text-lg font-semibold text-slate-300">
                Start a conversation with {agent.name}
              </p>
              <p className="text-sm text-slate-500">
                Type a message below to get started
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-indigo-500"
                      : "bg-gradient-to-r from-purple-500 to-pink-500"
                  }`}
                >
                  {message.role === "user" ? (
                    <UserIcon className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-100"
                  }`}
                >
                  {message.role === "assistant" && message.status && (
                    <div className="mb-2">
                      <Badge
                        variant={
                          message.status === "completed"
                            ? "default"
                            : message.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {message.status === "running" && (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        )}
                        {message.status}
                      </Badge>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">
                    {message.content || (
                      <span className="text-slate-400 italic">Processing...</span>
                    )}
                  </p>
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-slate-900/50 px-6 py-4">
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${agent.name}...`}
            disabled={runTask.isPending}
            className="flex-1 bg-slate-800/50 border-white/10 text-slate-100 placeholder:text-slate-500"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || runTask.isPending}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500"
          >
            {runTask.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}