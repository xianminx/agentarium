from rest_framework.throttling import SimpleRateThrottle

class UserTokenRateThrottle(SimpleRateThrottle):
    scope = "user_token"

    def get_cache_key(self, request, view):
        if not request.user or not request.auth:
            return None
        # request.auth may be token-like; pick unique token id
        # TODO: fix how to use this token based throttling
        ident = str(request.auth)
        return self.cache_format % {
            "scope": self.scope,
            "ident": ident
        }
