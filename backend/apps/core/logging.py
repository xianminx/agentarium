"""
Custom logging formatters and filters for enhanced logging.
"""
import logging


class RequestFormatter(logging.Formatter):
    """
    Custom formatter that adds username to log records for authenticated requests.
    Format: [timestamp] LEVEL method path status response_time username
    Example: [2025-11-06 15:30:42] INFO GET /api/auth/me/ 200 22ms john
    """

    def format(self, record):
        # Add username to the record if available
        if hasattr(record, "request"):
            request = record.request
            if hasattr(request, "user") and request.user.is_authenticated:
                record.username = request.user.username
            else:
                record.username = "anonymous"
        else:
            record.username = ""

        return super().format(record)


class UserFilter(logging.Filter):
    """
    Filter that adds user information to log records from requests.
    """

    def filter(self, record):
        # Try to get user from record if it exists
        if hasattr(record, "request"):
            request = record.request
            if hasattr(request, "user") and request.user.is_authenticated:
                record.username = request.user.username
                record.user_id = request.user.id
            else:
                record.username = "anonymous"
                record.user_id = None
        else:
            record.username = ""
            record.user_id = None

        return True
