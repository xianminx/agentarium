# apps/core/serializers/fields.py

from rest_framework import serializers

class NestedRelatedField(serializers.RelatedField):
    """
    General-purpose DRF field for nested and writable related objects.

    Features:
    - Serializes related objects as nested data using a specified serializer
    - Deserializes input as primary key(s)
    - Supports ForeignKey and ManyToMany
    - Accepts input as:
        - Raw ID: 3
        - Object with ID: {"id": 3}
    - Optional: allow_null for nullable relations

    Usage:

    class TaskSerializer(serializers.ModelSerializer):
        assigned_to = NestedRelatedField(UserSerializer, allow_null=True)
        collaborators = NestedRelatedField(UserSerializer, many=True)

        class Meta:
            model = Task
            fields = ["id", "title", "assigned_to", "collaborators"]
    """

    def __init__(self, serializer_class, many=False, **kwargs):
        self.serializer_class = serializer_class
        self.many = many
        self.allow_null = kwargs.pop("allow_null", False)

        # Auto-detect model and queryset from serializer
        model = getattr(serializer_class.Meta, "model", None)
        queryset = model.objects.all() if model else None

        # Underlying PrimaryKeyRelatedField for write operations
        self.pk_field = serializers.PrimaryKeyRelatedField(
            queryset=queryset, many=many, allow_null=self.allow_null
        )

        super().__init__(queryset=queryset, many=many, **kwargs)

    def to_representation(self, value):
        """Serialize related object(s) as nested data using the nested serializer."""
        serializer = self.serializer_class(value, many=self.many, context=self.context)
        return serializer.data

    def to_internal_value(self, data):
        if data is None:
            if self.allow_null:
                return None
            raise serializers.ValidationError("This field requires a value.")
        if self.many and data == []:
            return []
        if isinstance(data, dict):
            data = data.get("id")
        if data is None:
            raise serializers.ValidationError("This field requires an 'id' value.")
        return self.pk_field.to_internal_value(data)