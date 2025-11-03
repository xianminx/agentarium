from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return Response(
            {"error": str(exc), "type": exc.__class__.__name__},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    response.data["status_code"] = response.status_code
    response.data["error_type"] = exc.__class__.__name__
    return response
