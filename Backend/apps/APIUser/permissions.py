from rest_framework.permissions import BasePermission


class OnlyUserRequestOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj == request.user
