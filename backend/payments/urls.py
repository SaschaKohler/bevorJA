from django.urls import path

from .views import create_checkout_session, stripe_config, stripe_webhook

urlpatterns = [
    path("config/", stripe_config, name="stripe-config"),
    path("create-checkout-session/", create_checkout_session, name="create-checkout-session"),
    path("webhook/", stripe_webhook, name="stripe-webhook"),
]
