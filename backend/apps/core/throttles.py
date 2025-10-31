from rest_framework.throttling import SimpleRateThrottle

class UserTokenRateThrottle(SimpleRateThrottle):
    scope = "user_token"

    def get_cache_key(self, request, view):
        # If using token-based auth, throttle per token; otherwise per user
        ident = None
        if getattr(request, "auth", None):
            ident = str(request.auth)
        elif request.user and request.user.is_authenticated:
            ident = str(request.user.pk)
        if ident is None:
            return None
        return self.cache_format % {"scope": self.scope, "ident": ident}

    