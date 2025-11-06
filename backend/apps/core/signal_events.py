"""
Signal event queue for streaming system signals to monitoring dashboard.
"""
import json
from collections import deque
from datetime import datetime
from threading import Lock
from typing import Any, Dict


class SignalEventQueue:
    """
    Thread-safe queue for collecting signal events.
    Keeps the last 1000 events in memory for streaming to clients.
    """

    def __init__(self, maxlen: int = 1000):
        self.events = deque(maxlen=maxlen)
        self.lock = Lock()

    def add_event(
        self,
        signal_type: str,
        event_data: Dict[str, Any],
        level: str = "info",
    ):
        """
        Add a signal event to the queue.

        Args:
            signal_type: Type of signal (e.g., 'user_logged_in', 'user_logged_out')
            event_data: Dictionary containing event details
            level: Log level ('info', 'warning', 'error')
        """
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "signal_type": signal_type,
            "level": level,
            "data": event_data,
        }

        with self.lock:
            self.events.append(event)

    def get_events(self, since_index: int = 0) -> list:
        """
        Get events since a specific index.

        Args:
            since_index: Return events after this index

        Returns:
            List of events since the given index
        """
        with self.lock:
            if since_index < len(self.events):
                return list(self.events)[since_index:]
            return []

    def get_all_events(self) -> list:
        """Get all events in the queue."""
        with self.lock:
            return list(self.events)

    def clear(self):
        """Clear all events from the queue."""
        with self.lock:
            self.events.clear()


# Global signal event queue instance
signal_event_queue = SignalEventQueue()
