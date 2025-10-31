from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission: only owners can edit/delete.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions allowed to any authenticated user if you want,
        # but here we restrict read to owner as well:
        if request.method in permissions.SAFE_METHODS:
            return obj.owner == request.user
        return obj.owner == request.user
