import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertCircle, Info, AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SignalEvent {
  timestamp: string;
  signal_type: string;
  level: "info" | "warning" | "error";
  data: Record<string, string | number | boolean>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function SignalMonitor() {
  const { user } = useAuth();
  const [events, setEvents] = useState<SignalEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // if (!user?.is_superuser) {
    //   return;
    // }

    // Create EventSource for SSE
    const token = localStorage.getItem("token");
    const eventSource = new EventSource(
      `${API_BASE_URL}/stream/signals/?token=${token}`
    );

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      toast.success("Connected to signal stream");
    };

    eventSource.onmessage = (event) => {
      if (event.data.trim() === "") return; // Skip keepalive messages

      try {
        const signalEvent: SignalEvent = JSON.parse(event.data);
        setEvents((prev) => [...prev, signalEvent]);
      } catch (error) {
        console.error("Failed to parse event:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      toast.error("Connection to signal stream lost");
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [user]);

  useEffect(() => {
    if (autoScroll) {
      eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [events, autoScroll]);

  const clearEvents = () => {
    setEvents([]);
    toast.info("Events cleared");
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "warning":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // if (!user?.is_superuser) {
  //   return (
  //     <div className="container mx-auto max-w-6xl px-4 py-8">
  //       <Card className="border-red-500/50 bg-red-900/10">
  //         <CardHeader>
  //           <CardTitle className="text-red-500 flex items-center gap-2">
  //             <AlertCircle className="h-6 w-6" />
  //             Access Denied
  //           </CardTitle>
  //           <CardDescription className="text-red-400">
  //             You need superuser privileges to access the signal monitoring
  //             dashboard.
  //           </CardDescription>
  //         </CardHeader>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-100">
              <Activity className="h-8 w-8" />
              System Signal Monitor
            </h1>
            <p className="text-slate-400 mt-2">
              Real-time monitoring of system-level signals and authentication
              events
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant={isConnected ? "default" : "secondary"}
              className={
                isConnected
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-slate-500/10 text-slate-500 border-slate-500/20"
              }
            >
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className="border-white/10 hover:bg-slate-800"
            >
              Auto-scroll: {autoScroll ? "On" : "Off"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearEvents}
              className="border-white/10 hover:bg-slate-800"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-white/10 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-slate-100">Signal Events</CardTitle>
          <CardDescription className="text-slate-400">
            Live stream of authentication and system signals
            {events.length > 0 && ` (${events.length} events)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Waiting for signal events...</p>
              <p className="text-sm mt-2">
                Events will appear here as they occur in the system
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-4">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="border border-white/10 rounded-lg p-4 bg-slate-900/80 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Badge
                        className={`${getLevelColor(event.level)} flex items-center gap-1 mt-1`}
                      >
                        {getLevelIcon(event.level)}
                        {event.level}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-slate-200">
                            {event.signal_type.replace(/_/g, " ").toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          {Object.entries(event.data).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-slate-400 font-medium min-w-[120px]">
                                {key}:
                              </span>
                              <span className="text-slate-300">
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 whitespace-nowrap">
                      {formatTimestamp(event.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={eventsEndRef} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
