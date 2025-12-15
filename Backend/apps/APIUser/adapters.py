from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import perform_login
from allauth.socialaccount.models import SocialAccount
from django.contrib.auth import get_user_model

User = get_user_model()

class GoogleAutoLinkAdapter(DefaultSocialAccountAdapter):
    """
    Custom adapter to resolver existing email conflict.
    If the user tries to log in with Google account and the e-mail already exists in the database (by password),
    the software links the Goggle acc to the existing one instead of failing.
    """

    def pre_social_login(self, request, sociallogin):
        if request.user.is_authenticated:
            return

        email = sociallogin.account.extra_data.get('email')
        
        if email:
            try:
                user = User.objects.get(email=email)
                
                if not SocialAccount.objects.filter(user=user, provider=sociallogin.account.provider).exists():
                    sociallogin.connect(request, user)
            except User.DoesNotExist:
                pass