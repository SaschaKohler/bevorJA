"""Simple token-based auth for admin"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """Login with admin password and return token"""
    password = request.data.get('password')
    
    # Simple password check - in production use proper user auth
    # For now, we check against a hardcoded admin password
    admin_password = 'admin'  # Should match VITE_ADMIN_PASSWORD
    
    if password != admin_password:
        return Response(
            {'error': 'Invalid password'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Get or create a default admin user
    from django.contrib.auth.models import User
    user, created = User.objects.get_or_create(
        username='admin',
        defaults={'is_staff': True, 'is_superuser': True}
    )
    if created:
        user.set_password(admin_password)
        user.save()
    
    # Get or create token
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': {
            'username': user.username,
            'is_staff': user.is_staff,
        }
    })
