import django_filters
from .models import Item

class ItemFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')
    location = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.CharFilter(lookup_expr='iexact')
    item_type = django_filters.CharFilter(lookup_expr='iexact')
    status = django_filters.CharFilter(lookup_expr='iexact')
    date_from = django_filters.DateFilter(field_name='date_lost_or_found', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date_lost_or_found', lookup_expr='lte')
    exact_date = django_filters.DateFilter(field_name='date_lost_or_found', lookup_expr='exact')
    user = django_filters.NumberFilter(field_name='user__id')

    class Meta:
        model = Item
        fields = ['item_type', 'category', 'status', 'location', 'user']
